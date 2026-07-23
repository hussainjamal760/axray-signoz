"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, useSessionSocket } from "@/features/sessions/hooks";
import { useRuns, useCreateRun } from "@/features/agent-runs/hooks";
import { AgentRunSummary, TimelineEvent } from "@/features/agent-runs/types";
import { AgentRunsList } from "@/features/agent-runs/components";
import {
  SessionHeader,
  InitializeContextPanel,
  TimelinePanel,
  LiveTraceTree,
  TerminalPanel,
  CodeDiffCard,
} from "@/features/sessions/components";

export default function SessionIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const isValidId = !!id && id !== "undefined" && id !== "null";

  const [manuallySelectedRun, setManuallySelectedRun] = useState<AgentRunSummary | null>(null);

  // Hydrate initial REST data from backend API on every page mount (staleTime: 0, refetchOnMount: true)
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession(id, { refetchInterval: false });
  const { data: fetchedRuns = [], isLoading: runsLoading, refetch: refetchRuns } = useRuns(id, { refetchInterval: false });
  const { mutate: createRun, isPending: isCreatingRun } = useCreateRun(id);

  // Maintain local runs list for instant Socket.IO real-time updates
  const [runsState, setRunsState] = useState<AgentRunSummary[]>([]);

  // Synchronize runsState with fresh backend fetchedRuns on mount and API refetches
  useEffect(() => {
    if (fetchedRuns.length > 0) {
      setRunsState(fetchedRuns);
    }
  }, [fetchedRuns]);

  // Evaluate active run status from backend state
  const activeOrSelectedRun = manuallySelectedRun || runsState[0] || fetchedRuns[0] || null;
  const isSelectedRunExecuting = activeOrSelectedRun?.status === 'running' || activeOrSelectedRun?.status === 'pending';

  // Sockets connect and listen ONLY while an agent run is actively executing (status === 'running' | 'pending')
  const { liveEvents, liveTraces, latestEvent, clearLiveEvents } = useSessionSocket(isValidId ? id : undefined, {
    enabled: isSelectedRunExecuting,
  });

  // Handle incoming Socket.IO events to update live run state and history
  useEffect(() => {
    if (!latestEvent) return;

    if (latestEvent.eventType === 'run.completed' || latestEvent.eventType === 'run.failed') {
      const isFailed = latestEvent.eventType === 'run.failed';
      const meta = latestEvent.metadata || {};
      const targetId = latestEvent.runId;

      if (targetId) {
        setRunsState((prev) => {
          const idx = prev.findIndex((r) => r.id === targetId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              status: isFailed ? 'failed' : 'completed',
              response: (meta.response as string) || updated[idx].response,
              tokensUsed: (meta.tokensUsed as number) || updated[idx].tokensUsed,
              durationMs: latestEvent.durationMs || updated[idx].durationMs,
              changeSummary: (meta.changeSummary as string) || updated[idx].changeSummary,
              filesChanged: (meta.filesChanged as unknown as string[]) || updated[idx].filesChanged,
              insertions: (meta.insertions as number) || updated[idx].insertions,
              deletions: (meta.deletions as number) || updated[idx].deletions,
              errorMessage: isFailed ? (meta.errorMessage as string) : undefined,
              completedAt: latestEvent.timestamp,
            };
            return updated;
          }
          return prev;
        });

        // Synchronize manuallySelectedRun if it matches targetId
        setManuallySelectedRun((prev) => {
          if (prev && prev.id === targetId) {
            return {
              ...prev,
              status: isFailed ? 'failed' : 'completed',
              response: (meta.response as string) || prev.response,
              tokensUsed: (meta.tokensUsed as number) || prev.tokensUsed,
              durationMs: latestEvent.durationMs || prev.durationMs,
              changeSummary: (meta.changeSummary as string) || prev.changeSummary,
              filesChanged: (meta.filesChanged as unknown as string[]) || prev.filesChanged,
              insertions: (meta.insertions as number) || prev.insertions,
              deletions: (meta.deletions as number) || prev.deletions,
              errorMessage: isFailed ? (meta.errorMessage as string) : undefined,
              completedAt: latestEvent.timestamp,
            };
          }
          return prev;
        });

        // Refetch fresh authoritative data from MongoDB API to ensure React Query cache is fully synchronized
        void refetchRuns();
      }
    } else if (latestEvent.eventType === 'git.diff.completed') {
      const meta = latestEvent.metadata || {};
      const targetId = latestEvent.runId;

      if (targetId) {
        setRunsState((prev) => {
          const idx = prev.findIndex((r) => r.id === targetId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              diff: (meta.rawDiff as string) || updated[idx].diff || '',
              filesChanged: (meta.filesChanged as unknown as string[]) || updated[idx].filesChanged || [],
              insertions: (meta.insertions as number) ?? updated[idx].insertions ?? 0,
              deletions: (meta.deletions as number) ?? updated[idx].deletions ?? 0,
              diffTruncated: (meta.diffTruncated as boolean) || updated[idx].diffTruncated || false,
              diffSize: (meta.diffSize as number) || updated[idx].diffSize || 0,
              changeSummary: (meta.changeSummary as string) || updated[idx].changeSummary || '',
            };
            return updated;
          }
          return prev;
        });

        setManuallySelectedRun((prev) => {
          if (prev && prev.id === targetId) {
            return {
              ...prev,
              diff: (meta.rawDiff as string) || prev.diff || '',
              filesChanged: (meta.filesChanged as unknown as string[]) || prev.filesChanged || [],
              insertions: (meta.insertions as number) ?? prev.insertions ?? 0,
              deletions: (meta.deletions as number) ?? prev.deletions ?? 0,
              diffTruncated: (meta.diffTruncated as boolean) || prev.diffTruncated || false,
              diffSize: (meta.diffSize as number) || prev.diffSize || 0,
              changeSummary: (meta.changeSummary as string) || prev.changeSummary || '',
            };
          }
          return prev;
        });
      }
    }
  }, [latestEvent, refetchRuns]);

  // Loading state for Git diff terminates as soon as run completes/fails OR diff arrives
  const isDiffLoading = isSelectedRunExecuting && activeOrSelectedRun?.diff === undefined;
  const isDiffError = (activeOrSelectedRun?.status === 'failed' && !activeOrSelectedRun?.diff) || false;

  // Map Socket.IO liveEvents into TimelineEvent[] format
  const liveTimelineEvents: TimelineEvent[] = useMemo(() => {
    return liveEvents.map((evt, idx) => ({
      id: `${evt.eventType}-${idx}-${evt.timestamp}`,
      timestamp: evt.timestamp,
      title: evt.title,
      description: evt.description,
      phase: evt.phase,
      eventType: evt.eventType,
      status: evt.status,
      durationMs: evt.durationMs,
      metadata: evt.metadata,
    }));
  }, [liveEvents]);

  // Derive human-readable live status text for prompt box
  const liveStatusText = useMemo(() => {
    if (!latestEvent) return isCreatingRun ? "Initializing Run..." : undefined;
    switch (latestEvent.eventType) {
      case "workspace.started":
      case "workspace.cloning":
        return "Workspace Preparing...";
      case "workspace.analysis.started":
      case "workspace.analysis.completed":
        return "Analyzing Repository...";
      case "workspace.dependencies.install.started":
      case "workspace.dependencies.install.completed":
        return "Installing Dependencies...";
      case "llm.request.started":
      case "llm.request.completed":
        return `Calling LLM (Turn ${latestEvent.metadata?.turn || 1})...`;
      case "tool.started":
      case "tool.completed":
        return `Executing Tool: ${latestEvent.metadata?.toolName || 'tool'}...`;
      case "git.diff.started":
      case "git.diff.completed":
        return "Generating Git Diff...";
      case "run.completed":
        return "Run Completed";
      case "run.failed":
        return "Run Failed";
      default:
        return "Agent Executing...";
    }
  }, [latestEvent, isCreatingRun]);

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="font-mono-label text-sm uppercase animate-pulse text-primary-fixed font-black">
          Loading Workspace Details...
        </div>
      </div>
    );
  }

  if (sessionError || !session || !isValidId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black uppercase text-error mb-4">Workspace Error</h2>
        <p className="font-mono-label text-sm text-on-surface-variant mb-6">
          The requested session is either invalid or could not be loaded.
        </p>
        <button
          onClick={() => router.push("/sessions")}
          className="bg-primary-fixed text-on-primary px-6 py-3 border-2 border-on-background font-black uppercase brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  const handleSelectRun = (run: AgentRunSummary) => {
    setManuallySelectedRun(run);
  };

  const handlePromptSubmit = (promptText: string) => {
    clearLiveEvents();
    createRun(
      { prompt: promptText },
      {
        onSuccess: (newRun) => {
          setManuallySelectedRun(null); // Clear manual selection so activeOrSelectedRun tracks latest runsState[0]
          setRunsState((prev) => [newRun, ...prev]);
        },
      }
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden">
      {/* Infrastructure Overview Header */}
      <SessionHeader session={session} />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8 custom-scrollbar" data-lenis-prevent="true">
        <div className="grid grid-cols-12 gap-8 items-stretch">

          {/* Row 1: Initialize Context & Timeline */}
          <div className="col-span-12 lg:col-span-7 flex flex-col">
            <InitializeContextPanel
              onSubmit={handlePromptSubmit}
              isPending={isCreatingRun}
              isRunning={isSelectedRunExecuting}
              liveStatusText={liveStatusText}
              disabled={session.containerStatus === 'failed' || session.containerStatus === 'stopped'}
            />
          </div>

          <div className="col-span-12 lg:col-span-5 flex flex-col">
            <TimelinePanel
              selectedRunId={activeOrSelectedRun?.id}
              runStatus={activeOrSelectedRun?.status}
              sessionId={id}
              liveSocketEvents={liveTimelineEvents}
              isLive={isSelectedRunExecuting}
            />
          </div>

          {/* Row 2: Live Trace Tree and Terminal Window */}
          <section className="col-span-12 grid grid-cols-12 gap-8 items-stretch">
            <div className="col-span-12 md:col-span-5 h-full">
              <LiveTraceTree sessionId={id} runId={activeOrSelectedRun?.id} liveTraces={liveTraces} />
            </div>

            <div className="col-span-12 md:col-span-7 h-full">
              <TerminalPanel session={session} selectedRun={activeOrSelectedRun} />
            </div>
          </section>

          {/* Row 3: Dedicated Full-Width Git Diff Artifact Section */}
          <section className="col-span-12 mt-8">
            <CodeDiffCard
              diff={activeOrSelectedRun?.diff}
              filesChanged={activeOrSelectedRun?.filesChanged}
              insertions={activeOrSelectedRun?.insertions}
              deletions={activeOrSelectedRun?.deletions}
              diffTruncated={activeOrSelectedRun?.diffTruncated}
              diffSize={activeOrSelectedRun?.diffSize}
              changeSummary={activeOrSelectedRun?.changeSummary}
              isLoading={isDiffLoading}
              isError={isDiffError}
            />
          </section>

          {/* Row 4: Full-Width Execution History Section */}
          <section className="col-span-12 mt-8">
            <div className="bg-surface border-[3px] border-outline p-6 brutalist-shadow">
              <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed">history</span>
                Execution History
              </h3>
              <AgentRunsList runs={runsState.length > 0 ? runsState : fetchedRuns} onSelectRun={handleSelectRun} loading={runsLoading} />
            </div>
          </section>

        </div>
      </div>

      {/* Footer */}
      <footer className="h-[56px] border-t-[3px] border-outline-variant bg-background flex items-center justify-between px-8 flex-shrink-0">
        <p className="font-mono-label text-[10px] font-bold uppercase text-outline-variant">© 2024 AGENT_BLACK_BOX // RADICAL_SYNTAX_MODE</p>
        <div className="hidden sm:flex items-center gap-8">
          <a className="font-mono-label text-[10px] font-bold uppercase text-outline-variant hover:text-primary-fixed" href="#">Privacy</a>
          <a className="font-mono-label text-[10px] font-bold uppercase text-outline-variant hover:text-primary-fixed" href="#">Terms</a>
          <a className="font-mono-label text-[10px] font-bold uppercase text-outline-variant hover:text-primary-fixed" href="#">Sec_Policy</a>
          <a className="font-mono-label text-[10px] font-bold uppercase text-primary-fixed border border-primary-fixed px-2 py-0.5" href="#">Github_Link</a>
        </div>
      </footer>
    </div>
  );
}
