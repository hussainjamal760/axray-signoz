"use client";

import React from "react";
import Link from "next/link";
import { LiveTraceSpan } from "@/features/sessions/hooks/useSessionSocket";

export interface LiveTraceTreeProps {
  sessionId?: string;
  runId?: string;
  liveTraces?: LiveTraceSpan[];
}

export function LiveTraceTree({ sessionId = "", liveTraces = [] }: LiveTraceTreeProps) {
  const observerUrl = sessionId ? `/sessions/${sessionId}/observer` : "#";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "success":
        return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
      case "failed":
      case "error":
        return "text-error border-error/40 bg-error/10";
      case "running":
        return "text-primary-fixed border-primary-fixed/40 bg-primary-fixed/10 animate-pulse";
      default:
        return "text-outline border-outline-variant bg-surface-container";
    }
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return "";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-background border-[3px] border-outline flex flex-col h-[450px] brutalist-shadow relative overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b-2 border-outline flex items-center justify-between bg-black z-10 shrink-0">
        <h4 className="font-black uppercase text-sm flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed">schema</span>
          Live Trace Preview
        </h4>
        {sessionId && (
          <Link
            href={observerUrl}
            className="font-mono-label text-[10px] font-black uppercase text-primary-fixed border border-primary-fixed px-2 py-1 flex items-center gap-1 hover:bg-primary-fixed hover:text-black transition-colors"
          >
            Observer <span className="material-symbols-outlined !text-xs">open_in_new</span>
          </Link>
        )}
      </div>

      {/* Live Trace Preview Stream */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono-label space-y-2 relative bg-background">
        {liveTraces.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 space-y-2">
            <span className="material-symbols-outlined text-primary-fixed/40 text-4xl">memory</span>
            <p className="text-xs uppercase font-bold text-outline">No live spans captured yet</p>
            <p className="text-[10px] text-outline-variant">OpenTelemetry spans will stream live over Socket.IO</p>
          </div>
        ) : (
          liveTraces.map((span, idx) => (
            <div
              key={span.spanId || idx}
              className="bg-surface border border-outline-variant p-2.5 flex items-center justify-between gap-3 text-xs hover:border-primary-fixed transition-colors"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed shrink-0"></span>
                <span className="font-black uppercase text-on-surface truncate">{span.operation}</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {span.durationMs !== undefined && (
                  <span className="text-[11px] font-bold text-primary-fixed">
                    {formatDuration(span.durationMs)}
                  </span>
                )}
                <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 border ${getStatusColor(span.status)}`}>
                  {span.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t-2 border-outline-variant bg-black shrink-0 flex justify-between items-center px-4 font-mono-label text-[10px] text-outline">
        <span>PREVIEW_MODE // OPEN-TELEMETRY</span>
        <a
          href="http://localhost:8080/traces"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary-fixed font-bold hover:underline flex items-center gap-1"
        >
          Open SigNoz Traces Portal <span className="material-symbols-outlined !text-xs">open_in_new</span>
        </a>
      </div>
    </div>
  );
}
