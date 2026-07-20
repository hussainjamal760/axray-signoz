import { Octokit } from '@octokit/rest';
import { config } from '../config';

export class GithubService {
  getAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: config.GITHUB_CLIENT_ID,
      redirect_uri: config.GITHUB_REDIRECT_URI,
      scope: 'repo user',
    });
    return `https://github.com/login/oauth/authorize?${params.toString()}`;
  }

  async getAccessToken(code: string): Promise<string> {
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
  }

  async getUserProfile(token: string) {
    const octokit = new Octokit({ auth: token });
    const { data } = await octokit.users.getAuthenticated();
    return {
      githubId: String(data.id),
      username: data.login,
      email: data.email || undefined,
      avatarUrl: data.avatar_url,
    };
  }
}

export const githubService = new GithubService();
