import Docker from 'dockerode';

const isWindows = process.platform === 'win32';

export const DOCKER_RUNTIME_IMAGE = process.env.DOCKER_RUNTIME_IMAGE || 'node:22-alpine';

export const docker = new Docker(
  isWindows
    ? { socketPath: '//./pipe/docker_engine' }
    : { socketPath: '/var/run/docker.sock' }
);

export async function ensureDefaultImageExists(): Promise<void> {
  try {
    const image = docker.getImage(DOCKER_RUNTIME_IMAGE);
    await image.inspect();
    console.log(`[Docker] Runtime image "${DOCKER_RUNTIME_IMAGE}" is available.`);
  } catch (error: any) {
    if (error?.statusCode === 404) {
      console.log(`[Docker] Pre-warming runtime image "${DOCKER_RUNTIME_IMAGE}"...`);
      await new Promise<void>((resolve, reject) => {
        docker.pull(DOCKER_RUNTIME_IMAGE, (err: Error | null, stream: NodeJS.ReadableStream) => {
          if (err) return reject(err);
          docker.modem.followProgress(stream, (progressErr) => {
            if (progressErr) return reject(progressErr);
            console.log(`[Docker] Runtime image "${DOCKER_RUNTIME_IMAGE}" pre-warmed successfully.`);
            resolve();
          });
        });
      });
    } else {
      console.warn(`[Docker Warning] Unable to inspect Docker daemon/image on startup:`, error?.message || String(error));
    }
  }
}
