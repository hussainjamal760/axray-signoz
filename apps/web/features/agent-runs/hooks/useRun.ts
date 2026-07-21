import { useQuery } from '@tanstack/react-query';
import { getRun } from '../api/agent-runs.api';

export const useRun = (id: string) => {
  const isValid = !!id && id !== 'undefined' && id !== 'null';
  return useQuery({
    queryKey: ['runs', 'detail', id],
    queryFn: () => getRun(id),
    enabled: isValid,
  });
};
