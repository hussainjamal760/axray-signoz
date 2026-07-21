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
  branch: string;
}): Promise<SessionSummary> => {
  return apiClient<SessionSummary>('/api/sessions', {
    method: 'POST',
    body: data,
  });
};

export const updateSession = (id: string, data: { status: 'active' | 'archived' }): Promise<SessionSummary> => {
  return apiClient<SessionSummary>(`/api/sessions/${id}`, {
    method: 'PATCH',
    body: data,
  });
};

export const deleteSession = (id: string): Promise<void> => {
  return apiClient<void>(`/api/sessions/${id}`, {
    method: 'DELETE',
  });
};
