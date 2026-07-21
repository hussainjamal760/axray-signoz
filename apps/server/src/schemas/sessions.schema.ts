import { z } from 'zod';

export const createSessionSchema = z.object({
  repositoryId: z.number({ message: 'repositoryId is required' }),
  repositoryFullName: z.string({ message: 'repositoryFullName is required' }).trim().min(1),
  branch: z.string({ message: 'branch is required' }).trim().min(1),
});

export const updateSessionSchema = z.object({
  status: z.enum(['active', 'archived'] as const, { message: 'status must be active or archived' }),
});

export const createAgentRunSchema = z.object({
  prompt: z.string({ message: 'prompt is required' }).trim().min(1, 'prompt cannot be empty'),
});
