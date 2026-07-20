import { Request } from 'express';

// Skeleton for future GitHub SDK initialization and API integration
export const initializeGitHubSDK = async (): Promise<void> => {
  // Placeholder for future implementation
};

export const getGithubAccessToken = (req: Request): string | undefined => {
  return req.session?.githubAccessToken;
};
