/**
 * Container Service
 * Responsible ONLY for Docker container lifecycle operations via Dockerode.
 */

import { docker, DOCKER_RUNTIME_IMAGE } from '../lib/docker';
import { AppError } from '../errors/AppError';
import { ContainerStatus } from '../models/session.model';

export interface ContainerInfo {
  containerId: string;
  status: 'created' | 'running' | 'stopped' | 'removed';
}

function handleDockerError(error: unknown, action: string): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[Docker Error] ${action} failed:`, message);

  if (
    message.includes('ECONNREFUSED') ||
    message.includes('ENOENT') ||
    message.includes('connect') ||
    message.includes('docker_engine')
  ) {
    throw new AppError(
      500,
      'Docker daemon unavailable. Please ensure Docker Desktop or Docker engine is running.'
    );
  }

  throw new AppError(500, `Docker operation failed (${action}): ${message}`);
}

export const createContainer = async (params: {
  sessionId?: string;
  name?: string;
  repositoryFullName?: string;
  branch?: string;
}): Promise<{ containerId: string }> => {
  const containerName =
    params.name ||
    (params.sessionId
      ? `axray-session-${params.sessionId}`
      : `axray-session-${Math.random().toString(36).substring(2, 10)}`);

  console.log(`[Docker] Creating container "${containerName}" for repo=${params.repositoryFullName || 'N/A'}`);

  try {
    const container = await docker.createContainer({
      Image: DOCKER_RUNTIME_IMAGE,
      Cmd: ['sleep', 'infinity'],
      name: containerName,
      Tty: true,
      OpenStdin: true,
      Labels: {
        'com.axray.session': params.sessionId || '',
        'com.axray.type': 'session',
      },
      HostConfig: {
        RestartPolicy: { Name: 'no' },
      },
    });

    console.log(`[Docker] Container created: ${container.id}`);
    return { containerId: container.id };
  } catch (error) {
    return handleDockerError(error, 'Create container');
  }
};

export const startContainer = async (containerId: string): Promise<void> => {
  console.log(`[Docker] Starting container: ${containerId}`);
  try {
    const container = docker.getContainer(containerId);
    await container.start();

    // Verify container state after start
    const data = await container.inspect();
    if (!data.State.Running) {
      throw new Error(`Container process exited immediately (ExitCode: ${data.State.ExitCode})`);
    }

    console.log(`[Docker] Container verified running: ${containerId}`);
  } catch (error) {
    handleDockerError(error, 'Start container');
  }
};

export const stopContainer = async (containerId: string): Promise<void> => {
  console.log(`[Docker] Stopping container: ${containerId}`);
  try {
    const container = docker.getContainer(containerId);
    await container.stop();
    console.log(`[Docker] Container stopped.`);
  } catch (error) {
    // Ignore error if already stopped
    console.log(`[Docker] Stop container result:`, error instanceof Error ? error.message : error);
  }
};

export const removeContainer = async (containerId: string): Promise<void> => {
  console.log(`[Docker] Removing container: ${containerId}`);
  try {
    const container = docker.getContainer(containerId);
    await container.remove({ force: true });
    console.log(`[Docker] Container removed.`);
  } catch (error) {
    // Ignore error if already removed
    console.log(`[Docker] Remove container result:`, error instanceof Error ? error.message : error);
  }
};

export const inspectContainer = async (containerId: string): Promise<ContainerInfo> => {
  try {
    const container = docker.getContainer(containerId);
    const data = await container.inspect();
    const isRunning = data.State.Running;

    return {
      containerId,
      status: isRunning ? 'running' : 'stopped',
    };
  } catch (error) {
    return handleDockerError(error, 'Inspect container');
  }
};

export const ensureContainerRunning = async (params: {
  containerId?: string;
  sessionId?: string;
  repositoryFullName: string;
  branch: string;
}): Promise<{ containerId: string; containerStatus: ContainerStatus }> => {
  if (!params.containerId) {
    console.log(`[Docker] Container missing for session ${params.sessionId || 'N/A'}, creating and starting new container...`);
    const { containerId } = await createContainer({
      sessionId: params.sessionId,
      repositoryFullName: params.repositoryFullName,
      branch: params.branch,
    });
    await startContainer(containerId);
    return { containerId, containerStatus: 'running' };
  }

  try {
    const containerInfo = await inspectContainer(params.containerId);
    if (containerInfo.status !== 'running') {
      await startContainer(params.containerId);
    }
    return { containerId: params.containerId, containerStatus: 'running' };
  } catch {
    // If container inspect fails or container was deleted, recreate
    const { containerId } = await createContainer({
      sessionId: params.sessionId,
      repositoryFullName: params.repositoryFullName,
      branch: params.branch,
    });
    await startContainer(containerId);
    return { containerId, containerStatus: 'running' };
  }
};

export const executeCommand = async (
  containerId: string,
  command: string
): Promise<{ exitCode: number; output: string }> => {
  console.log(`[Docker] Executing command in ${containerId}: "${command}"`);
  try {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({});
    let output = '';

    await new Promise<void>((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => {
        output += chunk.toString('utf8');
      });
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const inspectData = await exec.inspect();
    return {
      exitCode: inspectData.ExitCode ?? 0,
      output: output.trim(),
    };
  } catch (error) {
    return handleDockerError(error, 'Execute command');
  }
};
