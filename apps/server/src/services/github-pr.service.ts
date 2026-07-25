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

/**
 * Validates whether the workspace container contains uncommitted changes or unpushed commits.
 */
export const validateWorkspaceChanges = async (
  sessionId: string
): Promise<{ hasChanges: boolean; message: string }> => {
  const session = await Session.findById(sessionId);
  if (!session || !session.containerId) {
    return { hasChanges: false, message: 'Session container is not ready.' };
  }

  const containerId = session.containerId;

  // 1. Check uncommitted changes (git status --porcelain)
  const statusRes = await containerService.executeCommand(
    containerId,
    'cd /workspace && git status --porcelain'
  );
  const uncommittedOutput = statusRes.exitCode === 0 ? statusRes.output.trim() : '';

  if (uncommittedOutput.length > 0) {
    return { hasChanges: true, message: 'Workspace contains uncommitted changes.' };
  }

  // 2. Check unpushed commits against base branch or current diff
  const baseBranch = session.branch || 'main';
  const diffRes = await containerService.executeCommand(
    containerId,
    `cd /workspace && (git diff origin/${baseBranch} || git diff HEAD)`
  );
  const diffOutput = diffRes.exitCode === 0 ? diffRes.output.trim() : '';

  if (diffOutput.length > 0) {
    return { hasChanges: true, message: 'Workspace contains unpushed commits.' };
  }

  return {
    hasChanges: false,
    message: 'No code changes detected in workspace. Run an agent or modify files before creating a Pull Request.',
  };
};

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

  // Validate changes before proceeding
  const validation = await validateWorkspaceChanges(params.sessionId);
  if (!validation.hasChanges) {
    throw new AppError(400, validation.message);
  }

  const runIdStr = session.latestRunId?.toString() || '';
  const branchName = session.branch || 'main';
  const baseBranch = 'main';
  const { owner, repo } = parseRepository(session.repositoryFullName);

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
    `${getTimeHeader()} Creating pull request for ${session.repositoryFullName} (${branchName})...`
  );

  try {
    const containerId = session.containerId;

    // Configure Git user in workspace container
    await containerService.executeCommand(
      containerId,
      'git -C /workspace config user.name "AXRAY Agent" && git -C /workspace config user.email "agent@axray.dev"'
    );

    // 2. Git Add & Commit Workspace Changes
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

    // 3. Push Branch to GitHub Remote
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
      `${getTimeHeader()} Pushing branch ${branchName}...`
    );

    const pushRes = await containerService.executeCommand(
      containerId,
      `cd /workspace && git fetch origin && git push https://${params.accessToken}@github.com/${session.repositoryFullName}.git ${branchName}:${branchName} --force`
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

    // 4. Handle Direct Push to Default Branch or GitHub PR Creation
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

    if (branchName === baseBranch) {
      appendTerminalLine(
        params.sessionId,
        runIdStr,
        'success',
        `${getTimeHeader()}\nPushed changes directly to '${branchName}'. No PR needed against itself.`
      );
      const directPushPr: IPullRequest = {
        provider: 'github',
        prNumber: 0,
        number: 0,
        prUrl: `https://github.com/${session.repositoryFullName}/tree/${branchName}`,
        branchName,
        sourceBranch: branchName,
        baseBranch,
        targetBranch: baseBranch,
        status: 'merged',
        lastSyncedCommit: commitHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      session.pullRequest = directPushPr;
      await session.save();
      return directPushPr;
    }

    // Create New GitHub Pull Request
    const octokit = createGithubClient(params.accessToken);
    const prTitle = params.title || `AXRAY Agent: Changes for ${branchName}`;
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
