import { useQuery } from '@tanstack/react-query';
import { getRunsForSession } from '../api/agent-runs.api';

export const useRuns = (sessionId: string) => {
  const isValid = !!sessionId && sessionId !== 'undefined' && sessionId !== 'null';
  return useQuery({
    queryKey: ['runs', sessionId],
    queryFn: () => getRunsForSession(sessionId),
    enabled: isValid,
  });
};
