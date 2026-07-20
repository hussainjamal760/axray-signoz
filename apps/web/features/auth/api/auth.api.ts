import { apiClient, BASE_URL } from '@/lib/api-client';
import type { AuthMeResponse } from '../types/auth.types';

export const startGithubAuth = (): void => {
  window.location.href = `${BASE_URL}/api/auth/github`;
};

export const logout = (): Promise<void> => {
  return apiClient<void>('/api/auth/logout', { method: 'POST' });
};

export const getCurrentUser = (): Promise<AuthMeResponse> => {
  return apiClient<AuthMeResponse>('/api/auth/me');
};
