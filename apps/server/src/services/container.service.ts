/**
 * Container Service
 * Responsible ONLY for Docker container lifecycle operations via Dockerode.
 * Includes Command Auto-Transformation, Timeout Safeguards, and Output Protection.
 */

import { docker, DOCKER_RUNTIME_IMAGE } from '../lib/docker';
import { AppError } from '../errors/AppError';
import { ContainerStatus } from '../models/session.model';
import { tracer } from '../lib/telemetry';
import { SpanStatusCode } from '@opentelemetry/api';

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

/**
 * Backend Command Transformation Middleware
 * Automatically injects exclusion flags into search commands if missing.
 */
export function sanitizeAndTransformCommand(command: string): string {
  let cmd = command.trim();

  // If invoking grep without --exclude-dir, inject heavy directory exclusions
  if (/\bgrep\b/.test(cmd) && !cmd.includes('--exclude-dir')) {
    cmd = cmd.replace(
      /\bgrep\b/,
      'grep --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.next'
    );
  }

  // If invoking ripgrep (rg) without --glob, inject heavy directory exclusions
  if (/\brg\b/.test(cmd) && !cmd.includes('--glob')) {
    cmd = cmd.replace(
      /\brg\b/,
      "rg --glob '!node_modules' --glob '!.git' --glob '!dist' --glob '!.next'"
    );
  }

  return cmd;
}

/**
 * Determines intelligent default timeout based on command pattern
 */
function getCommandDefaultTimeoutMs(command: string): number {
  const cmd = command.trim();
  if (/(install|ci|build)\b/.test(cmd)) {
    return 120000; // 120s build/install timeout
  }
  if (/(test|jest|vitest|playwright)\b/.test(cmd)) {
    return 60000; // 60s test suite timeout
  }
  return 30000; // 30s default timeout
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
    const targetImage = DOCKER_RUNTIME_IMAGE;
    let container;

    try {
      container = await docker.createContainer({
        Image: targetImage,
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
    } catch (createErr: any) {
      if (createErr?.statusCode === 404 || (typeof createErr?.message === 'string' && createErr.message.includes('No such image'))) {
        console.warn(`[Docker Warning] Image "${targetImage}" missing locally. Falling back to "node:22"...`);
        container = await docker.createContainer({
          Image: 'node:22',
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
      } else {
        throw createErr;
      }
    }

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
  rawCommand: string,
  options?: { timeoutMs?: number; maxBufferBytes?: number }
): Promise<{ exitCode: number; output: string }> => {
  // Apply backend middleware command transformation (auto-inject exclusions)
  const command = sanitizeAndTransformCommand(rawCommand);

  const timeoutMs = options?.timeoutMs ?? getCommandDefaultTimeoutMs(command);
  const maxBufferBytes = options?.maxBufferBytes ?? 100000; // 100KB max

  console.log(`[Docker] Executing command in ${containerId} (timeout=${timeoutMs}ms): "${command}"`);

  const span = tracer.startSpan('container.exec', {
    attributes: {
      'container.id': containerId,
      'command.raw': rawCommand,
      'command.sanitized': command,
      'command.timeout_ms': timeoutMs,
    },
  });

  const startTime = Date.now();

  try {
    const container = docker.getContainer(containerId);
    const exec = await container.exec({
      Cmd: ['sh', '-c', command],
      AttachStdout: true,
      AttachStderr: true,
    });

    const stream = await exec.start({});
    let output = '';
    let isTimedOut = false;

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        isTimedOut = true;
        try {
          (stream as any).destroy?.();
        } catch {}
        reject(new Error('TIMEOUT'));
      }, timeoutMs);

      stream.on('data', (chunk: Buffer) => {
        if (output.length < maxBufferBytes) {
          output += chunk.toString('utf8');
          if (output.length >= maxBufferBytes) {
            output += '\n[outputTruncated=true: Output truncated due to 100KB size limit. Showing partial output.]';
            try {
              (stream as any).destroy?.();
            } catch {}
          }
        }
      });

      stream.on('end', () => {
        clearTimeout(timer);
        if (!isTimedOut) resolve();
      });

      stream.on('error', (err) => {
        clearTimeout(timer);
        if (!isTimedOut) reject(err);
      });
    });

    const inspectData = await exec.inspect();
    const exitCode = inspectData.ExitCode ?? 0;
    const durationMs = Date.now() - startTime;

    span.setAttribute('command.exit_code', exitCode);
    span.setAttribute('command.duration_ms', durationMs);
    span.setAttribute('command.output_length', output.length);

    if (exitCode !== 0) {
      span.setStatus({ code: SpanStatusCode.ERROR, message: `Command exited with code ${exitCode}` });
    } else {
      span.setStatus({ code: SpanStatusCode.OK });
    }
    span.end();

    return {
      exitCode,
      output: output.trim(),
    };
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    span.setAttribute('command.duration_ms', durationMs);

    if (error?.message === 'TIMEOUT') {
      const sec = (timeoutMs / 1000).toFixed(0);
      const timeoutOutput = `Command timed out after ${sec}s. Possible cause: recursive search or scanning large directories (e.g., node_modules, .git). Try a more specific search path or use search_files().`;
      span.setAttribute('command.exit_code', 124);
      span.setAttribute('command.timed_out', true);
      span.setStatus({ code: SpanStatusCode.ERROR, message: `Command timed out after ${sec}s` });
      span.end();

      return {
        exitCode: 124,
        output: timeoutOutput,
      };
    }

    span.setStatus({ code: SpanStatusCode.ERROR, message: error?.message || String(error) });
    span.end();
    return handleDockerError(error, 'Execute command');
  }
};
