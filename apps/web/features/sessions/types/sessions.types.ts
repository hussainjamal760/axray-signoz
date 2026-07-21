export type SessionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

export interface SessionSummary {
  id: string;
  repositoryId: number;
  repositoryFullName: string;
  owner: string;
  branchName: string;
  prompt: string;
  status: SessionStatus;
  agentId?: string;
  containerId?: string;
  createdAt: string;
  updatedAt: string;
}
