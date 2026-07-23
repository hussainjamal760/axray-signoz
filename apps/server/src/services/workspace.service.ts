import * as containerService from './container.service';
import * as workspaceAnalysisService from './workspace-analysis.service';
import { resolveRuntimeImage } from './runtime-image-resolver.service';
import { AppError } from '../errors/AppError';
import { IWorkspaceSpec } from '../models/session.model';
import { tracer } from '../lib/telemetry';
import { AXRAY_ATTRIBUTES } from '../lib/telemetry-attributes';
import { SpanStatusCode } from '@opentelemetry/api';
import { emitLiveEvent } from '../sockets/socket.emitter';
import { appendTerminalLine } from './terminal-logger.service';

/**
 * Workspace Service
 * Responsible ONLY for workspace preparation inside Docker containers:
 * - Cloning Git repositories
 * - Checking out target branches
 * - Delegating AI workspace analysis
 * - Validating prebuilt runtime environments
 * - Executing dependency installation commands
 * 
 * Pure service: Does NOT depend on MongoDB models or touch database records directly.
 */

const WORKSPACE_DIR = '/workspace';

export interface PrepareWorkspaceParams {
  repositoryFullName: string;
  branch: string;
  containerId: string;
  runId?: string;
  sessionId?: string;
}

export const cloneRepository = async (
  repositoryFullName: string,
  containerId: string,
  telemetryContext?: { runId?: string; sessionId?: string }
): Promise<void> => {
  const sessionId = telemetryContext?.sessionId;
  const runId = telemetryContext?.runId;

  if (sessionId && runId) {
    appendTerminalLine(sessionId, runId, 'command', `git clone https://github.com/${repositoryFullName}.git /workspace`);
    emitLiveEvent(sessionId, {
      sessionId,
      runId,
      timestamp: new Date().toISOString(),
      eventType: 'workspace.cloning',
      phase: 'workspace',
      status: 'running',
      title: 'Cloning Repository',
      description: `Cloning https://github.com/${repositoryFullName}.git`,
      metadata: { repository: repositoryFullName },
    });
  }

  const span = tracer.startSpan('workspace.clone', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: telemetryContext?.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: telemetryContext?.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'workspace',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'workspace.clone',
      [AXRAY_ATTRIBUTES.REPOSITORY]: repositoryFullName,
      [AXRAY_ATTRIBUTES.CONTAINER_ID]: containerId,
    },
  });

  console.log(`[Workspace] Checking repository status for ${repositoryFullName} in container ${containerId}...`);

  try {
    const checkRepo = await containerService.executeCommand(
      containerId,
      `git -C ${WORKSPACE_DIR} rev-parse --is-inside-work-tree`
    );

    if (checkRepo.exitCode === 0) {
      console.log(`[Workspace] Repository ${repositoryFullName} already exists at ${WORKSPACE_DIR}. Fetching remote updates...`);
      const fetchResult = await containerService.executeCommand(
        containerId,
        `git -C ${WORKSPACE_DIR} fetch origin`
      );
      if (fetchResult.exitCode !== 0) {
        console.warn(`[Workspace Warning] Git fetch warning: ${fetchResult.output}`);
      }
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();

      if (sessionId && runId) {
        appendTerminalLine(sessionId, runId, 'stdout', `Repository ${repositoryFullName} ready in /workspace.`);
        emitLiveEvent(sessionId, {
          sessionId,
          runId,
          timestamp: new Date().toISOString(),
          eventType: 'workspace.clone.completed',
          phase: 'workspace',
          status: 'completed',
          title: 'Repository Ready',
          description: `Repository ${repositoryFullName} ready at ${WORKSPACE_DIR}`,
        });
      }
      return;
    }

    console.log(`[Workspace] Cloning https://github.com/${repositoryFullName}.git into ${WORKSPACE_DIR}...`);
    const cloneResult = await containerService.executeCommand(
      containerId,
      `git clone https://github.com/${repositoryFullName}.git ${WORKSPACE_DIR}`,
      { timeoutMs: 120000 }
    );

    if (cloneResult.exitCode !== 0) {
      if (sessionId && runId) {
        appendTerminalLine(sessionId, runId, 'stderr', cloneResult.output);
        appendTerminalLine(sessionId, runId, 'error', `Exit Code: ${cloneResult.exitCode}`);
      }
      throw new AppError(
        500,
        `Git clone failed for ${repositoryFullName}: ${cloneResult.output}`
      );
    }

    console.log(`[Workspace] Repository ${repositoryFullName} cloned successfully.`);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    if (sessionId && runId) {
      appendTerminalLine(sessionId, runId, 'stdout', `Cloned https://github.com/${repositoryFullName}.git successfully.`);
      emitLiveEvent(sessionId, {
        sessionId,
        runId,
        timestamp: new Date().toISOString(),
        eventType: 'workspace.clone.completed',
        phase: 'workspace',
        status: 'completed',
        title: 'Repository Cloned',
        description: `Cloned ${repositoryFullName} successfully`,
      });
    }
  } catch (err: any) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err?.message || String(err) });
    span.end();
    throw err;
  }
};

