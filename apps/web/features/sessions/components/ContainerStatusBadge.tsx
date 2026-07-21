import { ContainerStatus } from '../types/sessions.types';

interface ContainerStatusBadgeProps {
  status?: ContainerStatus;
}

export function ContainerStatusBadge({ status = 'stopped' }: ContainerStatusBadgeProps) {
  switch (status) {
    case 'creating':
      return (
        <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 font-mono-label text-xs font-bold flex items-center gap-1.5 animate-pulse">
          Creating
        </span>
      );
    case 'running':
      return (
        <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 font-mono-label text-xs font-bold">
          Running
        </span>
      );
    case 'failed':
      return (
        <span className="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-3 py-1 font-mono-label text-xs font-bold">
          Failed
        </span>
      );
    case 'stopped':
    default:
      return (
        <span className="bg-surface-variant text-on-surface-variant border border-outline px-3 py-1 font-mono-label text-xs font-bold">
          Stopped
        </span>
      );
  }
}
