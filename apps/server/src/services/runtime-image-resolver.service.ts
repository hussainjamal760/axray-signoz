/**
 * Runtime Image Resolver Service
 * Responsible for mapping repository runtime requirements (e.g. Node, Python, Go, Rust)
 * to prebuilt runtime Docker images.
 * 
 * Avoids hardcoding Docker image strings across provisioning and container logic.
 */

export interface RuntimeImageResolution {
  imageName: string;
  runtime: string;
  runtimeVersion?: string;
  isPrebuilt: boolean;
}

export const DEFAULT_NODE_IMAGE = process.env.DOCKER_RUNTIME_IMAGE || 'node:22';

/**
 * Resolves target prebuilt Docker image based on analyzed runtime metadata.
 */
export function resolveRuntimeImage(
  runtime?: string | null,
  runtimeVersion?: string | null
): RuntimeImageResolution {
  const normalizedRuntime = (runtime || 'node').toLowerCase().trim();

  if (
    normalizedRuntime.includes('node') ||
    normalizedRuntime.includes('javascript') ||
    normalizedRuntime.includes('typescript') ||
    normalizedRuntime === 'unknown'
  ) {
    console.log(`[Workspace] Selected runtime image: ${DEFAULT_NODE_IMAGE}`);
    return {
      imageName: DEFAULT_NODE_IMAGE,
      runtime: 'node',
      runtimeVersion: runtimeVersion || '22',
      isPrebuilt: true,
    };
  }

  // Future prebuilt runtime mappings
  if (normalizedRuntime.includes('python')) {
    console.log(`[Workspace] Selected runtime image (Python fallback to Node): ${DEFAULT_NODE_IMAGE}`);
    return {
      imageName: DEFAULT_NODE_IMAGE,
      runtime: 'python',
      runtimeVersion: runtimeVersion || '3.12',
      isPrebuilt: false,
    };
  }

  if (normalizedRuntime.includes('go')) {
    console.log(`[Workspace] Selected runtime image (Go fallback to Node): ${DEFAULT_NODE_IMAGE}`);
    return {
      imageName: DEFAULT_NODE_IMAGE,
      runtime: 'go',
      runtimeVersion: runtimeVersion || '1.24',
      isPrebuilt: false,
    };
  }

  console.log(`[Workspace] Selected default runtime image: ${DEFAULT_NODE_IMAGE}`);
  return {
    imageName: DEFAULT_NODE_IMAGE,
    runtime: 'node',
    runtimeVersion: '22',
    isPrebuilt: true,
  };
}
