import { useQuery } from '@tanstack/react-query';
import { getSessionTimeline } from '../api/sessions.api';
import { TimelineItem } from '../types/sessions.types';

export function useTimeline(sessionId: string, options?: { refetchInterval?: number | false }) {
  return useQuery<TimelineItem[]>({
    queryKey: ['timeline', sessionId],
    queryFn: () => getSessionTimeline(sessionId),
    enabled: !!sessionId,
    refetchInterval: options?.refetchInterval ?? false,
  });
}
