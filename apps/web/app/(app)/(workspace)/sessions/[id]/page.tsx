"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/features/sessions/hooks";
import { SessionHeader } from "@/features/sessions/components";
import { PromptComposer, AgentRunsList, RunStatusBadge } from "@/features/agent-runs/components";
import { useRuns, useCreateRun } from "@/features/agent-runs/hooks";

// Keep imports of the legacy three-pane layout panels to preserve them in the codebase
import { TimelinePanel, CodeViewerPanel, IntelligencePanel, ReplayHUD } from "@/features/sessions/components";

export default function SessionIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const isValidId = !!id && id !== "undefined" && id !== "null";

  const { data: session, isLoading: sessionLoading, isError: sessionError } = useSession(id);
  const { data: runs = [], isLoading: runsLoading } = useRuns(id);
  const { mutate: createRun, isPending: isCreating } = useCreateRun(id);

  if (sessionLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="font-mono-label text-sm uppercase animate-pulse text-primary-fixed font-black">
          Loading Session workspace...
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
          onClick={() => router.push("/dashboard")}
          className="bg-primary-fixed text-on-primary px-6 py-3 border-2 border-on-background font-black uppercase brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Handle run creation
  const handleCreateRun = (prompt: string) => {
    createRun({ prompt });
  };

  // Find if there is an active run in execution (pending, queued, or running)
  const currentRun = runs.find(
    (r) => r.status === "running" || r.status === "pending" || r.status === "queued"
  );
  
  // Filter history runs
  const historyRuns = runs.filter((r) => r.id !== currentRun?.id);

  const handleSelectRun = (run: any) => {
    console.log("Selected run for tracing:", run);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Session Workspace Header */}
      <SessionHeader session={session} />

      {/* Main Workspace Layout */}
      <div className="flex-1 overflow-y-auto p-gutter space-y-8 custom-scrollbar bg-background" data-lenis-prevent="true">
        
        {/* Prompt Composer Section */}
        <PromptComposer onSubmit={handleCreateRun} loading={isCreating} disabled={!!currentRun} />

        {/* Current Active Run Panel */}
        {currentRun && (
          <div className="border-[3px] border-primary-fixed bg-surface p-6 brutalist-shadow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black uppercase text-primary-fixed flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                Current Active Execution
              </h3>
              <RunStatusBadge status={currentRun.status} />
            </div>
            
            <div className="font-mono-label text-sm text-on-surface bg-surface-container p-4 border-2 border-outline-variant">
              <p className="font-bold text-white mb-2 uppercase text-xs text-primary-fixed tracking-wider">// Prompt Input</p>
              <p className="mb-4 text-white font-bold">{currentRun.prompt}</p>
              <div className="flex justify-between items-center text-xs text-on-surface-variant pt-3 border-t border-outline-variant/30">
                <span>Created: {new Date(currentRun.createdAt).toLocaleString()}</span>
                <span>Model: {currentRun.modelName || "Default Engine"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Historical Agent Runs List */}
        <AgentRunsList runs={historyRuns} onSelectRun={handleSelectRun} loading={runsLoading} />
      </div>
    </div>
  );
}
