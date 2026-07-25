import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export interface ToolPerformance {
  toolName: string;
  avgDurationMs: number;
  maxDurationMs: number;
  executionCount: number;
}

export interface ToolPerformanceResponse {
  success: boolean;
  tools: ToolPerformance[];
}

export function useToolPerformance(sessionId: string) {
  return useQuery<ToolPerformance[]>({
    queryKey: ["sessions", sessionId, "analytics", "tools"],
    queryFn: async () => {
      const data = await apiClient<ToolPerformanceResponse>(
        `/api/sessions/${sessionId}/analytics/tools`
      );
      if (!data.success) {
        throw new Error("Failed to fetch tool performance");
      }
      return data.tools || [];
    },
    enabled: !!sessionId,
    refetchInterval: 30000,
  });
}
