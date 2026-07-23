export type RunStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';

export const ACTIVE_RUN_STATUSES = ['pending', 'queued', 'running'] as const;

export interface AgentRunSummary {
  id: string;
  sessionId: string;
  prompt: string;
  status: RunStatus;
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
