import { useQuery } from '@tanstack/react-query';
import { getSessionById } from '../api/sessions.api';

export const useSession = (id: string, options?: { refetchInterval?: number | false }) => {
  const isValidId = !!id && id !== 'undefined' && id !== 'null';
  return useQuery({
    queryKey: ['sessions', id],
    queryFn: () => getSessionById(id),
    enabled: isValidId,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
  });
};
