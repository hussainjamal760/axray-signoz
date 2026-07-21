"use client";

import { DashboardContent } from "@/features/sessions/components";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 space-y-8 custom-scrollbar animate-fade-in" data-lenis-prevent="true">
        <DashboardContent />
      </div>

      <footer className="h-[56px] border-t-[3px] border-outline-variant bg-background flex items-center justify-between px-8 flex-shrink-0">
        <p className="font-mono-label text-[10px] font-bold uppercase text-outline-variant">© 2024 AGENT_BLACK_BOX // RADICAL_SYNTAX_MODE</p>
      </footer>
    </div>
  );
}
