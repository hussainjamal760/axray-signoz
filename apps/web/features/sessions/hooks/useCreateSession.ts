import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createSession } from '../api/sessions.api';

export const useCreateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSession,
    onSuccess: (data) => {
      // Invalidate the sessions list cache to automatically include the new session
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
    },
  });
};
