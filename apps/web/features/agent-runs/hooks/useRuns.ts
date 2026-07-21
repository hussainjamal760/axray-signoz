import { useQuery } from '@tanstack/react-query';
import { getRunsForSession } from '../api/agent-runs.api';

export const useRuns = (sessionId: string, options?: { refetchInterval?: number | false }) => {
  const isValid = !!sessionId && sessionId !== 'undefined' && sessionId !== 'null';
  return useQuery({
    queryKey: ['runs', sessionId],
    queryFn: () => getRunsForSession(sessionId),
    enabled: isValid,
    refetchInterval: options?.refetchInterval,
    refetchIntervalInBackground: false,
  });
};
