import { SessionSummary, SessionStatus } from '../types/sessions.types';

export interface SessionsListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
}

const statusColors: Record<SessionStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline' },
  running: { bg: 'bg-primary-fixed-dim/20', text: 'text-primary-fixed', border: 'border-primary-fixed' },
  completed: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-600' },
  failed: { bg: 'bg-error-container', text: 'text-error', border: 'border-error' },
  cancelled: { bg: 'bg-surface-container-highest', text: 'text-on-surface-variant', border: 'border-outline' }
};

export function SessionsList({ sessions, onSelect }: SessionsListProps) {
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

  return (
    <div className="col-span-12 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="font-headline-lg text-3xl font-black uppercase text-on-surface">Active Workspaces</h2>
          <p className="font-mono-label text-xs text-on-surface-variant mt-1">SELECT A SESSION TO INSPECT LOGS OR LIVE TRACES</p>
        </div>
        <button
          onClick={() => onSelect('new')}
          className="bg-primary-fixed text-on-primary-fixed font-black uppercase px-6 py-3 border-[3px] border-background brutalist-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined font-black">add</span>
          New Session
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.map((session) => {
          const colors = statusColors[session.status] || statusColors.pending;
          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="bg-surface border-[3px] border-outline p-6 flex flex-col justify-between cursor-pointer group hover:-translate-x-1 hover:-translate-y-1 transition-all brutalist-shadow hover:brutalist-shadow-lg"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="font-mono-label text-xs font-bold text-on-surface-variant">
                    SESSION #{session.id.slice(-6).toUpperCase()}
                  </span>
                  <span className={`px-2.5 py-0.5 border-2 text-[10px] font-black uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
                    {session.status}
                  </span>
                </div>

                <h3 className="font-headline-sm text-lg font-black uppercase text-on-surface line-clamp-1 mb-2 group-hover:text-primary-fixed transition-colors">
                  {session.repositoryFullName}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-[16px] text-on-surface-variant">git_branch</span>
                  <span className="font-mono-label text-xs text-on-surface-variant">{session.branchName}</span>
                </div>

                <p className="font-mono-label text-xs text-on-surface-variant line-clamp-3 bg-surface-container border border-outline/30 p-3 mb-6">
                  {session.prompt}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-outline/10">
                <span className="font-mono-label text-[10px] text-on-surface-variant">
                  {getFormattedDate(session.createdAt)}
                </span>
                <span className="font-mono-label text-xs font-black uppercase group-hover:underline text-primary-fixed flex items-center gap-1">
                  Inspect
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
