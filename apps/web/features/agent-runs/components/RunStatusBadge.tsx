import { RunStatus } from '../types/agent-runs.types';

const statusColors: Record<RunStatus, { bg: string; text: string; border: string; icon: string }> = {
  pending: { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline-variant/30', icon: 'schedule' },
  queued: { bg: 'bg-surface-container-highest', text: 'text-on-surface', border: 'border-outline-variant/30', icon: 'hourglass_empty' },
  running: { bg: 'bg-primary-fixed/10', text: 'text-primary-fixed', border: 'border-primary-fixed/30', icon: 'progress_activity' },
  completed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', icon: 'check_circle' },
  failed: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30', icon: 'error' },
  cancelled: { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline-variant/30', icon: 'block' },
  incomplete: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', icon: 'warning' },
};

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const colors = statusColors[status] || statusColors.pending;
  const isRunning = status === 'running';

  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[12px] font-semibold tracking-wide ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className="capitalize">{status}</span>
    </span>
  );
}
