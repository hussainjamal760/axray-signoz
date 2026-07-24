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
      <div className="flex justify-center py-10 font-sans text-sm animate-pulse text-primary-fixed">
        Loading run history...
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-12 text-center shadow-sm font-sans">
        <h4 className="text-base font-semibold text-on-surface mb-1">No runs yet</h4>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto font-light">
          Run your first prompt to begin tracking agent execution.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans">
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden transition-all hover:border-primary-fixed/30">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-container-lowest/50 border-b border-outline-variant/20">
                <th className="px-6 py-4 font-semibold text-on-surface-variant uppercase text-[11px] tracking-wider">Prompt</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant uppercase text-[11px] tracking-wider">Status</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant uppercase text-[11px] tracking-wider">Changes / Diff</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant uppercase text-[11px] tracking-wider">Created</th>
                <th className="px-6 py-4 font-semibold text-on-surface-variant uppercase text-[11px] tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {runs.map((run) => {
                const fileCount = run.filesChanged?.length || 0;
                const hasDiff = fileCount > 0 || !!run.diff;

                return (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run)}
                    className="hover:bg-surface-container/50 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-4.5 font-medium text-on-surface max-w-xs md:max-w-md truncate">
                      {run.prompt}
                    </td>
                    <td className="px-6 py-4.5">
                      <RunStatusBadge status={run.status} />
                    </td>
                    <td className="px-6 py-4.5 font-mono">
                      {hasDiff ? (
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-medium">+{run.insertions || 0}</span>
                          <span className="text-rose-400 font-medium">-{run.deletions || 0}</span>
                          <span className="text-on-surface-variant text-[11px]">
                            ({fileCount} {fileCount === 1 ? 'file' : 'files'})
                          </span>
                        </div>
                      ) : (
                        <span className="text-on-surface-variant italic font-sans text-xs">No changes</span>
                      )}
                    </td>
                    <td className="px-6 py-4.5 text-on-surface-variant">
                      {getFormattedDate(run.createdAt)}
                    </td>
                    <td className="px-6 py-4.5 text-on-surface-variant font-mono">
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
