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
    <div className="bg-surface-container border-[3px] border-background brutalist-shadow p-6 reveal-text" style={{ animationDelay: '0.1s' }}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-6">
          <h2 className="text-2xl md:text-3xl font-black uppercase mb-4 text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-500">troubleshoot</span>
            Root Cause Detected
          </h2>
          <p className="text-rose-400 font-mono text-sm max-w-3xl min-h-[48px] break-words whitespace-pre-wrap">
            {displayText}
            <span className="inline-block w-2 h-4 bg-primary-fixed animate-pulse ml-1 align-middle"></span>
          </p>
        </div>
        <div className="text-right shrink-0 hidden sm:block">
          <div className="font-mono-label text-xs font-bold text-on-surface-variant uppercase mb-1">Confidence</div>
          <div className="text-4xl font-black text-primary-fixed">High</div>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-background p-4 border-2 border-background w-fit">
        <span className="material-symbols-outlined text-primary-fixed">history</span>
        <span className="font-mono-label text-sm font-bold uppercase text-on-surface">Failure localized at: <span className="text-rose-500">{failureTurn}</span></span>
      </div>
    </div>
  );
}
