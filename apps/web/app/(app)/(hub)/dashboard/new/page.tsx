"use client";

import { CreateSessionWizard } from "@/features/sessions/components";
import Link from "next/link";

export default function NewSessionPage() {
  return (
    <>
      {/* Header */}
      <header className="h-[72px] border-b-[3px] border-outline-variant flex items-center justify-between px-8 flex-shrink-0 z-10 bg-background">
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="flex items-center justify-center p-2 border-2 border-outline hover:bg-surface-container transition-colors"
          >
            <span className="material-symbols-outlined font-black">arrow_back</span>
          </Link>
          <h2 className="text-3xl font-black uppercase tracking-tight text-on-background">New Coding Session</h2>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 flex justify-center custom-scrollbar" data-lenis-prevent="true">
        <div className="w-full max-w-4xl">
          <CreateSessionWizard />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="h-[56px] border-t-[3px] border-outline-variant bg-background flex items-center justify-between px-8 flex-shrink-0">
        <p className="font-mono-label text-[10px] font-bold uppercase text-outline-variant">© 2024 AGENT_BLACK_BOX // RADICAL_SYNTAX_MODE</p>
      </footer>
    </>
  );
}
