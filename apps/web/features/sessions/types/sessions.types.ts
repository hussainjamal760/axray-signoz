export type SessionStatus = 'active' | 'archived' | 'completed';
export type ContainerStatus = 'creating' | 'running' | 'stopped' | 'failed';
export type PullRequestStatus = 'creating' | 'open' | 'merged' | 'closed' | 'failed';

export interface IWorkspaceSpec {
  runtime: string;
  runtimeVersion: string;
  packageManager: string;
  installCommand: string;
  buildCommand?: string | null;
  runCommand?: string | null;
  testCommand?: string | null;
  reasoning: string;
}

export interface PullRequestSummary {
  provider: 'github';
  prNumber: number;
  number?: number;
  prUrl: string;
  branchName: string;
  sourceBranch?: string;
  baseBranch: string;
  targetBranch?: string;
  status: PullRequestStatus;
  lastSyncedCommit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionSummary {
  id: string;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: SessionStatus;
  containerId?: string;
  containerStatus?: ContainerStatus;
  workspaceInitialized: boolean;
  workspaceSpec?: IWorkspaceSpec;
  latestRunId?: string;
  pullRequest?: PullRequestSummary;
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

export type TimelineEventType =
  | 'session'
  | 'container'
  | 'git'
  | 'workspace'
  | 'runtime'
  | 'agent'
  | 'tool'
  | 'diff';

export type TimelineEventStatus = 'completed' | 'running' | 'failed' | 'skipped';

export interface TimelineItem {
  id: string;
  parentId?: string;
  name: string;
  type: TimelineEventType;
  status: TimelineEventStatus;
  startTime: string;
  endTime?: string;
  durationMs?: number;
  attributes?: Record<string, any>;
}
