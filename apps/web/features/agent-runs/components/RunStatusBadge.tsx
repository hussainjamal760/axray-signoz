import { RunStatus } from '../types/agent-runs.types';

const statusColors: Record<RunStatus, { bg: string; text: string; border: string; icon: string }> = {
  pending: { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline/50', icon: 'schedule' },
  queued: { bg: 'bg-surface-container-highest', text: 'text-on-surface', border: 'border-outline', icon: 'hourglass_empty' },
  running: { bg: 'bg-primary-fixed-dim/20', text: 'text-primary-fixed', border: 'border-primary-fixed', icon: 'sync' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-600', icon: 'check_circle' },
  failed: { bg: 'bg-error-container', text: 'text-error', border: 'border-error', icon: 'error' },
  cancelled: { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline/50', icon: 'block' },
  incomplete: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/50', icon: 'warning' },
};

export function RunStatusBadge({ status }: { status: RunStatus }) {
  const colors = statusColors[status] || statusColors.pending;
  const isRunning = status === 'running';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 border-2 text-[10px] font-black uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
      <span className={`material-symbols-outlined text-[14px] ${isRunning ? 'animate-spin' : ''}`}>
        {colors.icon}
      </span>
      {status}
    </span>
  );
}
