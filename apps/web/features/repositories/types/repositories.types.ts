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
