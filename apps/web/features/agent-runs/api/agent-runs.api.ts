import { apiClient } from '@/lib/api-client';
import { AgentRunSummary } from '../types/agent-runs.types';

interface BackendRun {
  _id: string;
  sessionId: string;
  prompt: string;
  status: AgentRunSummary['status'];
  response?: string;
  startedAt?: string;
  completedAt?: string;
  durationMs?: number;
  tokensUsed?: number;
  cost?: number;
  modelName?: string;
  errorMessage?: string;
  containerId?: string;
  worktreePath?: string;
  branchCommit?: string;
  diff?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  diffSize?: number;
  changeSummary?: string;
  createdAt: string;
  updatedAt: string;
}

function mapRun(run: BackendRun): AgentRunSummary {
  return {
    id: run._id,
    sessionId: run.sessionId,
    prompt: run.prompt,
    status: run.status,
    response: run.response,
    startedAt: run.startedAt,
    completedAt: run.completedAt,
    durationMs: run.durationMs,
    tokensUsed: run.tokensUsed,
    cost: run.cost,
    modelName: run.modelName,
    errorMessage: run.errorMessage,
    containerId: run.containerId,
    worktreePath: run.worktreePath,
    branchCommit: run.branchCommit,
    diff: run.diff,
    filesChanged: run.filesChanged,
    insertions: run.insertions,
    deletions: run.deletions,
    diffTruncated: run.diffTruncated,
    diffSize: run.diffSize,
    changeSummary: run.changeSummary,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}

export const getRunsForSession = async (sessionId: string): Promise<AgentRunSummary[]> => {
  const data = await apiClient<BackendRun[]>(`/api/sessions/${sessionId}/runs`);
  return data.map(mapRun);
};

export const getRun = async (id: string): Promise<AgentRunSummary> => {
  const data = await apiClient<BackendRun>(`/api/runs/${id}`);
  return mapRun(data);
};

export const createRun = async (sessionId: string, data: { prompt: string }): Promise<AgentRunSummary> => {
  const res = await apiClient<BackendRun>(`/api/sessions/${sessionId}/runs`, {
    method: 'POST',
    body: data,
  });
  return mapRun(res);
};

export const updateRun = async (id: string, data: { status: AgentRunSummary['status'] }): Promise<AgentRunSummary> => {
  const res = await apiClient<BackendRun>(`/api/runs/${id}`, {
    method: 'PATCH',
    body: data,
  });
  return mapRun(res);
};
