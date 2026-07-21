import { SessionSummary, SessionStatus } from '../types/sessions.types';

export interface SessionsListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
}

const statusColors: Record<SessionStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-600', border: 'border-green-600' },
  archived: { bg: 'bg-surface-container', text: 'text-on-surface-variant', border: 'border-outline/50' }
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="font-headline-lg text-3xl font-black uppercase text-on-surface">AI Agent Sessions</h2>
          <p className="font-mono-label text-xs text-on-surface-variant mt-1">SELECT A ROW TO OPEN WORKSPACE OBSERVATORY</p>
        </div>
        <button
          onClick={() => onSelect('new')}
          className="bg-primary-fixed text-on-primary-fixed font-black uppercase px-6 py-3 border-[3px] border-background brutalist-shadow-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2"
        >
          <span className="material-symbols-outlined font-black">add</span>
          New Session
        </button>
      </div>

      <div className="bg-surface border-[3px] border-outline brutalist-shadow overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse font-mono-label text-xs">
            <thead>
              <tr className="bg-surface-container-high border-b-[3px] border-outline">
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Repository</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Branch</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Status</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Started</th>
                <th className="px-6 py-4 font-black uppercase text-primary-fixed">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-outline-variant">
              {sessions.map((session) => {
                const colors = statusColors[session.status] || statusColors.active;
                return (
                  <tr
                    key={session.id}
                    onClick={() => onSelect(session.id)}
                    className="hover:bg-surface-container cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-5 font-black text-on-surface group-hover:text-primary-fixed transition-colors text-sm">
                      {session.repositoryFullName}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant flex items-center gap-2 h-full">
                      <span className="material-symbols-outlined text-[16px] text-outline">git_branch</span>
                      {session.branch}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2.5 py-0.5 border-2 text-[10px] font-black uppercase tracking-wider ${colors.bg} ${colors.text} ${colors.border}`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      {getFormattedDate(session.createdAt)}
                    </td>
                    <td className="px-6 py-5 text-on-surface-variant">
                      {getFormattedDate(session.updatedAt)}
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
