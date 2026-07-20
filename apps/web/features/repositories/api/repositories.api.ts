import { apiClient } from '@/lib/api-client';
import { RepositorySummary, BranchSummary } from '../types/repositories.types';

export const getRepositories = (): Promise<RepositorySummary[]> => {
  return apiClient<RepositorySummary[]>('/api/github/repos');
};

export const getBranches = (owner: string, repo: string): Promise<BranchSummary[]> => {
  return apiClient<BranchSummary[]>(`/api/github/repos/${owner}/${repo}/branches`);
};
