import Docker from 'dockerode';
import * as path from 'path';
import * as fs from 'fs';
import { Readable } from 'stream';
import { AppError } from '../errors/AppError';

const isWindows = process.platform === 'win32';

export const BASE_WORKSPACE_IMAGE = process.env.BASE_WORKSPACE_IMAGE || 'axray-workspace:latest';
export const DOCKER_RUNTIME_IMAGE = BASE_WORKSPACE_IMAGE;

export const docker = new Docker(
  isWindows
    ? { socketPath: '//./pipe/docker_engine' }
    : { socketPath: '/var/run/docker.sock' }
);

/**
 * Builds a 512-byte block tar archive containing a single Dockerfile in pure JS.
 */
function createDockerfileTarBuffer(dockerfileContent: string): Buffer {
  const header = Buffer.alloc(512);
  header.write('Dockerfile', 0, 100, 'utf8');
  header.write('0000644\0', 100, 8, 'utf8');
  header.write('0000000\0', 108, 8, 'utf8');
  header.write('0000000\0', 116, 8, 'utf8');
  
  const contentBuffer = Buffer.from(dockerfileContent, 'utf8');
  const sizeOctal = contentBuffer.length.toString(8).padStart(11, '0') + '\0';
  header.write(sizeOctal, 124, 12, 'utf8');
  header.write(Math.floor(Date.now() / 1000).toString(8).padStart(11, '0') + '\0', 136, 12, 'utf8');
  header.write('        ', 148, 8, 'utf8');
  header.write('0', 156, 1, 'utf8');

  let sum = 0;
  for (let i = 0; i < 512; i++) {
    sum += header[i];
  }
  const checksumOctal = sum.toString(8).padStart(6, '0') + '\0 ';
  header.write(checksumOctal, 148, 8, 'utf8');

  const remainder = contentBuffer.length % 512;
  const paddingSize = remainder === 0 ? 0 : 512 - remainder;
  const padding = Buffer.alloc(paddingSize);
  const endZeros = Buffer.alloc(1024);

  return Buffer.concat([header, contentBuffer, padding, endZeros]);
}

/**
 * Builds local axray-workspace image using Dockerode buildImage stream.
 */
export async function buildLocalWorkspaceImage(imageName: string = BASE_WORKSPACE_IMAGE): Promise<void> {
  console.log(`[Docker] Building local base image "${imageName}" from workspace.Dockerfile...`);
  
  const dockerfilePath = path.join(__dirname, '../../docker/workspace.Dockerfile');
  let dockerfileContent = '';
  try {
    if (fs.existsSync(dockerfilePath)) {
      dockerfileContent = fs.readFileSync(dockerfilePath, 'utf8');
    }
  } catch {}

  if (!dockerfileContent) {
    dockerfileContent = `FROM alpine:latest
RUN apk add --no-cache git bash curl wget ca-certificates openssh-client jq
WORKDIR /workspace
CMD ["sleep", "infinity"]`;
  }

  const tarBuffer = createDockerfileTarBuffer(dockerfileContent);
  const streamContext = Readable.from([tarBuffer]);

  try {
    const stream = await (docker.buildImage as any)(streamContext, { t: imageName });
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log(`[Docker] Successfully built local base image "${imageName}".`);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Docker Error] Failed to build local Docker image "${imageName}":`, message);
    throw new AppError(500, `Failed to build local Docker image ${imageName}: ${message}`);
  }
}

/**
 * Pulls a Docker image and awaits stream completion using Dockerode followProgress.
 */
export async function pullImage(imageName: string): Promise<void> {
  console.log(`[Docker] Pulling image "${imageName}" from registry...`);
  try {
    const stream = await docker.pull(imageName);
    await new Promise<void>((resolve, reject) => {
      docker.modem.followProgress(stream, (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
    console.log(`[Docker] Successfully pulled image "${imageName}".`);
  } catch (error: any) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[Docker Error] Failed to pull Docker image "${imageName}":`, message);
    throw new AppError(500, `Failed to pull Docker image ${imageName}: ${message}`);
  }
}

/**
 * Ensures a Docker image is available locally in daemon, building locally if it's the base workspace image, or pulling if missing.
 */
export async function ensureImageExists(imageName: string = BASE_WORKSPACE_IMAGE): Promise<void> {
  try {
    const image = docker.getImage(imageName);
    await image.inspect();
    console.log(`[Docker] Image "${imageName}" is available locally.`);
  } catch (error: any) {
    if (error?.statusCode === 404 || (typeof error?.message === 'string' && error.message.includes('no such image'))) {
      if (imageName.includes('axray-workspace')) {
        console.log(`[Docker] Base workspace image "${imageName}" not found in local daemon. Building locally from workspace.Dockerfile...`);
        await buildLocalWorkspaceImage(imageName);
      } else {
        console.log(`[Docker] Image "${imageName}" not found in local daemon. Triggering pull...`);
        await pullImage(imageName);
      }
    } else {
      console.warn(`[Docker Warning] Unable to inspect Docker image "${imageName}":`, error?.message || String(error));
      if (imageName.includes('axray-workspace')) {
        console.log(`[Docker] Building local base image "${imageName}" from workspace.Dockerfile...`);
        await buildLocalWorkspaceImage(imageName);
      } else {
        await pullImage(imageName);
      }
    }
  }
}

export async function ensureDefaultImageExists(): Promise<void> {
  await ensureImageExists(BASE_WORKSPACE_IMAGE);
}
