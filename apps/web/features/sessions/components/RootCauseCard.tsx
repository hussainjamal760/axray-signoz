"use client";

import { useEffect, useState, useMemo } from "react";
import { AgentRunSummary, TimelineEvent } from "@/features/agent-runs/types";

export interface RootCauseCardProps {
  activeRun?: AgentRunSummary | null;
  events?: TimelineEvent[];
}

export function RootCauseCard({ activeRun, events = [] }: RootCauseCardProps) {
  const [displayText, setDisplayText] = useState("");
  
  const fullText = useMemo(() => {
    return activeRun?.errorMessage || "The agent execution encountered an unhandled error during its trajectory.";
  }, [activeRun]);

  const failureTurn = useMemo(() => {
    // Attempt to find a turn from events if a tool failed, etc.
    const failedEvent = events.find(e => e.status === 'failed');
    if (failedEvent && failedEvent.metadata?.turn) {
      return `Turn ${failedEvent.metadata.turn}`;
    }
    return "Unknown Turn";
  }, [events]);

  useEffect(() => {
    let i = 0;
    setDisplayText("");
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 10);
    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div className="bg-surface-container-lowest/50 backdrop-blur-md rounded-2xl border border-rose-500/20 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] reveal-text relative overflow-hidden group" style={{ animationDelay: '0.1s' }}>
      {/* Subtle Glow */}
      <div className="absolute w-40 h-40 bg-rose-500/5 rounded-full blur-3xl -top-10 -right-10 pointer-events-none group-hover:bg-rose-500/10 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex-1 pr-6">
          <h2 className="text-xl md:text-2xl font-bold text-on-surface mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500 drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]">troubleshoot</span>
            Root Cause Detected
          </h2>
          <p className="text-rose-400 font-mono text-sm max-w-3xl min-h-[48px] break-words whitespace-pre-wrap leading-relaxed">
            {displayText}
            <span className="inline-block w-2 h-4 bg-primary-fixed animate-pulse ml-1 align-middle"></span>
          </p>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Confidence</div>
          <div className="text-2xl font-black text-primary-fixed drop-shadow-[0_0_12px_rgba(var(--color-primary-fixed),0.4)]">High</div>
        </div>
      </div>
      <div className="flex items-center gap-3 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 w-fit relative z-10 shadow-sm">
        <span className="material-symbols-outlined text-rose-400 text-[18px]">history</span>
        <span className="text-xs font-medium text-rose-300">Failure localized at: <span className="text-white font-bold">{failureTurn}</span></span>
      </div>
    </div>
  );
}