export const checkoutBranch = async (
  branch: string,
  containerId: string,
  telemetryContext?: { runId?: string; sessionId?: string }
): Promise<void> => {
  const sessionId = telemetryContext?.sessionId;
  const runId = telemetryContext?.runId;

  if (sessionId && runId) {
    appendTerminalLine(sessionId, runId, 'command', `git checkout ${branch}`);
  }

  const span = tracer.startSpan('workspace.checkout', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: telemetryContext?.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: telemetryContext?.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'workspace',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'workspace.checkout',
      [AXRAY_ATTRIBUTES.BRANCH]: branch,
      [AXRAY_ATTRIBUTES.CONTAINER_ID]: containerId,
    },
  });

  console.log(`[Workspace] Checking out branch "${branch}" in container ${containerId}...`);

  try {
    await containerService.executeCommand(containerId, `git -C ${WORKSPACE_DIR} fetch origin`);

    const checkoutResult = await containerService.executeCommand(
      containerId,
      `git -C ${WORKSPACE_DIR} checkout ${branch} || git -C ${WORKSPACE_DIR} checkout -b ${branch} origin/${branch}`
    );

    if (checkoutResult.exitCode !== 0) {
      if (sessionId && runId) {
        appendTerminalLine(sessionId, runId, 'stderr', checkoutResult.output);
        appendTerminalLine(sessionId, runId, 'error', `Exit Code: ${checkoutResult.exitCode}`);
      }
      throw new AppError(
        500,
        `Git checkout failed for branch "${branch}": ${checkoutResult.output}`
      );
    }

    if (sessionId && runId) {
      appendTerminalLine(sessionId, runId, 'stdout', `Switched to branch '${branch}'`);
    }

    console.log(`[Workspace] Branch "${branch}" checked out successfully.`);
    span.setStatus({ code: SpanStatusCode.OK });
    span.end();
  } catch (err: any) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err?.message || String(err) });
    span.end();
    throw err;
  }
};

export const ensureRuntime = async (
  containerId: string,
  spec: IWorkspaceSpec,
  telemetryContext?: { runId?: string; sessionId?: string }
): Promise<void> => {
  const resolution = resolveRuntimeImage(spec.runtime, spec.runtimeVersion);
  const span = tracer.startSpan('workspace.ensure_runtime', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: telemetryContext?.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: telemetryContext?.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'workspace',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'workspace.ensure_runtime',
      [AXRAY_ATTRIBUTES.RUNTIME]: spec.runtime || 'node',
      [AXRAY_ATTRIBUTES.RUNTIME_VERSION]: spec.runtimeVersion || '22',
      [AXRAY_ATTRIBUTES.RUNTIME_IMAGE]: resolution.imageName,
    },
  });

  console.log(`[Workspace] Selected runtime image: ${resolution.imageName}`);
  
  if (telemetryContext?.sessionId && telemetryContext?.runId) {
    appendTerminalLine(telemetryContext.sessionId, telemetryContext.runId, 'agent', `Using prebuilt runtime image ${resolution.imageName}`);
    emitLiveEvent(telemetryContext.sessionId, {
      sessionId: telemetryContext.sessionId,
      runId: telemetryContext.runId,
      timestamp: new Date().toISOString(),
      eventType: 'workspace.runtime.selected',
      phase: 'workspace',
      status: 'completed',
      title: 'Node Runtime Ready',
      description: `Container using prebuilt runtime ${resolution.imageName}`,
      metadata: { runtime: spec.runtime, image: resolution.imageName },
    });
  }

  span.setStatus({ code: SpanStatusCode.OK });
  span.end();
};

export const installDependencies = async (
  containerId: string,
  installCommand: string,
  telemetryContext?: { runId?: string; sessionId?: string }
): Promise<void> => {
  const sessionId = telemetryContext?.sessionId;
  const runId = telemetryContext?.runId;

  if (sessionId && runId) {
    appendTerminalLine(sessionId, runId, 'command', installCommand);
    emitLiveEvent(sessionId, {
      sessionId,
      runId,
      timestamp: new Date().toISOString(),
      eventType: 'workspace.dependencies.install.started',
      phase: 'workspace',
      status: 'running',
      title: 'Installing Dependencies',
      description: `Executing: ${installCommand}`,
      metadata: { commandSummary: installCommand },
    });
  }

  const span = tracer.startSpan('workspace.install_deps', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: telemetryContext?.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: telemetryContext?.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'workspace',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'workspace.install_deps',
      [AXRAY_ATTRIBUTES.TOOL_COMMAND]: installCommand,
    },
  });

  console.log(`[Workspace] Executing dependency installation: "${installCommand}"...`);

  try {
    const installResult = await containerService.executeCommand(
      containerId,
      `cd ${WORKSPACE_DIR} && ${installCommand}`,
      { timeoutMs: 300000 }
    );

    if (sessionId && runId) {
      appendTerminalLine(sessionId, runId, installResult.exitCode === 0 ? 'stdout' : 'stderr', installResult.output);
      appendTerminalLine(sessionId, runId, installResult.exitCode === 0 ? 'success' : 'error', `Exit Code: ${installResult.exitCode}`);
    }

    if (installResult.exitCode !== 0) {
      console.warn(`[Workspace Warning] Dependency installation warning: ${installResult.output}`);
    } else {
      console.log(`[Workspace] Dependencies installed successfully.`);
    }

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    if (sessionId) {
      emitLiveEvent(sessionId, {
        sessionId,
        runId,
        timestamp: new Date().toISOString(),
        eventType: 'workspace.dependencies.install.completed',
        phase: 'workspace',
        status: 'completed',
        title: 'Dependencies Installed',
        description: `Completed: ${installCommand}`,
      });
    }
  } catch (err: any) {
    span.setStatus({ code: SpanStatusCode.ERROR, message: err?.message || String(err) });
    span.end();
    throw err;
  }
};

