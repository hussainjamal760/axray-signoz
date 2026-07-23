"use client";

import React from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";

export interface ReplayHUDProps {
  activeRun?: AgentRunSummary | null;
}

export function ReplayHUD({ activeRun }: ReplayHUDProps) {
  const durationMs = activeRun?.durationMs || 0;
  const durationSec = (durationMs / 1000).toFixed(1);

  return (
    <footer className="h-24 bg-surface-container-high border-t-[3px] border-primary-fixed px-gutter flex items-center gap-4 md:gap-8 shrink-0 relative z-20">
      <div className="flex gap-2">
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed active:translate-y-1 transition-all">
          <span className="material-symbols-outlined">skip_previous</span>
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-primary-fixed bg-primary-fixed text-on-primary-fixed hover:bg-surface-variant hover:text-primary-fixed active:translate-y-1 transition-all">
          <span className="material-symbols-outlined fill-icon">play_arrow</span>
        </button>
        <button className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed active:translate-y-1 transition-all">
          <span className="material-symbols-outlined">skip_next</span>
        </button>
      </div>
      
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between font-mono-label text-[10px] md:text-mono-label">
          <span className="text-primary-fixed font-black">
            {activeRun ? `REPLAYING RUN #${activeRun.id.slice(-6).toUpperCase()}` : 'NO RUN SELECTED'}
          </span>
          <span className="text-on-surface-variant">00:00:00 / {durationSec}s</span>
        </div>
        
        <div className="w-full h-4 bg-background border-2 border-outline-variant relative overflow-hidden">
          {/* Progress */}
          <div className="absolute top-0 left-0 h-full bg-primary-fixed" style={{ width: "100%" }}></div>
          
          {/* Markers */}
          <div className="absolute top-0 left-[25%] w-1 h-full bg-surface-variant border-x border-background"></div>
          <div className="absolute top-0 left-[50%] w-1 h-full bg-surface-variant border-x border-background"></div>
          <div className="absolute top-0 left-[75%] w-1.5 h-full bg-white z-10 shadow-[0_0_10px_#fff]"></div>
        </div>
      </div>
      
      <div className="hidden lg:flex flex-col items-end gap-1">
        <span className="font-mono-label text-[10px] opacity-60">INGESTION_SOURCE</span>
        <span className="font-mono-label text-mono-label text-primary-fixed">SIGNOZ_OTEL_TRACES</span>
      </div>
    </footer>
  );
}
