import { apiClient } from '@/lib/api-client';
import { SessionSummary } from '../types/sessions.types';

export const getSessions = (): Promise<SessionSummary[]> => {
  return apiClient<SessionSummary[]>('/api/sessions');
};

export const getSessionById = (id: string): Promise<SessionSummary> => {
  return apiClient<SessionSummary>(`/api/sessions/${id}`);
};

export const createSession = (data: {
  repositoryId: number;
  repositoryFullName: string;
  owner: string;
  branchName: string;
  prompt: string;
}): Promise<SessionSummary> => {
  return apiClient<SessionSummary>('/api/sessions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};
