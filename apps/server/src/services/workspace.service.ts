import * as containerService from './container.service';
import { AppError } from '../errors/AppError';

/**
 * Workspace Service
 * Responsible ONLY for workspace preparation inside Docker containers:
 * - Cloning Git repositories
 * - Checking out target branches
 * - Detecting project runtime requirements
 * - Validating runtime environments
 * - Installing project dependencies
 * 
 * Pure service: Does NOT depend on MongoDB models or touch database records directly.
 */

const WORKSPACE_DIR = '/workspace';

export interface PrepareWorkspaceParams {
  repositoryFullName: string;
  branch: string;
  containerId: string;
}

export interface RuntimeInfo {
  runtime: string;
  version: string;
}

/**
 * Clones a Git repository into the container's deterministic workspace directory (/workspace).
 * Reuses existing repo if already cloned.
 */
export const cloneRepository = async (
  repositoryFullName: string,
  containerId: string
): Promise<void> => {
  console.log(`[Workspace] Checking repository status for ${repositoryFullName} in container ${containerId}...`);

  // Check if /workspace is already a Git repository
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
    `git clone https://github.com/${repositoryFullName}.git ${WORKSPACE_DIR}`
  );

  if (cloneResult.exitCode !== 0) {
    throw new AppError(
      500,
      `Git clone failed for ${repositoryFullName}: ${cloneResult.output}`
    );
  }

  console.log(`[Workspace] Repository ${repositoryFullName} cloned successfully.`);
};

/**
 * Checks out the specified branch inside /workspace.
 */
