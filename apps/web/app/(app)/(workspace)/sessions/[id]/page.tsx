"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSession, useSessionSocket } from "@/features/sessions/hooks";
import { useRuns, useCreateRun, useCancelRun } from "@/features/agent-runs/hooks";
import { AgentRunSummary, TimelineEvent } from "@/features/agent-runs/types";
import { AgentRunsList } from "@/features/agent-runs/components";
import {
  SessionHeader,
  TelemetryBar,
  InitializeContextPanel,
  TimelinePanel,
  TerminalPanel,
  CodeDiffCard,
  FailureVisualization,
} from "@/features/sessions/components";

export default function SessionIdPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = typeof params?.id === "string" ? params.id : "";
  const isValidId = !!id && id !== "undefined" && id !== "null";

  const [manuallySelectedRun, setManuallySelectedRun] = useState<AgentRunSummary | null>(null);
  const [runErrorBanner, setRunErrorBanner] = useState<string | null>(null);

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession(id, { refetchInterval: false });
  const { data: fetchedRuns = [], isLoading: runsLoading, refetch: refetchRuns } = useRuns(id, { refetchInterval: false });
  const { mutate: createRun, isPending: isCreatingRun } = useCreateRun(id);
  const { mutate: cancelRun } = useCancelRun(id);

  const [runsState, setRunsState] = useState<AgentRunSummary[]>([]);

  useEffect(() => {
    if (fetchedRuns.length > 0) {
      setRunsState(fetchedRuns);
    }
  }, [fetchedRuns]);

  const activeOrSelectedRun = manuallySelectedRun || runsState[0] || fetchedRuns[0] || null;
  const isSelectedRunExecuting = activeOrSelectedRun?.status === 'running' || activeOrSelectedRun?.status === 'pending';

  const { liveEvents, liveTerminalLines, latestEvent, clearLiveEvents } = useSessionSocket(isValidId ? id : undefined, {
    enabled: isSelectedRunExecuting,
  });

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

  const isDiffLoading = isSelectedRunExecuting && activeOrSelectedRun?.diff === undefined;
  const isDiffError = (activeOrSelectedRun?.status === 'failed' && !activeOrSelectedRun?.diff) || false;

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

  const liveStatusText = useMemo(() => {
    if (!latestEvent) return isCreatingRun ? "Initializing Run..." : undefined;
    switch (latestEvent.eventType) {
      case "workspace.started":
      case "workspace.cloning":
        return "Workspace Preparing...";
      case "workspace.analysis.started":
      case "workspace.analysis.completed":
        return "Analyzing Repository...";
      case "workspace.runtime.install.started":
      case "workspace.runtime.selected":
        return "Provisioning Runtime...";
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
      case "run.failed":
        return undefined;
      default:
        return "Agent Execution Active...";
    }
  }, [latestEvent, isCreatingRun]);

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-background">
        <div className="text-sm font-semibold animate-pulse text-primary-fixed flex items-center gap-3">
          <span className="material-symbols-outlined animate-spin text-xl">progress_activity</span>
          Loading Workspace Details...
        </div>
      </div>
    );
  }

  if (sessionError || !session || !isValidId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-background min-h-screen">
        <h2 className="text-2xl font-semibold text-rose-400 mb-2">Workspace Error</h2>
        <p className="text-sm text-on-surface-variant mb-6 font-light max-w-md">
          The requested session is either invalid or could not be loaded.
        </p>
        <button
          onClick={() => router.push("/sessions")}
          className="bg-primary-fixed text-black px-6 py-3 rounded-2xl font-semibold text-sm hover:brightness-110 active:scale-[0.98] transition-all shadow-sm"
        >
          Back to Sessions
        </button>
      </div>
    );
  }

  const handleSelectRun = (run: AgentRunSummary) => {
    router.push(`/sessions/${id}/observer?runId=${run.id}`);
  };

  const handlePromptSubmit = (promptText: string) => {
    setRunErrorBanner(null);
    clearLiveEvents();
    createRun(
      { prompt: promptText },
      {
        onSuccess: (newRun) => {
          setManuallySelectedRun(null);
          setRunsState((prev) => [newRun, ...prev]);
        },
        onError: (err: any) => {
          const msg = err.message || "Failed to start agent run.";
          setRunErrorBanner(msg);
          queryClient.invalidateQueries({ queryKey: ['session', id] });
          queryClient.invalidateQueries({ queryKey: ['sessions'] });
        },
      }
    );
  };

  const isSessionClosedOrCompleted =
    session.containerStatus === 'failed' ||
    session.containerStatus === 'stopped' ||
    session.status === 'completed' ||
    session.status === 'archived' ||
    session.pullRequest?.status === 'merged' ||
    session.pullRequest?.status === 'closed';

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden font-sans">
      {/* Infrastructure Overview Header with Integrated Telemetry */}
      <SessionHeader
        session={session}
        events={liveEvents}
        latestEvent={latestEvent}
        isSessionActive={isSelectedRunExecuting}
        selectedRun={activeOrSelectedRun}
      />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 md:p-8 space-y-8 custom-scrollbar max-w-[1600px] w-full mx-auto" data-lenis-prevent="true">
        <div className="grid grid-cols-12 gap-8 items-start">

          {/* Rejection / Error Notification Banner */}
          {runErrorBanner && (
            <div className="col-span-12 bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 text-xs font-medium text-rose-300 flex items-center justify-between shadow-sm animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-base text-rose-400">warning</span>
                <span>{runErrorBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setRunErrorBanner(null)}
                className="text-rose-400 hover:text-white font-semibold uppercase text-[10px] tracking-wider transition-colors"
              >
                DISMISS
              </button>
            </div>
          )}

          {/* Failure & Error Visualization Banner */}
          {(activeOrSelectedRun?.status === 'failed' || activeOrSelectedRun?.status === 'incomplete' || latestEvent?.eventType === 'run.failed') && (
            <div className="col-span-12">
              <FailureVisualization
                run={activeOrSelectedRun}
                latestEvent={latestEvent}
                onRetry={() => activeOrSelectedRun?.prompt && handlePromptSubmit(activeOrSelectedRun.prompt)}
              />
            </div>
          )}

          {/* Left Column (5 Cols / 40%): Controls, Live Progress Timeline & Execution History */}
          <div className="col-span-12 lg:col-span-5 flex flex-col gap-6">
            <InitializeContextPanel
              onSubmit={handlePromptSubmit}
              onCancel={() => activeOrSelectedRun?.id && cancelRun(activeOrSelectedRun.id)}
              isPending={isCreatingRun}
              isRunning={isSelectedRunExecuting}
              liveStatusText={liveStatusText}
              disabled={isSessionClosedOrCompleted}
            />

            <TimelinePanel
              selectedRunId={activeOrSelectedRun?.id}
              runStatus={activeOrSelectedRun?.status}
              sessionId={id}
              liveSocketEvents={liveTimelineEvents}
              isLive={isSelectedRunExecuting}
              className="h-[360px] max-h-[360px]"
            />

            <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 shadow-sm space-y-4 transition-all hover:border-primary-fixed/30">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary-fixed text-lg">history</span>
                <h3 className="text-sm font-semibold text-on-surface">Execution History</h3>
              </div>
              <AgentRunsList runs={runsState.length > 0 ? runsState : fetchedRuns} onSelectRun={handleSelectRun} loading={runsLoading} />
            </div>
          </div>

          {/* Right Column (7 Cols / 60%): Live Terminal Output & Git Diff Code Artifacts */}
          <div className="col-span-12 lg:col-span-7 flex flex-col gap-6">
            <TerminalPanel
              session={session}
              selectedRun={activeOrSelectedRun}
              liveTerminalLines={liveTerminalLines}
            />

            <CodeDiffCard
              sessionId={id}
              pullRequest={session.pullRequest}
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
          </div>

        </div>
      </div>
    </div>
  );
}
