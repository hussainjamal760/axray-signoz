import { AgentRun } from '../models/agent-run.model';
import { Session } from '../models/session.model';
import * as containerService from './container.service';
import * as workspaceService from './workspace.service';
import * as agentService from './agent.service';
import * as gitService from './git.service';
import { tracer } from '../lib/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Runner Service
 * Orchestrates background execution by connecting Container, Workspace, Agent, Git, and Session services.
 */

export const executeRun = async (runId: string): Promise<void> => {
  console.log(`[Runner] Starting run execution for runId=${runId}`);

  const run = await AgentRun.findById(runId);
  if (!run) {
    console.error(`[Runner] AgentRun ${runId} not found`);
    return;
  }

  const session = await Session.findById(run.sessionId);
  if (!session) {
    console.error(`[Runner] Session ${run.sessionId} not found for runId=${runId}`);
    run.status = 'failed';
    run.errorMessage = 'Associated Session not found';
    await run.save();
    return;
  }

  const span = tracer.startSpan('agent.run', {
    attributes: {
      'run.id': runId,
      'session.id': session._id.toString(),
      'repository.name': session.repositoryFullName,
      'git.branch': session.branch,
    },
  });

  try {
    // 1. Ensure Container exists and is running
    const { containerId, containerStatus } = await containerService.ensureContainerRunning({
      containerId: session.containerId,
      repositoryFullName: session.repositoryFullName,
      branch: session.branch,
    });

    if (session.containerId !== containerId || session.containerStatus !== containerStatus) {
      session.containerId = containerId;
      session.containerStatus = containerStatus;
      await session.save();
    }

    // 2. Ensure Workspace Initialized (clone, checkout, AI workspace spec, dependency install)
    if (!session.workspaceInitialized) {
      console.log(`[Runner] Preparing workspace for session ${session._id}...`);
      const { spec } = await workspaceService.prepareWorkspace({
        repositoryFullName: session.repositoryFullName,
        branch: session.branch,
        containerId: session.containerId!,
      });
      
      // Update MongoDB Session document after workspace preparation succeeds
      session.workspaceSpec = spec;
      session.workspaceInitialized = true;
      await session.save();
    } else {
      console.log(`[Runner] Workspace already initialized for session ${session._id}. Skipping preparation.`);
    }

    // 3. Transition run status to running
    run.status = 'running';
    run.startedAt = new Date();
    run.containerId = session.containerId;
    await run.save();

    console.log(`[Runner] Executing Groq AI agent for run ${run._id} in container ${session.containerId}`);

    // 4. Delegate prompt execution to AgentService
    const result = await agentService.executePrompt({
      containerId: session.containerId!,
      prompt: run.prompt,
    });

    // 5. Capture Git Diff with Size Truncation Check
    try {
      const gitDiff = await gitService.getDiff(session.containerId!);
      run.diff = gitDiff.rawDiff;
      run.filesChanged = gitDiff.filesChanged;
      run.insertions = gitDiff.insertions;
      run.deletions = gitDiff.deletions;
      run.diffTruncated = gitDiff.truncated;
      run.diffSize = gitDiff.diffSize;
      run.changeSummary = gitDiff.changeSummary;
    } catch (gitErr) {
      console.warn('[Runner Warning] Failed to capture git diff:', gitErr);
    }

    // 6. Complete run
    run.status = 'completed';
    run.response = result.response;
    run.tokensUsed = result.tokensUsed;
    run.completedAt = new Date();
    if (run.startedAt) {
      run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    }
    await run.save();

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    console.log(`[Runner] Run ${run._id} completed successfully in ${run.durationMs}ms with diff (${run.changeSummary}).`);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Runner] Execution failed for run ${runId}:`, errMessage);

    run.status = 'failed';
    run.errorMessage = errMessage;
    run.completedAt = new Date();
    if (run.startedAt) {
      run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    }
    await run.save();

    span.setStatus({ code: SpanStatusCode.ERROR, message: errMessage });
    span.end();
  }
};
