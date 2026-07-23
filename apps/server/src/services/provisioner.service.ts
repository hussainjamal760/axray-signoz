import * as containerService from './container.service';
import { ContainerStatus } from '../models/session.model';
import { tracer } from '../lib/telemetry';
import { AXRAY_ATTRIBUTES } from '../lib/telemetry-attributes';
import { SpanStatusCode } from '@opentelemetry/api';

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

  const sessionSpan = tracer.startSpan('session.create', {
    attributes: {
      [AXRAY_ATTRIBUTES.SESSION_ID]: sessionParams.sessionId,
      [AXRAY_ATTRIBUTES.PHASE]: 'setup',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'session.create',
      [AXRAY_ATTRIBUTES.IS_INITIAL_SETUP]: true,
      [AXRAY_ATTRIBUTES.REPOSITORY]: sessionParams.repositoryFullName,
      [AXRAY_ATTRIBUTES.BRANCH]: sessionParams.branch,
    },
  });

  const containerSpan = tracer.startSpan('container.start', {
    attributes: {
      [AXRAY_ATTRIBUTES.SESSION_ID]: sessionParams.sessionId,
      [AXRAY_ATTRIBUTES.PHASE]: 'setup',
      [AXRAY_ATTRIBUTES.EVENT_TYPE]: 'container.start',
      [AXRAY_ATTRIBUTES.IS_INITIAL_SETUP]: true,
      [AXRAY_ATTRIBUTES.RUNTIME_IMAGE]: 'axray/node:22',
    },
  });

  try {
    // 1. Create real Docker container
    const container = await containerService.createContainer({
      sessionId: sessionParams.sessionId,
      name: `axray-session-${sessionParams.sessionId}`,
      repositoryFullName: sessionParams.repositoryFullName,
      branch: sessionParams.branch,
    });

    // 2. Start container
    await containerService.startContainer(container.containerId);

    containerSpan.setAttribute(AXRAY_ATTRIBUTES.CONTAINER_ID, container.containerId);
    containerSpan.setStatus({ code: SpanStatusCode.OK });
    containerSpan.end();

    sessionSpan.setStatus({ code: SpanStatusCode.OK });
    sessionSpan.end();

    console.log(`[Provisioner] Session infrastructure ready.`);

    return {
      containerId: container.containerId,
      containerStatus: 'running',
    };
  } catch (err: any) {
    containerSpan.setStatus({ code: SpanStatusCode.ERROR, message: err?.message || String(err) });
    containerSpan.end();
    sessionSpan.setStatus({ code: SpanStatusCode.ERROR, message: err?.message || String(err) });
    sessionSpan.end();
    throw err;
  }
};
