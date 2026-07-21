export interface RepositorySummary {
  id: number;
  name: string;
  owner: string;
  fullName: string;
  defaultBranch: string;
  private: boolean;
}

export interface BranchSummary {
  name: string;
  protected: boolean;
}

export interface CreateBranchOptions {
  branchName: string;
  sourceBranch?: string;
}

export interface CreateBranchResponse {
  success: boolean;
  data: {
    name: string;
    sourceBranch: string;
    sha: string;
  };
}
