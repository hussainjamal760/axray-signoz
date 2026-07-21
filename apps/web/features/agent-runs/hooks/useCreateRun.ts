import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRun } from '../api/agent-runs.api';

export const useCreateRun = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { prompt: string }) => createRun(sessionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['runs', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', sessionId] });
    },
  });
};
