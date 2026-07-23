import Docker from 'dockerode';
import { DEFAULT_NODE_IMAGE } from '../services/runtime-image-resolver.service';

const isWindows = process.platform === 'win32';

export const DOCKER_RUNTIME_IMAGE = process.env.DOCKER_RUNTIME_IMAGE || DEFAULT_NODE_IMAGE;

export const docker = new Docker(
  isWindows
    ? { socketPath: '//./pipe/docker_engine' }
    : { socketPath: '/var/run/docker.sock' }
);

export async function ensureDefaultImageExists(): Promise<void> {
  try {
    const image = docker.getImage(DOCKER_RUNTIME_IMAGE);
    await image.inspect();
    console.log(`[Docker] Prebuilt Node runtime image "${DOCKER_RUNTIME_IMAGE}" is available.`);
  } catch (error: any) {
    if (error?.statusCode === 404) {
      console.log(`[Docker] Prebuilt image "${DOCKER_RUNTIME_IMAGE}" not found in local daemon. Standard pull...`);
    } else {
      console.warn(`[Docker Warning] Unable to inspect Docker daemon/image on startup:`, error?.message || String(error));
    }
  }
}
