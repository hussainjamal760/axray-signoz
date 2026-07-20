import { z } from 'zod';
import { createBranchSchema } from '../schemas/github.schema';

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

export type CreateBranchInput = z.infer<typeof createBranchSchema>;
