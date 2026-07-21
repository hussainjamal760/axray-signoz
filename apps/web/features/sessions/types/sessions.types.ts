export type SessionStatus = 'active' | 'archived';

export interface SessionSummary {
  id: string;
  repositoryId: number;
  repositoryFullName: string;
  branch: string;
  status: SessionStatus;
  latestRunId?: string;
  createdAt: string;
  updatedAt: string;
}
