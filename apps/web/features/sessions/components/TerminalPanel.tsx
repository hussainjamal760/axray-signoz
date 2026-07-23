import { SessionSummary } from '../types/sessions.types';
import { AgentRunSummary } from '@/features/agent-runs/types';
import { CodeDiffCard } from './CodeDiffCard';

export interface TerminalPanelProps {
  session?: SessionSummary;
  selectedRun?: AgentRunSummary | null;
}

export function TerminalPanel({ session, selectedRun }: TerminalPanelProps) {
  const spec = session?.workspaceSpec;
  const isRunning = selectedRun?.status === 'running' || selectedRun?.status === 'pending';

  return (
    <div className="col-span-12 md:col-span-7 bg-background border-[3px] border-outline flex flex-col h-[520px] brutalist-shadow">
      <div className="p-4 border-b-2 border-outline flex items-center justify-between bg-surface shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-error border border-background"></div>
            <div className="w-3 h-3 bg-primary-fixed border border-background"></div>
            <div className="w-3 h-3 bg-outline border border-background"></div>
          </div>
          <span className="font-mono-label text-xs font-black uppercase text-outline">
            Terminal: {session?.repositoryFullName || 'axray_agent_runner'}
          </span>
        </div>
        <span className="font-mono-label text-[10px] font-bold text-primary-fixed">
          {session?.containerId ? `CONTAINER: ${session.containerId.substring(0, 12)}` : 'DOCKER: IDLE'}
        </span>
      </div>

      <div className="flex-1 p-6 font-mono-label text-sm overflow-y-auto space-y-4 custom-scrollbar">
        {/* Workspace Spec Info if initialized */}
        {spec && (
          <div className="border border-primary-fixed/30 bg-surface-container-high/40 p-3 text-xs space-y-1">
            <div className="text-primary-fixed font-bold uppercase">
              [AI Workspace Analysis]
            </div>
            <div><span className="text-outline">Runtime:</span> <span className="text-white font-bold">{spec.runtime}@{spec.runtimeVersion}</span></div>
            <div><span className="text-outline">Package Manager:</span> <span className="text-white font-bold">{spec.packageManager}</span></div>
            <div><span className="text-outline">Install Cmd:</span> <span className="text-emerald-400 font-bold">{spec.installCommand}</span></div>
            {spec.reasoning && (
              <div className="text-outline-variant italic text-[11px] mt-1">"{spec.reasoning}"</div>
            )}
          </div>
        )}

        {/* Selected / Active Run Output */}
        {selectedRun ? (
          <div className="space-y-4">
            <div className="text-outline-variant flex items-center gap-2">
              <span className="text-primary-fixed font-bold">&gt; Prompt:</span>
              <span className="text-white font-bold">{selectedRun.prompt}</span>
            </div>

            <div className="flex items-center gap-3 text-xs flex-wrap">
              <span className="text-outline">Status:</span>
              <span className={`px-2 py-0.5 font-bold uppercase ${
                selectedRun.status === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : selectedRun.status === 'failed'
                  ? 'bg-error/20 text-error border border-error/40'
                  : 'bg-primary-fixed/20 text-primary-fixed border border-primary-fixed/40 animate-pulse'
              }`}>
                {selectedRun.status}
              </span>
              {selectedRun.durationMs !== undefined && (
                <span className="text-outline-variant">({(selectedRun.durationMs / 1000).toFixed(1)}s)</span>
              )}
              {selectedRun.tokensUsed !== undefined && (
                <span className="text-outline-variant">[{selectedRun.tokensUsed} tokens]</span>
              )}
            </div>

            {selectedRun.response && (
              <div className="bg-surface p-4 border border-outline space-y-2">
                <div className="text-xs font-bold text-primary-fixed uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">smart_toy</span>
                  Groq AI Agent Response
                </div>
                <pre className="whitespace-pre-wrap text-on-surface text-xs font-mono-label leading-relaxed">
                  {selectedRun.response}
                </pre>
              </div>
            )}

            {/* Render Git Diff Card if diff/filesChanged exist */}
            {(selectedRun.diff || (selectedRun.filesChanged && selectedRun.filesChanged.length > 0)) && (
              <CodeDiffCard
                diff={selectedRun.diff}
                filesChanged={selectedRun.filesChanged}
                insertions={selectedRun.insertions}
                deletions={selectedRun.deletions}
                diffTruncated={selectedRun.diffTruncated}
                diffSize={selectedRun.diffSize}
                changeSummary={selectedRun.changeSummary}
              />
            )}

            {selectedRun.errorMessage && (
              <div className="bg-error-container/20 border-l-4 border-error p-4 text-xs font-mono-label text-error">
                <strong>Error:</strong> {selectedRun.errorMessage}
              </div>
            )}
          </div>
        ) : (
          <div className="text-outline-variant text-xs space-y-2">
            <div># Ready. Submit a task prompt above to begin AI agent execution in Docker container.</div>
            <div># Container path: /workspace</div>
            <div># Traces stream automatically to SigNoz Cloud.</div>
          </div>
        )}

        {/* Pulsing prompt line */}
        <div className="flex items-center gap-2 pt-2">
          <span className="text-primary-fixed font-black">&gt;</span>
          {isRunning ? (
            <span className="text-xs text-primary-fixed font-bold uppercase animate-pulse">
              Agent analyzing workspace &amp; executing tools...
            </span>
          ) : (
            <span className="inline-block w-2 h-4 bg-primary-fixed animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
}
