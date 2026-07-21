import { z } from 'zod';

const isInvalidBranchName = (val: string): boolean => {
  return (
    val.includes('..') ||
    val.includes('~') ||
    val.includes('^') ||
    val.includes(':') ||
    val.includes('*') ||
    val.includes('?') ||
    val.includes('[') ||
    val.includes('\\') ||
    val.includes('//') ||
    /\s/.test(val) ||
    val.startsWith('/') ||
    val.endsWith('/') ||
    val.startsWith('.') ||
    val.endsWith('.') ||
    val.endsWith('.lock')
  );
};

export const createBranchSchema = z.object({
  branchName: z
    .string({ message: 'branchName is required' })
    .trim()
    .min(1, 'branchName cannot be empty')
    .max(255, 'branchName exceeds maximum length')
    .refine((val) => !isInvalidBranchName(val), {
      message: 'Invalid Git branch name format',
    }),
  sourceBranch: z.string().trim().optional(),
});
