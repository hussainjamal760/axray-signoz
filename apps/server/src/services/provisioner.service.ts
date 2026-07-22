import * as containerService from './container.service';
import { ContainerStatus } from '../models/session.model';

/**
 * Provisioner Service
 * Responsible for orchestrating session infrastructure setup.
 */

export interface SessionProvisionParams {
  sessionId: string;
  repositoryFullName: string;
  branch: string;
}

export interface SessionProvisionResult {
  containerId: string;
  containerStatus: ContainerStatus;
}

export const provisionSessionInfrastructure = async (
  sessionParams: SessionProvisionParams
): Promise<SessionProvisionResult> => {
  console.log(
    `[Provisioner] Provisioning session infrastructure for session ${sessionParams.sessionId} (${sessionParams.repositoryFullName} / ${sessionParams.branch})`
  );

  // 1. Create real Docker container
  const container = await containerService.createContainer({
    sessionId: sessionParams.sessionId,
    name: `axray-session-${sessionParams.sessionId}`,
    repositoryFullName: sessionParams.repositoryFullName,
    branch: sessionParams.branch,
  });

  // 2. Start container
  await containerService.startContainer(container.containerId);

  console.log(`[Provisioner] Session infrastructure ready.`);

  return {
    containerId: container.containerId,
    containerStatus: 'running',
  };
};
