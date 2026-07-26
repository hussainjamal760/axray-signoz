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
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden bg-background font-sans">
      {/* Context Header */}
      <section className="px-6 py-4 border-b border-outline-variant/10 bg-surface-container-lowest/60 backdrop-blur-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 z-20">
        <div className="space-y-1.5 max-w-3xl">
          <h1 className="text-xl md:text-2xl text-on-surface font-bold tracking-tight truncate">
            {activeRun?.prompt || session?.repositoryFullName || "Observer Inspection"}
          </h1>
          
          <div className="flex flex-wrap gap-3 items-center pt-0.5">
            {activeRun && (
              <div className="flex items-center gap-2">
                <RunStatusBadge status={activeRun.status} />
              </div>
            )}

            {/* Run Selection Dropdown for Instant Switching */}
            {runs.length > 0 && (
              <div className="flex items-center gap-2 bg-surface-container/50 border border-outline-variant/10 px-3 py-1 rounded-xl text-xs font-mono text-primary-fixed">
                <span className="material-symbols-outlined text-sm">history</span>
                <select
                  value={activeRun?.id || ""}
                  onChange={(e) => handleSelectRunChange(e.target.value)}
                  className="bg-transparent text-primary-fixed font-mono text-xs font-bold outline-none cursor-pointer"
                >
                  {runs.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#0a0c10] text-on-surface">
                      Run #{r.id.slice(-6).toUpperCase()} ({r.status}) - {r.prompt.substring(0, 25)}...
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto items-center">
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-[#e6edf3] text-xs font-semibold rounded-2xl px-4 py-2 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            title="Open Self-Hosted SigNoz Observability Portal"
          >
            <span className="material-symbols-outlined text-sm text-primary-fixed">monitoring</span>
            <span>Open SigNoz</span>
            <span className="material-symbols-outlined text-xs text-white/40 group-hover:text-white/80 transition-colors">arrow_outward</span>
          </a>

          <Link
            href={analysisLink}
            className="group relative flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold px-5 py-2 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 hover:shadow-[0_0_15px_rgba(244,63,94,0.25)] hover:-translate-y-0.5 active:translate-y-0"
          >
            <span className="material-symbols-outlined text-sm">analytics</span>
            <span>EXPLAIN FAILURE</span>
          </Link>
        </div>
      </section>

      {/* Three-Pane Observer View */}
      <section className="flex flex-col xl:flex-row flex-1 min-h-0 overflow-hidden z-10 relative">
        {/* Left Column: Timeline Panel */}
        <div className="w-full xl:w-1/3 xl:min-w-[340px] xl:max-w-[440px] flex flex-col h-full min-h-0 overflow-hidden border-r border-outline-variant/10">
          <TimelinePanel
            selectedRunId={activeRun?.id}
            runStatus={activeRun?.status}
            sessionId={id}
            isLive={false}
            forcedEvents={events.slice(0, activeStepIndex + 1)}
            className="h-full border-0 !shadow-none !rounded-none"
          />
        </div>

        {/* Middle Column: Code Diff Viewer */}
        <div className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden">
          <CodeViewerPanel activeRun={activeRun} isLoading={runsLoading} />
        </div>
        
        {/* Right Column: Intelligence Panel */}
        <IntelligencePanel activeRun={activeRun} events={events} />
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
