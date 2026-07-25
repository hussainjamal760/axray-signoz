import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateRun } from '../api/agent-runs.api';

export const useCancelRun = (sessionId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: string) => updateRun(runId, { status: 'cancelled' }),
    onSuccess: (data) => {
      // Invalidate runs for the specific session
      queryClient.invalidateQueries({ queryKey: ['runs', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['run', data.id] });
    },
  });
};
