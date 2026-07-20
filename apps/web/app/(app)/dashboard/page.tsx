import { AppLayout } from "@/components/ui/AppLayout";
import { InitializePanel } from "@/components/dashboard/InitializePanel";
import { ActiveSessionTimeline } from "@/components/dashboard/ActiveSessionTimeline";
import { LiveTraceTree } from "@/components/dashboard/LiveTraceTree";
import { TerminalPanel } from "@/components/dashboard/TerminalPanel";
import { SessionHistory } from "@/components/dashboard/SessionHistory";
import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      {/* Header */}
      <header className="h-[72px] border-b-[3px] border-outline-variant flex items-center justify-between px-8 flex-shrink-0 z-10 bg-background">
        <div className="flex items-center gap-6">
          <h2 className="text-3xl font-black uppercase tracking-tight text-on-background">AI Agent Sessions</h2>
          <div className="bg-outline-variant text-on-surface px-3 py-1 font-mono-label text-xs font-bold">
            STABLE_V2.4.0
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <Link href="/repositories" className="px-6 py-2 border-2 border-outline text-on-surface font-black uppercase hover:bg-surface-container transition-colors inline-block">
            Connect Repo
          </Link>
          <button className="px-6 py-2 bg-primary-fixed text-on-primary-fixed border-2 border-background font-black uppercase flex items-center gap-2 brutalist-shadow-sm hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
            <span className="material-symbols-outlined font-bold">add</span>
            New Session
          </button>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 space-y-8 custom-scrollbar" data-lenis-prevent="true">
        <div className="grid grid-cols-12 gap-8">
          
          <InitializePanel />
          
          <ActiveSessionTimeline />
          
          <section className="col-span-12 grid grid-cols-12 gap-8">
            <LiveTraceTree />
            <TerminalPanel />
          </section>
          
          <SessionHistory />
          
        </div>
      </div>
      
      {/* Footer */}
      <footer className="h-[56px] border-t-[3px] border-outline-variant bg-background flex items-center justify-between px-8 flex-shrink-0">
        <p className="font-mono-label text-[10px] font-bold uppercase text-outline-variant">© 2024 AGENT_BLACK_BOX // RADICAL_SYNTAX_MODE</p>
        <div className="hidden sm:flex items-center gap-8">
          <a className="font-mono-label text-[10px] font-bold uppercase text-outline-variant hover:text-primary-fixed" href="#">Privacy</a>
          <a className="font-mono-label text-[10px] font-bold uppercase text-outline-variant hover:text-primary-fixed" href="#">Terms</a>
          <a className="font-mono-label text-[10px] font-bold uppercase text-outline-variant hover:text-primary-fixed" href="#">Sec_Policy</a>
          <a className="font-mono-label text-[10px] font-bold uppercase text-primary-fixed border border-primary-fixed px-2 py-0.5 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors" href="#">Github_Link</a>
        </div>
      </footer>
    </>
  );
}
