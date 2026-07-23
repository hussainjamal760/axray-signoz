import { useQuery } from '@tanstack/react-query';
import { getRunsForSession } from '../api/agent-runs.api';

export const useRuns = (sessionId: string, options?: { refetchInterval?: number | false; enabled?: boolean }) => {
  const isValid = !!sessionId && sessionId !== 'undefined' && sessionId !== 'null';
  return useQuery({
    queryKey: ['runs', sessionId],
    queryFn: () => getRunsForSession(sessionId),
    enabled: isValid && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval,
    refetchOnMount: true,
    staleTime: 0,
  });
};
