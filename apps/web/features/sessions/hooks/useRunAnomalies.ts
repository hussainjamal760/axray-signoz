import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export interface Anomaly {
  id: string;
  type: 'COST_SPIKE' | 'TOKEN_SPIKE' | 'EXECUTION_FAILURE' | 'OTHER';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
}

export interface AnomaliesResponse {
  success: boolean;
  count: number;
  anomalies: Anomaly[];
}

export function useRunAnomalies(runId: string | undefined) {
  return useQuery({
    queryKey: ['agent-runs', runId, 'anomalies'],
    queryFn: async (): Promise<Anomaly[]> => {
      if (!runId) return [];
      const res = await apiClient<AnomaliesResponse>(`/api/agent-runs/${runId}/anomalies`);
      return res.anomalies || [];
    },
    enabled: !!runId,
  });
}
