"use client";

import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/features/sessions/hooks";
import { TimelinePanel, CodeViewerPanel, IntelligencePanel, ReplayHUD } from "@/features/sessions/components";
import Link from "next/link";

const badgeStyles: Record<string, string> = {
  active: "bg-green-500/10 border-green-600 text-green-600",
  archived: "bg-surface-container border-outline text-on-surface-variant",
};

export default function SessionIdPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";

  const { data: session, isLoading, isError } = useSession(id);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="font-mono-label text-sm uppercase animate-pulse text-primary-fixed font-black">
          Loading Session workspace...
        </div>
      </div>
    );
  }

  if (isError || !session) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-black uppercase text-error mb-4">Workspace Error</h2>
        <p className="font-mono-label text-sm text-on-surface-variant mb-6">
          The requested session is either invalid or could not be loaded.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="bg-primary-fixed text-on-primary px-6 py-3 border-2 border-on-background font-black uppercase brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const badgeClass = badgeStyles[session.status] || badgeStyles.active;

  return (
    <>
      {/* Context Header */}
      <section className="p-gutter border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono-label text-mono-label text-on-surface-variant">
            <Link href="/dashboard" className="hover:text-primary-fixed cursor-pointer uppercase">
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
              {session.repositoryFullName}
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">git_branch</span>
              {session.branch}
            </div>
            <div className={`flex items-center gap-2 border-2 px-3 py-1 font-black font-mono-label text-mono-label ${badgeClass}`}>
              <span className="material-symbols-outlined text-[16px] fill-icon">
                {session.status === "active" ? "check_circle" : "archive"}
              </span>
              {session.status.toUpperCase()}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link href="/analysis" className="bg-primary-fixed text-on-primary-fixed font-black px-6 py-4 border-[3px] border-on-primary-fixed neo-shadow hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center uppercase">
            EXPLAIN FAILURE
          </Link>
          <button className="bg-transparent text-primary-fixed font-black px-6 py-4 border-[3px] border-primary-fixed neo-shadow hover:bg-surface-variant active:translate-x-0 active:translate-y-0 active:shadow-none transition-all uppercase">
            CREATE PULL REQUEST
          </button>
        </div>
      </section>

      {/* Three-Pane View */}
      <section className="flex flex-1 overflow-hidden min-h-0 z-10 relative" data-lenis-prevent="true">
        <TimelinePanel />
        <CodeViewerPanel />
        <IntelligencePanel />
      </section>

      {/* Bottom Replay HUD */}
      <ReplayHUD />
    </>
  );
}
