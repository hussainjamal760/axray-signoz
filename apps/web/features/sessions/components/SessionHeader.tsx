import { SessionSummary } from '../types/sessions.types';
import { ContainerStatusBadge } from './ContainerStatusBadge';
import { WorkspaceStatusBadge } from './WorkspaceStatusBadge';
import Link from 'next/link';

export function SessionHeader({ session }: { session: SessionSummary }) {
  const badgeClass = session.status === 'active'
    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
    : 'bg-surface-container border-outline text-on-surface-variant';

  return (
    <section className="p-gutter border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
      <div>
        <div className="flex items-center gap-2 mb-2 font-mono-label text-mono-label text-on-surface-variant">
          <Link href="/sessions" className="hover:text-primary-fixed cursor-pointer uppercase">
            SESSIONS
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-primary-fixed">#{session.id.slice(-6).toUpperCase()}</span>
        </div>
        <h1 className="font-headline-lg text-3xl md:text-headline-lg text-primary-fixed uppercase mb-4">
          Session Workspace
        </h1>
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* 1. Repository */}
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder</span>
            <span className="font-bold text-white">{session.repositoryFullName}</span>
          </div>

          {/* 2. Branch */}
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">commit</span>
            <span className="font-bold text-white">{session.branch}</span>
          </div>

          {/* 3. Session Status */}
          <div className={`flex items-center gap-2 border px-3 py-1 font-mono-label text-xs font-bold ${badgeClass}`}>
            <span className="material-symbols-outlined text-[14px]">
              {session.status === "active" ? "check_circle" : "archive"}
            </span>
            {session.status === "active" ? "Active" : "Archived"}
          </div>

          {/* 4. Container Status */}
          <ContainerStatusBadge status={session.containerStatus} />

          {/* 5. Workspace Status */}
          <WorkspaceStatusBadge isInitialized={session.workspaceInitialized} />
        </div>
      </div>
    </section>
  );
}
