"use client";

import { useParams } from "next/navigation";
import { TimelinePanel } from "@/features/sessions/components/TimelinePanel";
import { CodeViewerPanel } from "@/features/sessions/components/CodeViewerPanel";
import { IntelligencePanel } from "@/features/sessions/components/IntelligencePanel";
import { ReplayHUD } from "@/features/sessions/components/ReplayHUD";
import Link from "next/link";

export default function ObserverDashboardPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const analysisLink = id ? `/sessions/${id}/analysis` : "/sessions";

  return (
    <>
      {/* Context Header */}
      <section className="p-gutter border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
        <div>
          <div className="flex items-center gap-2 mb-2 font-mono-label text-mono-label text-on-surface-variant">
            <span className="hover:text-primary-fixed cursor-pointer">SESSIONS</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary-fixed">#{id ? id.slice(-4).toUpperCase() : "1042"}</span>
          </div>
          <h1 className="font-headline-lg text-3xl md:text-headline-lg text-primary-fixed uppercase mb-4">Fix authentication failing tests</h1>
          
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder</span>
              auth-test
            </div>
            <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">smart_toy</span>
              Gemini 2.5 Flash
            </div>
            <div className="flex items-center gap-2 bg-error-container text-on-error-container border-2 border-error px-3 py-1 font-black font-mono-label text-mono-label">
              <span className="material-symbols-outlined text-[16px] fill-icon">error</span>
              FAILED
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <Link href={analysisLink} className="bg-primary-fixed text-on-primary-fixed font-black px-6 py-4 border-[3px] border-on-primary-fixed neo-shadow hover:-translate-y-1 hover:-translate-x-1 active:translate-x-0 active:translate-y-0 active:shadow-none transition-all flex items-center justify-center uppercase">
            EXPLAIN FAILURE
          </Link>
          <button className="bg-transparent text-primary-fixed font-black px-6 py-4 border-[3px] border-primary-fixed neo-shadow hover:bg-surface-variant active:translate-x-0 active:translate-y-0 active:shadow-none transition-all">
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
