import { Session, IPullRequest, PullRequestStatus } from '../models/session.model';
import * as containerService from './container.service';
import { createGithubClient, parseRepository } from '../lib/github';
import { AppError } from '../errors/AppError';
import { emitLiveEvent } from '../sockets/socket.emitter';
import { appendTerminalLine } from './terminal-logger.service';

export interface CreatePRParams {
  sessionId: string;
  accessToken: string;
  title?: string;
  body?: string;
}

function getTimeHeader(): string {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `[${hours}:${minutes}:${seconds}]`;
}

export const createOrUpdatePullRequest = async (
  params: CreatePRParams
): Promise<IPullRequest> => {
  const session = await Session.findById(params.sessionId);
  if (!session) {
    throw new AppError(404, `Session ${params.sessionId} not found`);
  }

  if (!session.containerId) {
    throw new AppError(400, 'Session container is not ready');
  }

  const runIdStr = session.latestRunId?.toString() || '';
  const branchName = session.pullRequest?.branchName || `axray/session/${params.sessionId}`;
  const baseBranch = session.branch || 'main';
  const { owner, repo } = parseRepository(session.repositoryFullName);

  const containerId = session.containerId;

  // Pre-flight check: Verify if workspace has uncommitted edits or new local commits
  const statusCheck = await containerService.executeCommand(containerId, 'cd /workspace && git status --porcelain');
  const hasUncommittedChanges = statusCheck.exitCode === 0 && statusCheck.output.trim().length > 0;

  const cherryCheck = await containerService.executeCommand(containerId, `cd /workspace && (git cherry origin/${baseBranch} || true)`);
  const hasUnpushedCommits = cherryCheck.output.trim().length > 0;

  if (!hasUncommittedChanges && !hasUnpushedCommits && !session.pullRequest) {
    appendTerminalLine(
      params.sessionId,
      runIdStr,
      'agent',
      `${getTimeHeader()} Workspace clean. No code changes to push for Pull Request.`
    );
    throw new AppError(400, 'No changes to be pushed. The workspace has no modified code files.');
  }

  // 1. Emit PR Creation Started & Terminal Log
  emitLiveEvent(params.sessionId, {
    sessionId: params.sessionId,
    runId: runIdStr,
    timestamp: new Date().toISOString(),
    eventType: 'pr.creation.started',
    phase: 'git',
    status: 'running',
    title: 'Creating Pull Request',
    description: 'Creating/Updating GitHub Pull Request branch...',
    metadata: { branchName, repository: session.repositoryFullName },
  });

  appendTerminalLine(
    params.sessionId,
    runIdStr,
    'agent',
    `${getTimeHeader()} Creating pull request for ${session.repositoryFullName}...`
  );

  try {
    // Configure Git user in workspace container
    await containerService.executeCommand(
      containerId,
      'git -C /workspace config user.name "AXRAY Agent" && git -C /workspace config user.email "agent@axray.dev"'
    );

    // 2. Checkout or Create PR Branch
    appendTerminalLine(
      params.sessionId,
      runIdStr,
      'command',
      `${getTimeHeader()} Creating branch:\n${branchName}`
    );

    const checkoutRes = await containerService.executeCommand(
      containerId,
      `cd /workspace && (git checkout ${branchName} || git checkout -b ${branchName})`
    );

    if (checkoutRes.exitCode !== 0) {
      appendTerminalLine(params.sessionId, runIdStr, 'stderr', checkoutRes.output);
    } else {
      appendTerminalLine(params.sessionId, runIdStr, 'stdout', `Switched to branch '${branchName}'`);
    }

    emitLiveEvent(params.sessionId, {
      sessionId: params.sessionId,
      runId: runIdStr,
      timestamp: new Date().toISOString(),
      eventType: 'pr.branch.created',
      phase: 'git',
      status: 'completed',
      title: 'PR Branch Created',
      description: `Branch ${branchName} ready`,
      metadata: { branchName },
    });

    // 3. Git Add & Commit Workspace Changes
    appendTerminalLine(params.sessionId, runIdStr, 'command', `${getTimeHeader()} Committing changes:\nfeat: agent generated changes`);
    await containerService.executeCommand(containerId, 'cd /workspace && git add .');

    const commitRes = await containerService.executeCommand(
      containerId,
      'cd /workspace && git commit -m "feat: agent generated changes" || true'
    );

    if (commitRes.output.includes('nothing to commit')) {
      appendTerminalLine(params.sessionId, runIdStr, 'stdout', 'No new uncommitted changes found. Using existing commits.');
    } else {
      appendTerminalLine(params.sessionId, runIdStr, 'stdout', commitRes.output);
    }

    // Get current commit SHA
    const revParseRes = await containerService.executeCommand(containerId, 'cd /workspace && git rev-parse HEAD');
    const commitHash = revParseRes.exitCode === 0 ? revParseRes.output.trim() : undefined;

    emitLiveEvent(params.sessionId, {
      sessionId: params.sessionId,
      runId: runIdStr,
      timestamp: new Date().toISOString(),
      eventType: 'pr.commit.created',
      phase: 'git',
      status: 'completed',
      title: 'Changes Committed',
      description: commitHash ? `Commit ${commitHash.substring(0, 7)}` : 'Committed workspace edits',
      metadata: { commitHash },
    });

    // 4. Push Branch to GitHub Remote
    emitLiveEvent(params.sessionId, {
      sessionId: params.sessionId,
      runId: runIdStr,
      timestamp: new Date().toISOString(),
      eventType: 'pr.push.started',
      phase: 'git',
      status: 'running',
      title: 'Pushing to GitHub',
      description: `Pushing ${branchName} to GitHub...`,
    });

    appendTerminalLine(
      params.sessionId,
      runIdStr,
      'command',
      `${getTimeHeader()} Pushing branch...`
    );

    const pushRes = await containerService.executeCommand(
      containerId,
      `cd /workspace && git push https://${params.accessToken}@github.com/${session.repositoryFullName}.git ${branchName}:${branchName} --force-with-lease`
    );

    if (pushRes.exitCode !== 0) {
      appendTerminalLine(params.sessionId, runIdStr, 'stderr', pushRes.output);
      appendTerminalLine(params.sessionId, runIdStr, 'error', `Git push failed: ${pushRes.output}`);
      throw new AppError(500, `Git push to GitHub failed: ${pushRes.output}`);
    }

    appendTerminalLine(params.sessionId, runIdStr, 'stdout', `Pushed branch '${branchName}' to remote origin.`);

    emitLiveEvent(params.sessionId, {
      sessionId: params.sessionId,
      runId: runIdStr,
      timestamp: new Date().toISOString(),
      eventType: 'pr.push.completed',
      phase: 'git',
      status: 'completed',
      title: 'Pushed to GitHub',
      description: `Successfully pushed ${branchName}`,
    });

    // 5. Create or Update GitHub Pull Request via Octokit API
    appendTerminalLine(
      params.sessionId,
      runIdStr,
      'command',
      `${getTimeHeader()} Creating GitHub pull request...`
    );

    const octokit = createGithubClient(params.accessToken);

    if (session.pullRequest && session.pullRequest.prNumber) {
      // Existing PR: verify / update status on GitHub
      const existingPr = session.pullRequest;
      existingPr.status = 'open';
      existingPr.lastSyncedCommit = commitHash || existingPr.lastSyncedCommit;
      existingPr.updatedAt = new Date();
      session.pullRequest = existingPr;
      await session.save();

      appendTerminalLine(
        params.sessionId,
        runIdStr,
        'success',
        `${getTimeHeader()}\nPR updated successfully\n\n#${existingPr.prNumber}\n${existingPr.prUrl}`
      );

      emitLiveEvent(params.sessionId, {
        sessionId: params.sessionId,
        runId: runIdStr,
        timestamp: new Date().toISOString(),
        eventType: 'pr.created',
        phase: 'git',
        status: 'completed',
        title: `PR #${existingPr.prNumber} Updated`,
        description: existingPr.prUrl,
        metadata: { prNumber: existingPr.prNumber, url: existingPr.prUrl },
      });

      return existingPr;
    }

    // Create New GitHub Pull Request
    const prTitle = params.title || `AXRAY Agent: Changes for ${session.branch}`;
    const prBody = params.body || `### AXRAY AI Agent Execution\n\nAutomated Pull Request created by AXRAY for session \`${params.sessionId}\`.`;

    const prResponse = await octokit.pulls.create({
      owner,
      repo,
      title: prTitle,
      body: prBody,
      head: branchName,
      base: baseBranch,
    });

    const newPr: IPullRequest = {
      provider: 'github',
      prNumber: prResponse.data.number,
      number: prResponse.data.number,
      prUrl: prResponse.data.html_url,
      branchName,
      sourceBranch: branchName,
      baseBranch,
      targetBranch: baseBranch,
      status: 'open',
      lastSyncedCommit: commitHash,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    session.pullRequest = newPr;
    await session.save();

    appendTerminalLine(
      params.sessionId,
      runIdStr,
      'success',
      `${getTimeHeader()}\nPR created successfully\n\n#${newPr.prNumber}\n${newPr.prUrl}`
    );

    emitLiveEvent(params.sessionId, {
      sessionId: params.sessionId,
      runId: runIdStr,
      timestamp: new Date().toISOString(),
      eventType: 'pr.created',
      phase: 'git',
      status: 'completed',
      title: `PR #${newPr.prNumber} Opened`,
      description: newPr.prUrl,
      metadata: { prNumber: newPr.prNumber, url: newPr.prUrl },
    });

    return newPr;
  } catch (error: any) {
    const errMessage = error?.message || String(error);

    emitLiveEvent(params.sessionId, {
      sessionId: params.sessionId,
      runId: runIdStr,
      timestamp: new Date().toISOString(),
      eventType: 'pr.failed',
      phase: 'git',
      status: 'failed',
      title: 'Pull Request Failed',
      description: errMessage,
      metadata: { error: errMessage },
    });

    appendTerminalLine(params.sessionId, runIdStr, 'error', `Pull Request creation failed: ${errMessage}`);

    if (session.pullRequest) {
      session.pullRequest.status = 'failed';
      session.pullRequest.updatedAt = new Date();
      await session.save();
    }

    throw error;
  }
};

/**
 * PR Status Synchronization Endpoint
 * Queries GitHub API to ensure local state reflects external merges / closures.
 */
export const getPullRequestStatus = async (
  sessionId: string,
  accessToken?: string
): Promise<IPullRequest | null> => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new AppError(404, `Session ${sessionId} not found`);
  }

  if (!session.pullRequest) {
    return null;
  }

  // If user token is available, query GitHub API for authoritative status
  if (accessToken && session.pullRequest.prNumber) {
    try {
      const { owner, repo } = parseRepository(session.repositoryFullName);
      const octokit = createGithubClient(accessToken);
      const { data } = await octokit.pulls.get({
        owner,
        repo,
        pull_number: session.pullRequest.prNumber,
      });

      let updatedStatus: PullRequestStatus = 'open';
      if (data.merged) {
        updatedStatus = 'merged';
      } else if (data.state === 'closed') {
        updatedStatus = 'closed';
      } else if (data.state === 'open') {
        updatedStatus = 'open';
      }

      if (session.pullRequest.status !== updatedStatus) {
        session.pullRequest.status = updatedStatus;
        session.pullRequest.updatedAt = new Date();
        await session.save();
      }
    } catch (err) {
      console.warn(`[GitHub PR Service] Failed to sync PR status from GitHub API:`, err);
    }
  }

  return session.pullRequest;
};
