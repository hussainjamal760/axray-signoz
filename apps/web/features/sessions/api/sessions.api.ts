import { apiClient } from '@/lib/api-client';
import { SessionSummary, ContainerStatus, TimelineItem } from '../types/sessions.types';

interface BackendSession {
  _id: string;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: 'active' | 'archived';
  containerId?: string;
  containerStatus?: ContainerStatus;
  workspaceReady?: boolean;
  workspaceInitialized?: boolean;
  workspaceSpec?: SessionSummary['workspaceSpec'];
  latestRunId?: string;
  createdAt: string;
  updatedAt: string;
}

function mapSession(session: BackendSession): SessionSummary {
  return {
    id: session._id,
    repositoryId: session.repositoryId,
    repositoryFullName: session.repositoryFullName,
    branch: session.branch,
    status: session.status,
    containerId: session.containerId,
    containerStatus: session.containerStatus,
    workspaceInitialized: session.workspaceInitialized ?? session.workspaceReady ?? false,
    workspaceSpec: session.workspaceSpec,
    latestRunId: session.latestRunId,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  };
}

export const getSessions = async (): Promise<SessionSummary[]> => {
  const data = await apiClient<BackendSession[]>('/api/sessions');
  return data.map(mapSession);
};

export const getSessionById = async (id: string): Promise<SessionSummary> => {
  const data = await apiClient<BackendSession>(`/api/sessions/${id}`);
  return mapSession(data);
};

export const createSession = async (data: {
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
}): Promise<SessionSummary> => {
  const res = await apiClient<BackendSession>('/api/sessions', {
    method: 'POST',
    body: data,
  });
  return mapSession(res);
};

export const updateSession = async (id: string, data: { status: 'active' | 'archived' }): Promise<SessionSummary> => {
  const res = await apiClient<BackendSession>(`/api/sessions/${id}`, {
    method: 'PATCH',
    body: data,
  });
  return mapSession(res);
};

export const deleteSession = (id: string): Promise<void> => {
  return apiClient<void>(`/api/sessions/${id}`, {
    method: 'DELETE',
  });
};

export const getSessionTimeline = async (sessionId: string): Promise<TimelineItem[]> => {
  if (!sessionId) return [];
  return apiClient<TimelineItem[]>(`/api/sessions/${sessionId}/timeline`);
};
