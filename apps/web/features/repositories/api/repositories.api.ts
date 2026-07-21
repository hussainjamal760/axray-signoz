import { apiClient } from '@/lib/api-client';
import { RepositorySummary, BranchSummary, CreateBranchOptions, CreateBranchResponse } from '../types/repositories.types';

export const getRepositories = (): Promise<RepositorySummary[]> => {
  return apiClient<RepositorySummary[]>('/api/github/repos');
};

export const getBranches = (owner: string, repo: string): Promise<BranchSummary[]> => {
  return apiClient<BranchSummary[]>(`/api/github/repos/${owner}/${repo}/branches`);
};

export const createBranch = (
  owner: string,
  repo: string,
  data: CreateBranchOptions
): Promise<CreateBranchResponse> => {
  return apiClient<CreateBranchResponse>(`/api/github/repos/${owner}/${repo}/branches`, {
    method: 'POST',
    body: data,
  });
};
