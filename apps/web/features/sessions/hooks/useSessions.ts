import { useQuery } from '@tanstack/react-query';
import { getSessions } from '../api/sessions.api';

export const useSessions = () => {
  return useQuery({
    queryKey: ['sessions'],
    queryFn: getSessions,
  });
};
