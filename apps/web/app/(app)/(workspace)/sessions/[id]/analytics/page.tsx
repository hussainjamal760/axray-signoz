"use client";

import { useParams } from "next/navigation";
import { useRuns, useRunTimeline } from "@/features/agent-runs/hooks";
import { useAnalytics } from "@/features/sessions/hooks/useAnalytics";
import { useSession } from "@/features/sessions/hooks";

import { AnalyticsHeader } from "@/features/sessions/components/AnalyticsHeader";
import { MetricsRow } from "@/features/sessions/components/MetricsRow";
import { SuccessRateChart } from "@/features/sessions/components/SuccessRateChart";
import { FailureCategoriesChart } from "@/features/sessions/components/FailureCategoriesChart";
import { CostOverTimeChart } from "@/features/sessions/components/CostOverTimeChart";
import { ToolsUsageChart } from "@/features/sessions/components/ToolsUsageChart";
import { AnalyticsInsightCards } from "@/features/sessions/components/AnalyticsInsightCards";
import { TokensOverTimeChart } from "@/features/sessions/components/TokensOverTimeChart";
import { DurationDistributionChart } from "@/features/sessions/components/DurationDistributionChart";

// Fetch timeline for last N runs to aggregate tool usage
function useToolsAggregate(runs: ReturnType<typeof useRuns>["data"]) {
  const last10 = (runs || []).slice(0, 10);
  // We call timeline hooks for up to 10 runs to get tool usage breakdown
  const t0 = useRunTimeline(last10[0]?.id, { enabled: !!last10[0]?.id, refetchInterval: false });
  const t1 = useRunTimeline(last10[1]?.id, { enabled: !!last10[1]?.id, refetchInterval: false });
  const t2 = useRunTimeline(last10[2]?.id, { enabled: !!last10[2]?.id, refetchInterval: false });
  const t3 = useRunTimeline(last10[3]?.id, { enabled: !!last10[3]?.id, refetchInterval: false });
  const t4 = useRunTimeline(last10[4]?.id, { enabled: !!last10[4]?.id, refetchInterval: false });
  const t5 = useRunTimeline(last10[5]?.id, { enabled: !!last10[5]?.id, refetchInterval: false });
  const t6 = useRunTimeline(last10[6]?.id, { enabled: !!last10[6]?.id, refetchInterval: false });
  const t7 = useRunTimeline(last10[7]?.id, { enabled: !!last10[7]?.id, refetchInterval: false });
  const t8 = useRunTimeline(last10[8]?.id, { enabled: !!last10[8]?.id, refetchInterval: false });
  const t9 = useRunTimeline(last10[9]?.id, { enabled: !!last10[9]?.id, refetchInterval: false });

  const allEvents = [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9]
    .flatMap(q => q.data?.events || [])
    .filter(e => e.phase === "tool" && e.metadata?.toolName);

  const toolMap = new Map<string, number>();
  for (const ev of allEvents) {
    const name = ev.metadata!.toolName as string;
    toolMap.set(name, (toolMap.get(name) || 0) + 1);
  }

  return Array.from(toolMap.entries())
    .map(([name, calls]) => ({ name, calls }))
    .sort((a, b) => b.calls - a.calls)
    .slice(0, 8);
}

export default function AnalyticsDashboardPage() {
  const params = useParams();
  const sessionId = typeof params?.id === "string" ? params.id : "";

  const { data: session } = useSession(sessionId);
  const { data: runs = [], isLoading } = useRuns(sessionId);

  const metrics = useAnalytics(runs);
  const toolsData = useToolsAggregate(runs);

  return (
    <main
      className="flex-1 overflow-y-auto min-h-0 w-full relative z-10 custom-scrollbar p-6 md:p-8 bg-background"
      data-lenis-prevent="true"
    >
      <AnalyticsHeader session={session} metrics={metrics} isLoading={isLoading} />
      <MetricsRow metrics={metrics} isLoading={isLoading} />

      {/* Row 1: Success Rate (wide) + Failure Categories */}
      <div className="grid grid-cols-12 gap-6 mb-6 w-full">
        <SuccessRateChart dailyBuckets={metrics.dailyBuckets} isLoading={isLoading} />
        <FailureCategoriesChart categories={metrics.failureCategories} isLoading={isLoading} />
      </div>

      {/* Row 2: Cost + Tokens over time */}
      <div className="grid grid-cols-12 gap-6 mb-6 w-full">
        <CostOverTimeChart dailyBuckets={metrics.dailyBuckets} isLoading={isLoading} />
        <TokensOverTimeChart dailyBuckets={metrics.dailyBuckets} isLoading={isLoading} />
      </div>

      {/* Row 3: Tools + Duration distribution */}
      <div className="grid grid-cols-12 gap-6 mb-6 w-full">
        <ToolsUsageChart toolsData={toolsData} isLoading={isLoading} />
        <DurationDistributionChart runs={runs} isLoading={isLoading} />
      </div>

      <AnalyticsInsightCards metrics={metrics} isLoading={isLoading} />
    </main>
  );
}

