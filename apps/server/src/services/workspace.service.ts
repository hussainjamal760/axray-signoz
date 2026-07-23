import * as containerService from './container.service';
import * as workspaceAnalysisService from './workspace-analysis.service';
import { AppError } from '../errors/AppError';
import { IWorkspaceSpec } from '../models/session.model';
import { tracer } from '../lib/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

/**
 * Workspace Service
 * Responsible ONLY for workspace preparation inside Docker containers:
 * - Cloning Git repositories
 * - Checking out target branches
 * - Delegating AI workspace analysis
 * - Validating runtime environments
 * - Executing dependency installation commands
 * 
 * Pure service: Does NOT depend on MongoDB models or touch database records directly.
 */

const WORKSPACE_DIR = '/workspace';

export interface PrepareWorkspaceParams {
  repositoryFullName: string;
  branch: string;
  containerId: string;
}

export const cloneRepository = async (
  repositoryFullName: string,
  containerId: string
): Promise<void> => {
  console.log(`[Workspace] Checking repository status for ${repositoryFullName} in container ${containerId}...`);

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
    return;
  }

  console.log(`[Workspace] Cloning https://github.com/${repositoryFullName}.git into ${WORKSPACE_DIR}...`);
  const cloneResult = await containerService.executeCommand(
    containerId,
    `git clone https://github.com/${repositoryFullName}.git ${WORKSPACE_DIR}`,
    { timeoutMs: 120000 } // 2 min timeout for clone
  );

  if (cloneResult.exitCode !== 0) {
    throw new AppError(
      500,
      `Git clone failed for ${repositoryFullName}: ${cloneResult.output}`
    );
  }

  console.log(`[Workspace] Repository ${repositoryFullName} cloned successfully.`);
};

export const checkoutBranch = async (
  branch: string,
  containerId: string
): Promise<void> => {
  console.log(`[Workspace] Checking out branch "${branch}" in container ${containerId}...`);

  await containerService.executeCommand(containerId, `git -C ${WORKSPACE_DIR} fetch origin`);

  const checkoutResult = await containerService.executeCommand(
    containerId,
    `git -C ${WORKSPACE_DIR} checkout ${branch} || git -C ${WORKSPACE_DIR} checkout -b ${branch} origin/${branch}`
  );

  if (checkoutResult.exitCode !== 0) {
    throw new AppError(
      500,
      `Git checkout failed for branch "${branch}": ${checkoutResult.output}`
    );
  }

  console.log(`[Workspace] Branch "${branch}" checked out successfully.`);
};

export const ensureRuntime = async (
  containerId: string,
  spec: IWorkspaceSpec
): Promise<void> => {
  const runtime = (spec.runtime || 'node').toLowerCase();
  console.log(`[Workspace] Dynamically ensuring runtime "${runtime}" (${spec.runtimeVersion}) in container ${containerId}...`);

  let apkPackages = '';
  let checkCmd = '';

  if (runtime.includes('node') || runtime.includes('javascript') || runtime.includes('typescript')) {
    apkPackages = 'nodejs npm make g++';
    checkCmd = 'node -v';
  } else if (runtime.includes('python')) {
    apkPackages = 'python3 py3-pip make g++';
    checkCmd = 'python3 --version';
  } else if (runtime.includes('go')) {
    apkPackages = 'go make g++';
    checkCmd = 'go version';
  } else if (runtime.includes('rust')) {
    apkPackages = 'cargo make g++';
    checkCmd = 'cargo --version';
  } else if (runtime.includes('php')) {
    apkPackages = 'php composer';
    checkCmd = 'php -v';
  } else if (runtime.includes('ruby')) {
    apkPackages = 'ruby';
    checkCmd = 'ruby -v';
  } else {
    apkPackages = 'nodejs npm';
    checkCmd = 'node -v';
  }

  // Check if runtime is already present
  const existingCheck = await containerService.executeCommand(containerId, checkCmd);
  if (existingCheck.exitCode === 0) {
    console.log(`[Workspace] Runtime "${runtime}" is already installed: ${existingCheck.output}`);
    return;
  }

  console.log(`[Workspace] Executing dynamic runtime installation: "apk add --no-cache ${apkPackages}"`);
  const installRes = await containerService.executeCommand(
    containerId,
    `apk add --no-cache ${apkPackages}`,
    { timeoutMs: 180000 }
  );

  if (installRes.exitCode !== 0) {
    console.warn(`[Workspace Warning] Dynamic runtime installation returned non-zero exit code: ${installRes.output}`);
  } else {
    console.log(`[Workspace] Dynamic runtime "${runtime}" installed successfully.`);
  }
};

export const installDependencies = async (
  containerId: string,
  installCommand: string
): Promise<void> => {
  console.log(`[Workspace] Executing dependency installation: "${installCommand}"...`);

  const installResult = await containerService.executeCommand(
    containerId,
    `cd ${WORKSPACE_DIR} && ${installCommand}`,
    { timeoutMs: 300000 } // 5 minute timeout for dependency installs
  );

  if (installResult.exitCode !== 0) {
    console.warn(`[Workspace Warning] Dependency installation warning: ${installResult.output}`);
  } else {
    console.log(`[Workspace] Dependencies installed successfully.`);
  }
};

export const prepareWorkspace = async (
  params: PrepareWorkspaceParams
): Promise<{ status: 'ready'; spec: IWorkspaceSpec }> => {
  const span = tracer.startSpan('workspace.prepare', {
    attributes: {
      'repository.fullname': params.repositoryFullName,
      'git.branch': params.branch,
      'container.id': params.containerId,
    },
  });

  try {
    console.log(
      `[Workspace] Starting workspace preparation for repo=${params.repositoryFullName} branch=${params.branch} in container ${params.containerId}`
    );

    // Step 1: Clone repository
    await cloneRepository(params.repositoryFullName, params.containerId);

    // Step 2: Checkout branch
    await checkoutBranch(params.branch, params.containerId);

    // Step 3: AI-First Workspace Inspection
    const spec = await workspaceAnalysisService.inspectWorkspace(params.containerId);
    span.setAttribute('workspace.runtime', spec.runtime);
    span.setAttribute('workspace.package_manager', spec.packageManager);
    span.setAttribute('workspace.install_command', spec.installCommand);

    // Step 4: Ensure Runtime
    await ensureRuntime(params.containerId, spec);

    // Step 5: Install Dependencies
    if (spec.installCommand) {
      await installDependencies(params.containerId, spec.installCommand);
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
