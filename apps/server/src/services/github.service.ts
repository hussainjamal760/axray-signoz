import { Octokit } from '@octokit/rest';
import { config } from '../config';
import { RepositorySummary, BranchSummary } from '../types/github.types';

// Helper to create Error objects containing HTTP status codes
const createHttpError = (message: string, status: number): Error & { status: number } => {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
};

// Error translator mapping raw Octokit request errors to clean API errors
const handleGithubError = (error: any): never => {
  const status = error.status || error.statusCode;
  const message = error.message || '';

  if (status === 404) {
    throw createHttpError('Repository not found', 404);
  }
  if (status === 403) {
    throw createHttpError('Permission denied', 403);
  }
  if (status === 422 || status === 409) {
    throw createHttpError('Branch already exists', 409);
  }
  throw createHttpError(message || 'Unexpected GitHub error', status || 500);
};

export const getAuthUrl = (): string => {
  const params = new URLSearchParams({
    client_id: config.GITHUB_CLIENT_ID,
    redirect_uri: config.GITHUB_REDIRECT_URI,
    scope: 'repo user',
  });
  return `https://github.com/login/oauth/authorize?${params.toString()}`;
};

export const getAccessToken = async (code: string): Promise<string> => {
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: config.GITHUB_CLIENT_ID,
        client_secret: config.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: config.GITHUB_REDIRECT_URI,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to exchange GitHub code: ${response.statusText}`);
    }

    const data = (await response.json()) as {
      access_token?: string;
      error?: string;
      error_description?: string;
    };

    if (data.error || !data.access_token) {
      throw new Error(
        `GitHub OAuth Error: ${data.error_description || data.error || 'Unknown error'}`
      );
    }

    return data.access_token;
  } catch (error) {
    return handleGithubError(error);
  }
};

export const getUserProfile = async (token: string) => {
  try {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();
    return {
      githubId: String(data.id),
      username: data.login,
      email: data.email || undefined,
      avatarUrl: data.avatar_url,
    };
  } catch (error) {
    return handleGithubError(error);
  }
};

export const listUserRepositories = async (accessToken: string): Promise<RepositorySummary[]> => {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.repos.listForAuthenticatedUser({
      sort: 'updated',
      per_page: 100,
    });

    return data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      private: repo.private,
    }));
  } catch (error) {
    return handleGithubError(error);
  }
};

export const listRepositoryBranches = async (
  accessToken: string,
  owner: string,
  repo: string
): Promise<BranchSummary[]> => {
  try {
    const octokit = new Octokit({ auth: accessToken });
    const { data } = await octokit.repos.listBranches({
      owner,
      repo,
      per_page: 100,
    });

    return data.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
    }));
  } catch (error) {
    return handleGithubError(error);
  }
};

export const createRepositoryBranch = async (
  accessToken: string,
  owner: string,
  repo: string,
  branchName: string
): Promise<void> => {
  try {
    const octokit = new Octokit({ auth: accessToken });

    // 1. Get default branch of the repository
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo,
    });
    const defaultBranch = repoData.default_branch;

    // 2. Get latest commit SHA of default branch
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });
    const sha = refData.object.sha;

    // 3. Create the new reference refs/heads/<branchName>
    await octokit.git.createRef({
      owner,
      repo,
      ref: `refs/heads/${branchName}`,
      sha,
    });
  } catch (error) {
    return handleGithubError(error);
  }
};
