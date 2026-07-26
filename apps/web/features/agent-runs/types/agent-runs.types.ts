export type RunStatus = 'pending' | 'queued' | 'running' | 'completed' | 'failed' | 'cancelled' | 'incomplete';

export const ACTIVE_RUN_STATUSES = ['pending', 'queued', 'running'] as const;

export interface AgentRunSummary {
  id: string;
  sessionId: string;
  traceId?: string;
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
  terminalOutput?: string;
  createdAt: string;
  updatedAt: string;
}

export type AxrayPhase =
  | 'setup'
  | 'workspace'
  | 'agent'
  | 'llm'
  | 'tool'
  | 'git'
  | 'completion'
  | 'error';

export interface TimelineEventMetadata {
  traceId?: string;
  spanId?: string;
  repository?: string;
  branch?: string;
  runtime?: string;
  runtimeVersion?: string;
  runtimeImage?: string;
  containerId?: string;
  model?: string;
  turn?: number;
  toolName?: string;
  filePath?: string;
  commandSummary?: string;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  filesChanged?: number;
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  hallucination?: boolean;
  confidenceScore?: number;
  parseError?: string;
  [key: string]: unknown;
}

export interface TimelineEvent {
  id: string;
  traceId?: string;
  timestamp: string;
  title: string;
  description?: string;
  phase: AxrayPhase;
  eventType: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'incomplete';
  durationMs?: number;
  metadata?: TimelineEventMetadata;
}

export interface TimelineSummary {
  totalDurationMs?: number;
  totalEvents: number;
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
}

export interface TimelineResponse {
  runId: string;
  sessionId: string;
  status: string;
  telemetryStatus: 'authoritative_signoz' | 'active_span_store' | 'unavailable';
  message?: string;
  summary: TimelineSummary;
  events: TimelineEvent[];
}
