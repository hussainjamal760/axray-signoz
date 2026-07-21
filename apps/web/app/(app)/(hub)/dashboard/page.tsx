"use client";

import { DashboardContent } from "@/features/sessions/components";

export default function DashboardPage() {
  return (
    <>
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 space-y-8 custom-scrollbar animate-fade-in" data-lenis-prevent="true">
        <DashboardContent />
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
