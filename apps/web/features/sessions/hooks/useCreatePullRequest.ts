import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPullRequest } from '../api/sessions.api';
import { PullRequestSummary } from '../types/sessions.types';

export const useCreatePullRequest = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation<PullRequestSummary, Error, { title?: string; body?: string } | undefined>({
    mutationFn: (data) => createPullRequest(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