export const prepareWorkspace = async (
  params: PrepareWorkspaceParams
): Promise<{ status: 'ready'; spec: IWorkspaceSpec }> => {
  const span = tracer.startSpan('workspace.prepare', {
    attributes: {
      [AXRAY_ATTRIBUTES.RUN_ID]: params.runId || '',
      [AXRAY_ATTRIBUTES.SESSION_ID]: params.sessionId || '',
      [AXRAY_ATTRIBUTES.PHASE]: 'workspace',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'workspace.prepare',
      [AXRAY_ATTRIBUTES.REPOSITORY]: params.repositoryFullName,
      [AXRAY_ATTRIBUTES.BRANCH]: params.branch,
      [AXRAY_ATTRIBUTES.CONTAINER_ID]: params.containerId,
    },
  });

  const telContext = { runId: params.runId, sessionId: params.sessionId };

  try {
    console.log(
      `[Workspace] Starting workspace preparation for repo=${params.repositoryFullName} branch=${params.branch} in container ${params.containerId}`
    );

    // Step 1: Clone repository
    await cloneRepository(params.repositoryFullName, params.containerId, telContext);

    // Step 2: Checkout branch
    await checkoutBranch(params.branch, params.containerId, telContext);

    // Step 3: AI-First Workspace Inspection
    if (params.sessionId) {
      emitLiveEvent(params.sessionId, {
        sessionId: params.sessionId,
        runId: params.runId,
        timestamp: new Date().toISOString(),
        eventType: 'workspace.analysis.started',
        phase: 'workspace',
        status: 'running',
        title: 'Analyzing Workspace',
        description: 'AI inspection of package manifests and configuration',
      });
    }

    const analyzeSpan = tracer.startSpan('workspace.analyze', {
      attributes: {
        [AXRAY_ATTRIBUTES.RUN_ID]: params.runId || '',
        [AXRAY_ATTRIBUTES.SESSION_ID]: params.sessionId || '',
        [AXRAY_ATTRIBUTES.PHASE]: 'workspace',
        [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'workspace.analyze',
      },
    });

    const spec = await workspaceAnalysisService.inspectWorkspace(params.containerId);
    analyzeSpan.setAttribute(AXRAY_ATTRIBUTES.RUNTIME, spec.runtime || 'node');
    analyzeSpan.setAttribute('workspace.package_manager', spec.packageManager || 'npm');
    analyzeSpan.setAttribute('workspace.install_command', spec.installCommand || '');
    analyzeSpan.setStatus({ code: SpanStatusCode.OK });
    analyzeSpan.end();

    if (params.sessionId && params.runId) {
      appendTerminalLine(params.sessionId, params.runId, 'agent', `Detected runtime: ${spec.runtime || 'node'} (Package Manager: ${spec.packageManager || 'npm'})`);
      emitLiveEvent(params.sessionId, {
        sessionId: params.sessionId,
        runId: params.runId,
        timestamp: new Date().toISOString(),
        eventType: 'workspace.analysis.completed',
        phase: 'workspace',
        status: 'completed',
        title: 'Workspace Analyzed',
        description: `Detected runtime: ${spec.runtime || 'node'} (${spec.packageManager || 'npm'})`,
        metadata: { runtime: spec.runtime, packageManager: spec.packageManager },
      });
    }

    span.setAttribute(AXRAY_ATTRIBUTES.RUNTIME, spec.runtime);

    // Step 4: Ensure Runtime (Prebuilt Image Check)
    await ensureRuntime(params.containerId, spec, telContext);

    // Step 5: Install Dependencies
    if (spec.installCommand) {
      await installDependencies(params.containerId, spec.installCommand, telContext);
    }

    console.log(
      `[Workspace] Workspace preparation complete and READY for repo=${params.repositoryFullName} branch=${params.branch}`
    );

    span.setStatus({ code: SpanStatusCode.OK });
    span.end();

    return { status: 'ready', spec };
  } catch (error: any) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error?.message || String(error),
    });
    span.end();
    throw error;
  }
};
