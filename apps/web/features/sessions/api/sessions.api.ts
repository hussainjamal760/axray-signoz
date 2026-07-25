import { apiClient } from '@/lib/api-client';
import { SessionSummary, ContainerStatus, TimelineItem, PullRequestSummary } from '../types/sessions.types';

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
  latestRunId?: {
    status?: 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'incomplete';
    tokensUsed?: number;
    cost?: number;
  } | string;
  pullRequest?: PullRequestSummary;
  createdAt: string;
  updatedAt: string;
}

function mapSession(session: BackendSession): SessionSummary {
  const latestRun = typeof session.latestRunId === 'object' ? session.latestRunId : undefined;
  
  let agentStatus: 'running' | 'idle' | 'failed' = 'idle';
  if (latestRun?.status === 'running' || latestRun?.status === 'queued' || latestRun?.status === 'pending') {
    agentStatus = 'running';
  } else if (latestRun?.status === 'failed' || latestRun?.status === 'incomplete') {
    agentStatus = 'failed';
  }

  const tokens = latestRun?.tokensUsed || 0;
  const cost = latestRun?.cost || 0;

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
    latestRunId: typeof session.latestRunId === 'string' ? session.latestRunId : undefined,
    pullRequest: session.pullRequest,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
    agentStatus,
    metrics: {
      tokens,
      cost,
    },
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

export const createPullRequest = async (
  sessionId: string,
  data?: { title?: string; body?: string }
): Promise<PullRequestSummary> => {
  return apiClient<PullRequestSummary>(`/api/sessions/${sessionId}/pull-request`, {
    method: 'POST',
    body: data || {},
  });
};
