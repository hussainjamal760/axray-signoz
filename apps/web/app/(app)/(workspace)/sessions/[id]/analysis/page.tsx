"use client";

import { useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useSession } from "@/features/sessions/hooks";
import { useRuns, useRunTimeline } from "@/features/agent-runs/hooks";
import { AgentRunSummary } from "@/features/agent-runs/types";

import { AnalysisHeader } from "@/features/sessions/components/AnalysisHeader";
import { RootCauseCard } from "@/features/sessions/components/RootCauseCard";
import { CodeDiffCard } from "@/features/sessions/components/CodeDiffCard";
import { SuggestedFixCard } from "@/features/sessions/components/SuggestedFixCard";
import { FailureVisualization } from "@/features/sessions/components/FailureVisualization";
import { EvidenceTimeline } from "@/features/sessions/components/EvidenceTimeline";
import { StatsModule } from "@/features/sessions/components/StatsModule";

export default function FailureAnalysisPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const queryRunId = searchParams?.get("runId") || searchParams?.get("run") || "";

  const { data: session, isLoading: sessionLoading } = useSession(id);
  const { data: runs = [], isLoading: runsLoading } = useRuns(id);

  // Automatically select run matching runId in URL, or default to the most recently FAILED run
  const activeRun: AgentRunSummary | null = useMemo(() => {
    if (queryRunId && runs.length > 0) {
      const match = runs.find((r) => r.id === queryRunId);
      if (match) return match;
    }
    const failedRun = runs.find((r) => r.status === "failed");
    if (failedRun) return failedRun;
    return runs[0] || null;
  }, [queryRunId, runs]);

  const { data: timelineData, isLoading: timelineLoading } = useRunTimeline(activeRun?.id, {
    enabled: Boolean(activeRun?.id),
    refetchInterval: false,
  });
  const events = timelineData?.events || [];

  if (sessionLoading || runsLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-0 bg-background text-primary-fixed font-black uppercase font-mono-label animate-pulse">
        Initializing Analysis Engine...
      </div>
    );
  }

  if (!activeRun) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-0 bg-background text-on-surface-variant font-mono-label">
        <span className="material-symbols-outlined text-4xl mb-4">search_off</span>
        <p className="uppercase font-bold text-sm tracking-widest">No failed runs found for analysis.</p>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto min-h-0 px-4 md:px-8 py-8 grid grid-cols-12 gap-6 w-full custom-scrollbar bg-background" data-lenis-prevent="true">
      <AnalysisHeader session={session} activeRun={activeRun} />

      {/* Main Content (Left Column) */}
      <section className="col-span-12 lg:col-span-8 flex flex-col space-y-6">
        <RootCauseCard activeRun={activeRun} events={events} />
        <CodeDiffCard
            sessionId={id}
            pullRequest={session?.pullRequest}
            diff={activeRun?.diff}
            filesChanged={activeRun?.filesChanged}
            insertions={activeRun?.insertions}
            deletions={activeRun?.deletions}
            diffTruncated={activeRun?.diffTruncated}
            diffSize={activeRun?.diffSize}
            changeSummary={activeRun?.changeSummary}
            isLoading={timelineLoading}
            isError={activeRun?.status === 'failed' && !activeRun?.diff}
        />
        <SuggestedFixCard activeRun={activeRun} />
      </section>

      {/* Right Sidebar */}
      <aside className="col-span-12 lg:col-span-4 flex flex-col space-y-6">
        <StatsModule activeRun={activeRun} />
        <FailureVisualization run={activeRun} />
        <EvidenceTimeline events={events} />
      </aside>
    </main>
  );
}
