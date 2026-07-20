import { z } from 'zod';

export const createBranchSchema = z.object({
  branchName: z.string().min(1, 'branchName is required and cannot be empty').trim(),
});
