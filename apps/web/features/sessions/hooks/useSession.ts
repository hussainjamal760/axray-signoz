import { useQuery } from '@tanstack/react-query';
import { getSessionById } from '../api/sessions.api';

export const useSession = (id: string) => {
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => getSessionById(id),
    enabled: !!id,
  });
};
