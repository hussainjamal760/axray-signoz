/**
 * Workspace Service
 * Responsible ONLY for workspace preparation (cloning repositories and checking out branches).
 * Pure service: Does NOT depend on MongoDB models or touch database records directly.
 * 
 * TODO (Future):
 * - Execute real `git clone` or `git worktree` commands inside containers via containerService.
 * - Cache git objects for high-performance session startups.
 */

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PrepareWorkspaceParams {
  repositoryFullName: string;
  branch: string;
  containerId: string;
}

export const cloneRepository = async (
  repositoryFullName: string,
  containerId: string
): Promise<void> => {
  console.log(`[Workspace] Cloning repository ${repositoryFullName} in container ${containerId}...`);
  // TODO: Run git clone https://github.com/${repositoryFullName}.git inside container
  await sleep(1000);
};

export const checkoutBranch = async (
  branch: string,
  containerId: string
): Promise<void> => {
  console.log(`[Workspace] Checking out branch ${branch} in container ${containerId}...`);
  // TODO: Run git checkout ${branch} inside container
  await sleep(800);
};

export const prepareWorkspace = async (
  params: PrepareWorkspaceParams
): Promise<{ status: 'ready' }> => {
  console.log(`[Workspace] Preparing workspace for repo=${params.repositoryFullName} branch=${params.branch}`);
  
  await cloneRepository(params.repositoryFullName, params.containerId);
  await checkoutBranch(params.branch, params.containerId);

  console.log(`[Workspace] Workspace ready for repo=${params.repositoryFullName} branch=${params.branch}`);

  return { status: 'ready' };
};
