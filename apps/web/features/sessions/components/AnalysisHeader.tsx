import Link from "next/link";
import { AgentRunSummary } from "@/features/agent-runs/types";

export interface AnalysisHeaderProps {
  session?: any;
  activeRun?: AgentRunSummary | null;
}

export function AnalysisHeader({ session, activeRun }: AnalysisHeaderProps) {
  const sessionId = session?.id?.slice(-4).toUpperCase() || "1042";
  const durationStr = activeRun?.durationMs ? `${(activeRun.durationMs / 1000).toFixed(1)}s` : "-";
  const statusStr = activeRun?.status === 'failed' ? 'Critical Failure' : activeRun?.status || 'Unknown';
  const isError = activeRun?.status === 'failed';
  const observerUrl = session?.id
    ? `/sessions/${session.id}/observer${activeRun?.id ? `?runId=${activeRun.id}` : ""}`
    : "/sessions";

  return (
    <header className="col-span-12 mb-4 md:mb-6">
      <div className="mb-4">
        <Link
          href={observerUrl}
          className="inline-flex items-center gap-2 bg-surface-container/60 hover:bg-surface-container-high border border-outline-variant/20 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-on-surface hover:text-primary-fixed transition-all active:scale-[0.98] shadow-sm"
        >
          <span className="material-symbols-outlined text-sm text-primary-fixed">arrow_back</span>
          <span>Back to Observer</span>
        </Link>
      </div>

      <div className="flex flex-col md:flex-row md:items-baseline justify-between border-b-[3px] border-on-surface-variant pb-4 gap-4">
        <div className="flex flex-col">
          <span className="font-mono-label text-xs uppercase text-primary-fixed mb-1 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">warning</span> Incident Report
          </span>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-on-surface flex flex-wrap items-baseline gap-2">
            Failure Analysis <span className="text-outline text-2xl md:text-4xl">/ Session #{sessionId}</span>
          </h1>
          {session?.repositoryFullName && (
            <div className="mt-2 text-on-surface-variant font-mono-label text-xs font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">folder</span>
              {session.repositoryFullName} ({session.branch || 'main'})
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto mt-2 md:mt-0">
          {activeRun && (
            <span className="px-3 py-1 bg-surface-container-high border-2 border-background font-mono-label font-bold text-[10px] uppercase text-on-surface-variant">
              RUN #{activeRun.id.slice(-6).toUpperCase()}
            </span>
          )}
          <span className={`px-3 py-1 border-2 border-background font-mono-label font-bold text-xs uppercase ${isError ? 'bg-error text-black' : 'bg-emerald-400 text-black'}`}>
            {statusStr}
          </span>
          <span className="px-3 py-1 bg-surface-container-high border-2 border-background font-mono-label font-bold text-xs uppercase text-on-surface">
            {durationStr} Latency
          </span>
        </div>
      </div>
    </header>
  );
}
