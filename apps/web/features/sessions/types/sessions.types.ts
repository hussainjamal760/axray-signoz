export type SessionStatus = 'active' | 'archived';
export type ContainerStatus = 'creating' | 'running' | 'stopped' | 'failed';

export interface SessionSummary {
  id: string;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: SessionStatus;
  containerId?: string;
  containerStatus?: ContainerStatus;
  workspaceInitialized: boolean;
  latestRunId?: string;
  createdAt: string;
  updatedAt: string;
  // UI Mock fields
  agentName?: string;
  agentStatus?: 'running' | 'idle' | 'failed';
  metrics?: {
    cost: number;
    tokens: number;
  };
}
