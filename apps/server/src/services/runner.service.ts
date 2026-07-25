import { AgentRun } from '../models/agent-run.model';
import { Session } from '../models/session.model';
import * as containerService from './container.service';
import * as workspaceService from './workspace.service';
import * as agentService from './agent.service';
import * as gitService from './git.service';
import { tracer, emitAgentLog } from '../lib/telemetry';
import { AXRAY_ATTRIBUTES } from '../lib/telemetry-attributes';
import { SpanStatusCode } from '@opentelemetry/api';
import { emitLiveEvent } from '../sockets/socket.emitter';
import {
  initRunTerminal,
  appendTerminalLine,
  flushAndPersistTerminalOutput,
} from './terminal-logger.service';

/**
 * Runner Service
 * Orchestrates background execution by connecting Container, Workspace, Agent, Git, and Session services.
 * Emits live Socket.IO events for Session Dashboard real-time updates.
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

  const sessionIdStr = session._id.toString();

  // Initialize terminal logger buffer for this run
  initRunTerminal(runId);
  appendTerminalLine(sessionIdStr, runId, 'agent', `Task Prompt: "${run.prompt}"`);

  const span = tracer.startSpan('agent.run', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: runId,
      [AXRAY_ATTRIBUTES.SESSION_ID]: sessionIdStr,
      [AXRAY_ATTRIBUTES.REPOSITORY]: session.repositoryFullName,
      [AXRAY_ATTRIBUTES.BRANCH]: session.branch,
      [AXRAY_ATTRIBUTES.PHASE]: 'agent',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'agent.run',
    },
  });

  const traceId = span.spanContext().traceId;
  run.traceId = traceId;
  await run.save();

  // Emit agent.started live socket event
  emitLiveEvent(sessionIdStr, {
    sessionId: sessionIdStr,
    runId,
    timestamp: new Date().toISOString(),
    eventType: 'agent.started',
    phase: 'agent',
    status: 'running',
    title: 'Agent Started',
    description: `Groq AI execution started for prompt`,
    metadata: {
      prompt: run.prompt,
      repository: session.repositoryFullName,
      branch: session.branch,
    },
  });

  try {
    // 1. Ensure Container exists and is running
    const { containerId, containerStatus } = await containerService.ensureContainerRunning({
      containerId: session.containerId,
      sessionId: sessionIdStr,
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
      console.log(`[Runner] Preparing workspace for session ${session._id} during run ${run._id}...`);
      
      emitLiveEvent(sessionIdStr, {
        sessionId: sessionIdStr,
        runId,
        timestamp: new Date().toISOString(),
        eventType: 'workspace.started',
        phase: 'workspace',
        status: 'running',
        title: 'Workspace Preparation Started',
        description: `Cloning ${session.repositoryFullName} and preparing runtime`,
      });

      const { spec } = await workspaceService.prepareWorkspace({
        repositoryFullName: session.repositoryFullName,
        branch: session.branch,
        containerId: session.containerId!,
        runId,
        sessionId: sessionIdStr,
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
      runId,
      sessionId: sessionIdStr,
    });

    // 5. Capture Git Diff with Size Truncation Check
    try {
      appendTerminalLine(sessionIdStr, runId, 'command', 'git diff --numstat');
      const gitDiff = await gitService.getDiff(session.containerId!, {
        runId,
        sessionId: sessionIdStr,
      });
      run.diff = gitDiff.rawDiff;
      run.filesChanged = gitDiff.filesChanged;
      run.insertions = gitDiff.insertions;
      run.deletions = gitDiff.deletions;
      run.diffTruncated = gitDiff.truncated;
      run.diffSize = gitDiff.diffSize;
      run.changeSummary = gitDiff.changeSummary;

      appendTerminalLine(sessionIdStr, runId, 'stdout', gitDiff.changeSummary);
    } catch (gitErr) {
      console.warn('[Runner Warning] Failed to capture git diff:', gitErr);
    }

    // 6. Complete or mark run incomplete based on finishReason
    const isMaxTurns = result.finishReason === 'max_turns';
    const isCancelled = result.finishReason === 'cancelled';
    const finalStatus = isCancelled ? 'cancelled' : (isMaxTurns ? 'incomplete' : 'completed');
    run.status = finalStatus;
    run.response = result.response;
    run.tokensUsed = result.tokensUsed;
    run.cost = result.cost;
    run.completedAt = new Date();
    if (run.startedAt) {
      run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    }
    
    if (isCancelled) {
      appendTerminalLine(sessionIdStr, runId, 'error', `Run was force stopped by user (${result.tokensUsed || 0} tokens used).`);
    } else if (isMaxTurns) {
      appendTerminalLine(sessionIdStr, runId, 'stderr', `Run stopped after reaching max turn limit (${result.tokensUsed || 0} tokens used). Task may be incomplete.`);
    } else {
      appendTerminalLine(sessionIdStr, runId, 'success', `Run completed successfully in ${((run.durationMs || 0) / 1000).toFixed(1)}s (${run.tokensUsed || 0} tokens used).`);
    }

    // Flush accumulated terminal output and persist onto AgentRun
    const finalTerminalOutput = await flushAndPersistTerminalOutput(runId);
    run.terminalOutput = finalTerminalOutput;
    await run.save();

    // Emit explicit run.completed OpenTelemetry span
    const completionSpan = tracer.startSpan('run.completed', {
      attributes: {
        [AXRAY_ATTRIBUTES.RUN_ID]: runId,
        [AXRAY_ATTRIBUTES.SESSION_ID]: sessionIdStr,
        [AXRAY_ATTRIBUTES.PHASE]: 'completion',
        [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'run.completed',
        [AXRAY_ATTRIBUTES.RUN_STATUS]: finalStatus,
        'run.duration_ms': run.durationMs || 0,
      },
    });
    completionSpan.setStatus({ code: SpanStatusCode.OK });
    completionSpan.end();

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    // Emit run.completed socket event
    emitLiveEvent(sessionIdStr, {
      sessionId: sessionIdStr,
      runId,
      timestamp: new Date().toISOString(),
      eventType: 'run.completed',
      phase: 'completion',
      status: finalStatus,
      title: isCancelled ? 'Run Cancelled' : (isMaxTurns ? 'Run Stopped (Max Turns Reached)' : 'Run Completed'),
      description: isCancelled
        ? `Agent execution was force stopped by the user`
        : isMaxTurns
        ? `Agent reached max turn limit before natural completion`
        : `Agent completed execution successfully`,
      durationMs: run.durationMs,
      metadata: {
        response: run.response,
        tokensUsed: run.tokensUsed,
        finishReason: result.finishReason,
        changeSummary: run.changeSummary,
        filesChanged: run.filesChanged,
        insertions: run.insertions,
        deletions: run.deletions,
      },
    });

    console.log(`[Runner] Run ${run._id} finished (${finalStatus}) in ${run.durationMs}ms with diff (${run.changeSummary}).`);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Runner] Execution failed for run ${runId}:`, errMessage);

    emitAgentLog('error', `Agent Run Failed (RunID: ${runId}): ${errMessage}`, {
      runId,
      sessionId: sessionIdStr,
      errorMessage: errMessage,
    });

    appendTerminalLine(sessionIdStr, runId, 'error', `Run failed: ${errMessage}`);
    const finalTerminalOutput = await flushAndPersistTerminalOutput(runId);

    run.status = 'failed';
    run.errorMessage = errMessage;
    
    if (error && typeof error === 'object') {
      if ('cost' in error && typeof (error as any).cost === 'number') {
        run.cost = (error as any).cost;
      }
      if ('tokensUsed' in error && typeof (error as any).tokensUsed === 'number') {
        run.tokensUsed = (error as any).tokensUsed;
      }
    }

    run.completedAt = new Date();
    run.terminalOutput = finalTerminalOutput;
    if (run.startedAt) {
      run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    }
    await run.save();

    // Emit explicit run.failed OpenTelemetry span
    const failureSpan = tracer.startSpan('run.failed', {
      attributes: {
        [AXRAY_ATTRIBUTES.RUN_ID]: runId,
        [AXRAY_ATTRIBUTES.SESSION_ID]: sessionIdStr,
        [AXRAY_ATTRIBUTES.PHASE]: 'completion',
        [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'run.failed',
        [AXRAY_ATTRIBUTES.RUN_STATUS]: 'failed',
        'error.message': errMessage,
      },
    });
    failureSpan.setStatus({ code: SpanStatusCode.ERROR, message: errMessage });
    failureSpan.end();

    span.setStatus({ code: SpanStatusCode.ERROR, message: errMessage });
    span.end();

    // Emit run.failed socket event
    emitLiveEvent(sessionIdStr, {
      sessionId: sessionIdStr,
      runId,
      timestamp: new Date().toISOString(),
      eventType: 'run.failed',
      phase: 'completion',
      status: 'failed',
      title: 'Run Failed',
      description: errMessage,
      durationMs: run.durationMs,
      metadata: {
        errorMessage: errMessage,
      },
    });
  }
};
