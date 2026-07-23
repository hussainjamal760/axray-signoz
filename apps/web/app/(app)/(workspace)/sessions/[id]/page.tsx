"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/features/sessions/hooks";
import { useRuns, useCreateRun } from "@/features/agent-runs/hooks";
import { ACTIVE_RUN_STATUSES, AgentRunSummary } from "@/features/agent-runs/types";
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

  // First fetch runs to evaluate active run statuses
  const { data: initialRuns = [] } = useRuns(id);

  // Initial session fetch to evaluate infrastructure status
  const { data: initialSession } = useSession(id);

  // Evaluate polling strategy: poll if runs are active or infrastructure is provisioning
  const isAnyRunActive = initialRuns.some(r => (ACTIVE_RUN_STATUSES as readonly string[]).includes(r.status));
  const isInfraProvisioning = initialSession && (
    initialSession.containerStatus === 'creating' ||
    (!initialSession.workspaceInitialized && initialSession.containerStatus !== 'failed' && initialSession.containerStatus !== 'stopped')
  );
  const shouldPoll = isAnyRunActive || isInfraProvisioning;
  const refetchInterval = shouldPoll ? 1500 : false;

  // Generic hooks with dynamic refetchInterval options
  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession(id, { refetchInterval });
  const { data: runs = [], isLoading: runsLoading } = useRuns(id, { refetchInterval });
  const { mutate: createRun, isPending: isCreatingRun } = useCreateRun(id);

  // Default to manually selected run, or latest run in runs array
  const activeOrSelectedRun = manuallySelectedRun || runs[0] || null;
  const isSelectedRunExecuting = activeOrSelectedRun?.status === 'running' || activeOrSelectedRun?.status === 'pending';

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
    createRun({ prompt: promptText }, {
      onSuccess: (newRun) => {
        setManuallySelectedRun(newRun);
      }
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden">
      {/* Infrastructure Overview Header */}
      <SessionHeader session={session} />

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-8 space-y-8 custom-scrollbar" data-lenis-prevent="true">
        <div className="grid grid-cols-12 gap-8">

          {/* Row 1: Initialize Context & Timeline */}
          <div className="col-span-12 lg:col-span-7">
            <InitializeContextPanel
              onSubmit={handlePromptSubmit}
              isPending={isCreatingRun}
              disabled={session.containerStatus === 'failed' || session.containerStatus === 'stopped'}
            />
          </div>

          <div className="col-span-12 lg:col-span-5 h-full">
            <TimelinePanel />
          </div>

          {/* Row 2: Live Trace Tree and Terminal Window */}
          <section className="col-span-12 grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-5 h-full">
              <LiveTraceTree />
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
              isLoading={isSelectedRunExecuting}
            />
          </section>

          {/* Row 4: Full-Width Execution History Section */}
          <section className="col-span-12 mt-8">
            <div className="bg-surface border-[3px] border-outline p-6 brutalist-shadow">
              <h3 className="text-xl font-black uppercase mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed">history</span>
                Execution History
              </h3>
              <AgentRunsList runs={runs} onSelectRun={handleSelectRun} loading={runsLoading} />
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
