import { AgentRun } from '../models/agent-run.model';
import { Session } from '../models/session.model';
import * as containerService from './container.service';
import * as workspaceService from './workspace.service';
import * as agentService from './agent.service';

/**
 * Runner Service
 * Orchestrates background execution by connecting Container, Workspace, Agent, and Session services.
 * 
 * Flow:
 * Find Run -> Find Session -> Get Container -> Ensure Workspace Ready -> Update Status (running) -> Execute Agent -> Complete Run
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

  try {
    // 1. Ensure Container exists and is running
    const { containerId } = await containerService.ensureContainerRunning({
      containerId: session.containerId,
      repositoryFullName: session.repositoryFullName,
      branch: session.branch,
    });

    if (session.containerId !== containerId) {
      session.containerId = containerId;
      await session.save();
    }

    // 2. Ensure Workspace Initialized (clone & checkout if not yet initialized)
    if (!session.workspaceInitialized) {
      console.log(`[Runner] Preparing workspace for session ${session._id}...`);
      await workspaceService.prepareWorkspace({
        repositoryFullName: session.repositoryFullName,
        branch: session.branch,
        containerId: session.containerId!,
      });
      
      // Update database state after workspace preparation succeeds
      session.workspaceInitialized = true;
      await session.save();
    } else {
      console.log(`[Runner] Workspace already initialized for session ${session._id}. Skipping preparation.`);
    }

    // 3. Transition status to running
    run.status = 'running';
    run.startedAt = new Date();
    run.containerId = session.containerId;
    await run.save();

    console.log(`[Runner] Executing agent for run ${run._id} in container ${session.containerId}`);

    // 4. Delegate prompt execution to AgentService
    const result = await agentService.executePrompt({
      containerId: session.containerId!,
      prompt: run.prompt,
    });

    // 5. Complete run
    run.status = 'completed';
    run.response = result.response;
    run.tokensUsed = result.tokensUsed;
    run.cost = result.cost;
    run.completedAt = new Date();
    if (run.startedAt) {
      run.durationMs = run.completedAt.getTime() - run.startedAt.getTime();
    }
    await run.save();

    console.log(`[Runner] Run ${run._id} completed successfully in ${run.durationMs}ms`);
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
  }
};
