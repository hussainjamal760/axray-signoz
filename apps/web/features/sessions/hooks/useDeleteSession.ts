import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteSession } from '../api/sessions.api';

export const useDeleteSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSession,
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      queryClient.removeQueries({ queryKey: ['sessions', id] });
    },
  });
};