export const checkoutBranch = async (
  branch: string,
  containerId: string
): Promise<void> => {
  console.log(`[Workspace] Checking out branch "${branch}" in container ${containerId}...`);

  // Fetch latest branch info first
  await containerService.executeCommand(containerId, `git -C ${WORKSPACE_DIR} fetch origin`);

  // Attempt checkout of existing branch or creation from origin/branch
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

/**
 * Inspects project files (.nvmrc, .node-version, package.json engines) to detect runtime specs.
 */
export const detectProjectRuntime = async (
  containerId: string,
  workspacePath: string = WORKSPACE_DIR
): Promise<RuntimeInfo> => {
  console.log(`[Workspace] Detecting project runtime in ${workspacePath}...`);

  // 1. Check .nvmrc
  const nvmrcCheck = await containerService.executeCommand(
    containerId,
    `cat ${workspacePath}/.nvmrc`
  );
  if (nvmrcCheck.exitCode === 0 && nvmrcCheck.output) {
    const version = nvmrcCheck.output.trim().replace(/^v/, '');
    console.log(`[Workspace] Detected Node version from .nvmrc: ${version}`);
    return { runtime: 'node', version };
  }

  // 2. Check .node-version
  const nodeVerCheck = await containerService.executeCommand(
    containerId,
    `cat ${workspacePath}/.node-version`
  );
  if (nodeVerCheck.exitCode === 0 && nodeVerCheck.output) {
    const version = nodeVerCheck.output.trim().replace(/^v/, '');
    console.log(`[Workspace] Detected Node version from .node-version: ${version}`);
    return { runtime: 'node', version };
  }

  // 3. Check package.json engines
  const pkgCheck = await containerService.executeCommand(
    containerId,
    `cat ${workspacePath}/package.json`
  );
  if (pkgCheck.exitCode === 0 && pkgCheck.output) {
    try {
      const pkg = JSON.parse(pkgCheck.output);
      if (pkg.engines?.node) {
        const rawVersion = pkg.engines.node.replace(/[^0-9.]/g, '');
        console.log(`[Workspace] Detected Node version from package.json engines: ${rawVersion}`);
        return { runtime: 'node', version: rawVersion || '22' };
      }
    } catch {
      // Ignore JSON parse error if package.json is malformed
    }
  }

  console.log(`[Workspace] Defaulting runtime to Node 22`);
  return { runtime: 'node', version: '22' };
};

/**
 * Ensures the required runtime is available inside the container.
 * TODO (Future): Integrate version managers (mise / nvm) for multi-version switching.
 */
export const ensureRuntime = async (
  containerId: string,
  runtimeInfo: RuntimeInfo
): Promise<void> => {
  console.log(`[Workspace] Ensuring runtime ${runtimeInfo.runtime}@${runtimeInfo.version} in container ${containerId}...`);

  const nodeCheck = await containerService.executeCommand(containerId, 'node -v');
  if (nodeCheck.exitCode === 0) {
    console.log(`[Workspace] Active Node runtime in container: ${nodeCheck.output}`);
  } else {
    console.warn(`[Workspace Warning] Node executable check failed: ${nodeCheck.output}`);
  }
};

/**
 * Detects package manager and installs project dependencies inside /workspace.
 */
export const installDependencies = async (
  containerId: string,
  workspacePath: string = WORKSPACE_DIR
): Promise<void> => {
  console.log(`[Workspace] Detecting package manager and installing dependencies in ${workspacePath}...`);

  // Check package.json presence
  const pkgCheck = await containerService.executeCommand(
    containerId,
    `[ -f ${workspacePath}/package.json ]`
  );

  if (pkgCheck.exitCode !== 0) {
    console.log(`[Workspace] No package.json found in ${workspacePath}. Skipping dependency installation.`);
    return;
  }

  // Detect lockfiles
  const pnpmCheck = await containerService.executeCommand(
    containerId,
    `[ -f ${workspacePath}/pnpm-lock.yaml ]`
  );
  const yarnCheck = await containerService.executeCommand(
    containerId,
    `[ -f ${workspacePath}/yarn.lock ]`
  );
  const npmLockCheck = await containerService.executeCommand(
    containerId,
    `[ -f ${workspacePath}/package-lock.json ]`
  );

  let installCmd = 'npm install';
  if (pnpmCheck.exitCode === 0) {
    installCmd = 'pnpm install || npm install';
  } else if (yarnCheck.exitCode === 0) {
    installCmd = 'yarn install || npm install';
  } else if (npmLockCheck.exitCode === 0) {
    installCmd = 'npm install';
  }

  console.log(`[Workspace] Executing dependency installation: "${installCmd}"`);
  const installResult = await containerService.executeCommand(
    containerId,
    `cd ${workspacePath} && ${installCmd}`
  );

  if (installResult.exitCode !== 0) {
    console.warn(`[Workspace Warning] Dependency installation finished with non-zero exit code: ${installResult.output}`);
  } else {
    console.log(`[Workspace] Dependencies installed successfully.`);
  }
};

/**
 * Full workspace preparation workflow:
 * 1. Clone repository
 * 2. Checkout branch
 * 3. Detect project runtime
 * 4. Ensure runtime environment
 * 5. Install dependencies
 */
export const prepareWorkspace = async (
  params: PrepareWorkspaceParams
): Promise<{ status: 'ready' }> => {
  console.log(
    `[Workspace] Starting full workspace preparation for repo=${params.repositoryFullName} branch=${params.branch} in container ${params.containerId}`
  );

  // Step A: Clone repository
  await cloneRepository(params.repositoryFullName, params.containerId);

  // Step B: Checkout branch
  await checkoutBranch(params.branch, params.containerId);

  // Step C: Detect runtime
  const runtimeInfo = await detectProjectRuntime(params.containerId, WORKSPACE_DIR);

  // Step D: Ensure runtime
  await ensureRuntime(params.containerId, runtimeInfo);

  // Step E: Install dependencies
  await installDependencies(params.containerId, WORKSPACE_DIR);

  console.log(
    `[Workspace] Workspace preparation complete and READY for repo=${params.repositoryFullName} branch=${params.branch}`
  );

  return { status: 'ready' };
};
