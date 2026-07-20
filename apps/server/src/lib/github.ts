import { Request } from 'express';
import { Octokit } from '@octokit/rest';

// Skeleton for future GitHub SDK initialization and API integration
export const initializeGitHubSDK = async (): Promise<void> => {
  // Placeholder for future implementation
};

export const getGithubAccessToken = (req: Request): string | undefined => {
  return req.session?.githubAccessToken;
};

export const createGithubClient = (token: string): Octokit => {
  return new Octokit({ auth: token });
};

export const parseRepository = (fullName: string): { owner: string; repo: string } => {
  const [owner, repo] = fullName.split('/');
  return { owner, repo };
};
