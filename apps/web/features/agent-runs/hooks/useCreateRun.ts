import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRun } from '../api/agent-runs.api';
import { AgentRunSummary } from '../types/agent-runs.types';

export const useCreateRun = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { prompt: string }) => createRun(sessionId, data),
    onSuccess: (newRun) => {
      // Optimistically insert newly created pending run for instant UI feedback
      queryClient.setQueryData<AgentRunSummary[]>(['runs', sessionId], (old = []) => [newRun, ...old]);

      // Invalidate queries to guarantee server source-of-truth accuracy
      queryClient.invalidateQueries({ queryKey: ['runs', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    },
  });
};
