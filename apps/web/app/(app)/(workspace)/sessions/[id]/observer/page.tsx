"use client";

import { useState, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "@/features/sessions/hooks";
import { useRuns, useRunTimeline } from "@/features/agent-runs/hooks";
import { AgentRunSummary } from "@/features/agent-runs/types";
import { TimelinePanel } from "@/features/sessions/components/TimelinePanel";
import { CodeViewerPanel } from "@/features/sessions/components/CodeViewerPanel";
import { IntelligencePanel } from "@/features/sessions/components/IntelligencePanel";
import { ReplayHUD } from "@/features/sessions/components/ReplayHUD";
import { RunStatusBadge } from "@/features/agent-runs/components/RunStatusBadge";
import Link from "next/link";

import { TelemetryBar } from "@/features/sessions/components/TelemetryBar";

export default function ObserverDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = typeof params?.id === "string" ? params.id : "";
  const queryRunId = searchParams?.get("runId") || searchParams?.get("run") || "";

  const { data: session } = useSession(id);
  const { data: runs = [], isLoading: runsLoading } = useRuns(id);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Automatically select run matching runId in URL, or default to latest run
  const activeRun: AgentRunSummary | null = useMemo(() => {
    if (queryRunId && runs.length > 0) {
      const match = runs.find((r) => r.id === queryRunId);
      if (match) return match;
    }
    return runs[0] || null;
  }, [queryRunId, runs]);

  // Fetch authoritative SigNoz timeline events for trajectory replay
  const { data: timelineData } = useRunTimeline(activeRun?.id, {
    enabled: Boolean(activeRun?.id),
    refetchInterval: false,
  });

  const events = timelineData?.events || [];

  const handleSelectRunChange = (newRunId: string) => {
    if (newRunId) {
      setActiveStepIndex(0);
      router.push(`/sessions/${id}/observer?runId=${newRunId}`);
    }
  };

  const analysisLink = id ? `/sessions/${id}/analysis` : "/sessions";
  const backToSessionLink = id ? `/sessions/${id}` : "/sessions";

  return (
    <div className="flex-1 flex flex-col overflow-y-auto min-h-0 bg-background custom-scrollbar" data-lenis-prevent="true">
      {/* Context Header */}
      <section className="p-gutter border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 font-mono-label text-xs text-on-surface-variant">
            <Link href={backToSessionLink} className="hover:text-primary-fixed cursor-pointer flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              SESSION #{id ? id.slice(-4).toUpperCase() : "1042"}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary-fixed font-bold">
              {activeRun ? `RUN #${activeRun.id.slice(-6).toUpperCase()}` : 'OBSERVER'}
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl md:text-3xl text-primary-fixed uppercase font-black truncate">
            {activeRun?.prompt || session?.repositoryFullName || "Observer Inspection"}
          </h1>
          
          <div className="flex flex-wrap gap-4 items-center">
            {session?.repositoryFullName && (
              <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-xs font-bold">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">folder</span>
                {session.repositoryFullName} ({session.branch || 'main'})
              </div>
            )}

            {activeRun && (
              <div className="flex items-center gap-2">
                <RunStatusBadge status={activeRun.status} />
              </div>
            )}

            {/* Run Selection Dropdown for Instant Switching */}
            {runs.length > 0 && (
              <div className="flex items-center gap-2 bg-black border-2 border-outline px-3 py-1 font-mono-label text-xs font-bold text-primary-fixed">
                <span className="material-symbols-outlined text-sm">history</span>
                <select
                  value={activeRun?.id || ""}
                  onChange={(e) => handleSelectRunChange(e.target.value)}
                  className="bg-transparent text-primary-fixed font-mono-label text-xs font-black outline-none cursor-pointer"
                >
                  {runs.map((r) => (
                    <option key={r.id} value={r.id} className="bg-black text-on-surface">
                      Run #{r.id.slice(-6).toUpperCase()} ({r.status}) - {r.prompt.substring(0, 30)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-surface-container-highest text-white font-mono-label text-xs font-black uppercase border-2 border-outline px-3 py-2 hover:bg-surface-variant transition-colors brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
            title="Open Self-Hosted SigNoz Observability Portal"
          >
            <span className="material-symbols-outlined text-sm text-primary-fixed">monitoring</span>
            <span>Open SigNoz</span>
            <span className="material-symbols-outlined text-xs text-on-surface-variant">open_in_new</span>
          </a>

          <Link
            href={analysisLink}
            className="bg-primary-fixed text-on-primary-fixed font-black px-6 py-3 border-[3px] border-on-primary-fixed neo-shadow hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center uppercase text-sm"
          >
            EXPLAIN FAILURE
          </Link>
        </div>
      </section>

      {/* Telemetry Bar */}
      <TelemetryBar />

      {/* Three-Pane Observer View */}
      <section className="flex flex-col xl:flex-row flex-1 z-10 relative">
        {/* Left Column: Timeline Panel */}
        <div className="w-full xl:w-1/3 xl:min-w-[340px] xl:max-w-[440px] flex flex-col xl:h-full border-r-[3px] border-outline">
          <TimelinePanel
            selectedRunId={activeRun?.id}
            runStatus={activeRun?.status}
            sessionId={id}
            isLive={false}
            forcedEvents={events[activeStepIndex] ? [events[activeStepIndex]] : []}
            className="h-full border-0 !shadow-none"
          />
        </div>

        {/* Middle Column: Code Diff Viewer */}
        <div className="flex-1 flex flex-col xl:h-full min-w-0">
          <CodeViewerPanel activeRun={activeRun} isLoading={runsLoading} />
        </div>
        
        {/* Right Column: Intelligence Panel */}
        <IntelligencePanel activeRun={activeRun} />
      </section>

      {/* Interactive Time-Travel Replay HUD */}
      <div className="sticky bottom-0 w-full z-50">
        <ReplayHUD
          activeRun={activeRun}
          events={events}
          activeStepIndex={activeStepIndex}
          onStepChange={setActiveStepIndex}
        />
      </div>
    </div>
  );
}
