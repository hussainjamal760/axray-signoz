import * as containerService from './container.service';

/**
 * Provisioner Service
 * Responsible for orchestrating session infrastructure setup.
 * 
 * TODO (Future):
 * - Attach persistent Docker volumes.
 * - Warm language runtime caches (Node.js/Python/Go).
 * - Pre-download dependency artifacts.
 */

export interface SessionProvisionParams {
  repositoryFullName: string;
  branch: string;
}

export interface SessionProvisionResult {
  containerId: string;
}

export const provisionSessionInfrastructure = async (
  sessionParams: SessionProvisionParams
): Promise<SessionProvisionResult> => {
  console.log(`[Provisioner] Provisioning session infrastructure for ${sessionParams.repositoryFullName} (${sessionParams.branch})`);

  // Create workspace container via containerService
  const container = await containerService.createContainer({
    repositoryFullName: sessionParams.repositoryFullName,
    branch: sessionParams.branch,
  });

  // TODO: Warm caches & mount volumes

  return {
    containerId: container.containerId,
  };
};
