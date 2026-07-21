import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateSession } from '../api/sessions.api';

export const useUpdateSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'archived' }) =>
      updateSession(id, { status }),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.invalidateQueries({ queryKey: ['sessions', variables.id] });
    },
  });
};
