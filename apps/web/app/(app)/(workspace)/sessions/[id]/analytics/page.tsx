"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRuns, useRunTimeline } from "@/features/agent-runs/hooks";
import { useAnalytics } from "@/features/sessions/hooks/useAnalytics";
import { useSession } from "@/features/sessions/hooks";
import { AgentRunSummary } from "@/features/agent-runs/types";

import { AnalyticsHeader } from "@/features/sessions/components/AnalyticsHeader";
import { MetricsRow } from "@/features/sessions/components/MetricsRow";
import { SuccessRateChart } from "@/features/sessions/components/SuccessRateChart";
import { FailureCategoriesChart } from "@/features/sessions/components/FailureCategoriesChart";
import { CostOverTimeChart } from "@/features/sessions/components/CostOverTimeChart";
import { ToolsUsageChart } from "@/features/sessions/components/ToolsUsageChart";
import { AnalyticsInsightCards } from "@/features/sessions/components/AnalyticsInsightCards";
import { TokensOverTimeChart } from "@/features/sessions/components/TokensOverTimeChart";
import { DurationDistributionChart } from "@/features/sessions/components/DurationDistributionChart";
import { ToolPerformanceCard } from "@/features/sessions/components/ToolPerformanceCard";

import { SmartAlertsTab } from "@/features/sessions/components/SmartAlertsTab";

// Fetch timeline for up to 10 runs and aggregate tool usage from OpenTelemetry spans
function useToolsAggregate(filteredRuns: AgentRunSummary[]) {
  const last10 = filteredRuns.slice(0, 10);
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

  return useMemo(() => {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t0.data, t1.data, t2.data, t3.data, t4.data, t5.data, t6.data, t7.data, t8.data, t9.data]);
}

export default function AnalyticsDashboardPage() {
  const params = useParams();
  const sessionId = typeof params?.id === "string" ? params.id : "";

  const { data: session } = useSession(sessionId);
  const { data: allRuns = [], isLoading } = useRuns(sessionId);

  const metrics = useAnalytics(allRuns);
  const toolsData = useToolsAggregate(allRuns);

  return (
    <main
      className="flex-1 overflow-y-auto min-h-0 w-full relative z-10 custom-scrollbar p-6 md:p-8 bg-background"
      style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      data-lenis-prevent="true"
    >
      <AnalyticsHeader
        session={session}
        metrics={metrics}
        isLoading={isLoading}
      />
      <MetricsRow metrics={metrics} isLoading={isLoading} />

      <div className="mb-6 w-full">
        <SmartAlertsTab runs={allRuns} />
      </div>

      {/* Row 1: Success/Failure trend + Failure causes */}
      <div className="grid grid-cols-12 gap-6 mb-6 w-full">
        <SuccessRateChart dailyBuckets={metrics.dailyBuckets} isLoading={isLoading} />
        <FailureCategoriesChart categories={metrics.failureCategories} isLoading={isLoading} />
      </div>

      {/* Row 2: Cost + Tokens over time */}
      <div className="grid grid-cols-12 gap-6 mb-6 w-full">
        <CostOverTimeChart dailyBuckets={metrics.dailyBuckets} isLoading={isLoading} />
        <TokensOverTimeChart dailyBuckets={metrics.dailyBuckets} isLoading={isLoading} />
      </div>

      {/* Row 3: Tools breakdown + Duration histogram */}
      <div className="grid grid-cols-12 gap-6 mb-6 w-full h-[400px]">
        <div className="col-span-12 lg:col-span-4 h-full">
          <ToolsUsageChart toolsData={toolsData} isLoading={isLoading} />
        </div>
        <div className="col-span-12 lg:col-span-4 h-full">
          <ToolPerformanceCard sessionId={sessionId} />
        </div>
        <div className="col-span-12 lg:col-span-4 h-full">
          <DurationDistributionChart runs={allRuns} isLoading={isLoading} />
        </div>
      </div>

      <AnalyticsInsightCards metrics={metrics} isLoading={isLoading} />
    </main>
  );
}
