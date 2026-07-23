import { AgentRunSummary } from '../types/agent-runs.types';
import { RunStatusBadge } from './RunStatusBadge';

export interface AgentRunsListProps {
  runs: AgentRunSummary[];
  onSelectRun: (run: AgentRunSummary) => void;
  loading?: boolean;
}

export function AgentRunsList({ runs, onSelectRun, loading }: AgentRunsListProps) {
  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      });
    } catch {
      return dateStr;
    }
  };

  const getDurationString = (durationMs?: number) => {
    if (durationMs === undefined || durationMs === null) return '-';
    return `${(durationMs / 1000).toFixed(1)}s`;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10 font-mono-label text-sm uppercase animate-pulse text-primary-fixed">
        Loading run history...
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="bg-surface border-[3px] border-outline p-12 text-center brutalist-shadow">
        <h4 className="font-headline-lg text-lg font-black text-on-surface uppercase mb-2">No runs yet</h4>
        <p className="font-mono-label text-sm text-on-surface-variant max-w-md mx-auto">
          Run your first prompt to begin tracking agent execution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-headline-lg text-lg font-black uppercase text-on-surface">Execution History</h3>
      
      <div className="bg-surface border-[3px] border-outline brutalist-shadow overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-mono-label text-xs">
            <thead>
              <tr className="bg-surface-container-high border-b-[3px] border-outline">
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Prompt</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Status</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Changes / Diff</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Created</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-outline-variant">
              {runs.map((run) => {
                const fileCount = run.filesChanged?.length || 0;
                const hasDiff = fileCount > 0 || !!run.diff;

                return (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run)}
                    className="hover:bg-surface-container cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5 font-black text-on-surface max-w-xs md:max-w-md truncate">
                      {run.prompt}
                    </td>
                    <td className="px-6 py-5">
                      <RunStatusBadge status={run.status} />
                    </td>
                    <td className="px-6 py-5">
                      {hasDiff ? (
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-emerald-400">+{run.insertions || 0}</span>
                          <span className="text-error">-{run.deletions || 0}</span>
                          <span className="text-outline-variant text-[10px]">
                            ({fileCount} {fileCount === 1 ? 'file' : 'files'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-outline-variant italic">No changes</span>
                      )}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      {getFormattedDate(run.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      {getDurationString(run.durationMs)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
