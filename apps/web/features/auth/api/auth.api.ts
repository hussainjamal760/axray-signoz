import { apiClient, BASE_URL } from '@/lib/api-client';
import type { CurrentUserResponse } from '../types/auth.types';

export const startGithubAuth = (): void => {
  window.location.href = `${BASE_URL}/api/auth/github`;
};

export const logout = (): Promise<void> => {
  return apiClient<void>('/api/auth/logout', { method: 'POST' });
};

export const getCurrentUser = (): Promise<CurrentUserResponse> => {
  return apiClient<CurrentUserResponse>('/api/auth/me');
};
