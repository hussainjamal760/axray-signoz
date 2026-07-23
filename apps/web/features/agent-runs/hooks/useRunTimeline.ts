import { useQuery } from '@tanstack/react-query';
import { getRunTimeline } from '../api/agent-runs.api';
import { TimelineResponse } from '../types/agent-runs.types';

export interface UseRunTimelineOptions {
  refetchInterval?: number | false;
  enabled?: boolean;
}

export function useRunTimeline(runId?: string, options?: UseRunTimelineOptions) {
  return useQuery<TimelineResponse>({
    queryKey: ['agent-runs', runId, 'timeline'],
    queryFn: () => getRunTimeline(runId!),
    enabled: Boolean(runId) && (options?.enabled ?? true),
    refetchInterval: options?.refetchInterval ?? false,
    staleTime: 1000,
  });
}
