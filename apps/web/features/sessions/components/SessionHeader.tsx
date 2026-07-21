import { SessionSummary } from '../types/sessions.types';
import Link from 'next/link';

export function SessionHeader({ session }: { session: SessionSummary }) {
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

  const badgeClass = session.status === 'active'
    ? 'bg-green-500/10 border-green-600 text-green-600'
    : 'bg-surface-container border-outline text-on-surface-variant';

  return (
    <section className="p-gutter border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
      <div>
        <div className="flex items-center gap-2 mb-2 font-mono-label text-mono-label text-on-surface-variant">
          <Link href="/session" className="hover:text-primary-fixed cursor-pointer uppercase">
            SESSIONS
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary-fixed">#{session.id.slice(-6).toUpperCase()}</span>
        </div>
        <h1 className="font-headline-lg text-3xl md:text-headline-lg text-primary-fixed uppercase mb-4">
          Session Workspace
        </h1>
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder</span>
            <span className="font-bold text-white">{session.repositoryFullName}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
            <span className="font-bold text-white">{session.branch}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface-variant">
            <span>Created: {getFormattedDate(session.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface-variant">
            <span>Updated: {getFormattedDate(session.updatedAt)}</span>
          </div>
          <div className={`flex items-center gap-2 border-2 px-3 py-1 font-black font-mono-label text-mono-label ${badgeClass}`}>
            <span className="material-symbols-outlined text-[16px]">
              {session.status === "active" ? "check_circle" : "archive"}
            </span>
            {session.status.toUpperCase()}
          </div>
        </div>
      </div>
    </section>
  );
}
