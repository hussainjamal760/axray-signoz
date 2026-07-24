import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPullRequest } from '../api/sessions.api';
import { PullRequestSummary } from '../types/sessions.types';
import { useToast } from '@/components/ui/Toast';

export const useCreatePullRequest = (sessionId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation<PullRequestSummary, Error, { title?: string; body?: string } | undefined>({
    mutationFn: (data) => createPullRequest(sessionId, data),
    onSuccess: (newPr) => {
      toast({
        title: 'Pull Request Synchronized',
        description: `Pull Request #${newPr.prNumber || newPr.number} successfully processed.`,
        type: 'success',
      });
      queryClient.invalidateQueries({ queryKey: ['session', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
    onError: (err) => {
      const msg = err.message || 'Failed to create Pull Request';
      if (
        msg.toLowerCase().includes('no changes') ||
        msg.toLowerCase().includes('clean') ||
        msg.toLowerCase().includes('nothing to commit')
      ) {
        toast({
          title: 'No Changes to Push',
          description: 'The workspace repository has no uncommitted code edits or new commits to push.',
          type: 'info',
        });
      } else {
        toast({
          title: 'Pull Request Error',
          description: msg,
          type: 'error',
        });
      }
    },
  });
};
