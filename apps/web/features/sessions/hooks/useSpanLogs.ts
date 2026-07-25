import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface SpanLog {
  type: string;
  text: string;
  timestamp: string;
  severity: string;
}

export interface SpanLogsResponse {
  success: boolean;
  count: number;
  logs: SpanLog[];
}

export function useSpanLogs(runId: string | undefined, spanId: string | undefined) {
  return useQuery({
    queryKey: ['agent-runs', runId, 'span-logs', spanId],
    queryFn: async (): Promise<SpanLog[]> => {
      if (!runId || !spanId) return [];
      const res = await apiClient<SpanLogsResponse>(`/api/agent-runs/${runId}/logs/span/${spanId}`);
      return res.logs;
    },
    enabled: !!runId && !!spanId,
  });
}
