"use client";

import { CreateSessionWizard } from "@/features/sessions/components";
import Link from "next/link";

export default function NewSessionPage() {
  return (
    <div className="relative min-h-full flex flex-col bg-background bg-dot-pattern">
      {/* Subtle overlay gradient to blend the dots */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90 pointer-events-none" />

      {/* Header (Minimalist) */}
      <header className="relative z-10 h-[80px] flex items-center justify-between px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/sessions"
            className="flex items-center justify-center p-2 text-on-surface-variant hover:text-primary-fixed hover:bg-primary-fixed/10 rounded-full transition-colors"
          >
            <span className="material-symbols-outlined font-light">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <h2 className="text-xl font-medium tracking-tight text-on-background">New Session</h2>
            <span className="text-xs text-on-surface-variant font-mono-label">CONFIGURE_WORKSPACE</span>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 flex justify-center items-start custom-scrollbar" data-lenis-prevent="true">
        <div className="w-full max-w-3xl mt-4">
          <CreateSessionWizard />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="relative z-10 h-[56px] flex items-center justify-center px-8 flex-shrink-0">
        <p className="font-mono-label text-[10px] text-outline-variant tracking-widest">SECURE_AGENT_SANDBOX // AXRAY</p>
      </footer>
    </div>
  );
}
