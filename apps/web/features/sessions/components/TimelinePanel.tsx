"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRunTimeline } from "@/features/agent-runs/hooks";
import { TimelineEvent } from "@/features/agent-runs/types";

export interface TimelinePanelProps {
  selectedRunId?: string;
  runStatus?: string;
  sessionId?: string;
  liveSocketEvents?: TimelineEvent[];
  isLive?: boolean;
}

export function TimelinePanel({ selectedRunId, runStatus, liveSocketEvents = [], isLive = false }: TimelinePanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isRunning = runStatus === "running" || runStatus === "pending";

  // Fetch historical timeline from SigNoz only when NOT relying on live socket stream for an active run
  const { data: timelineData, isLoading } = useRunTimeline(selectedRunId, {
    enabled: Boolean(selectedRunId) && !isLive && !isRunning,
    refetchInterval: false, // NO REST polling on Session Dashboard!
  });

  // Combine live socket stream for active runs, or historical fetched events for finished runs
  const events: TimelineEvent[] = (isLive || isRunning) && liveSocketEvents.length > 0
    ? liveSocketEvents
    : (timelineData?.events || []);

  const summary = timelineData?.summary;
  const telemetryStatus = timelineData?.telemetryStatus;

  // Automatically scroll to bottom as new timeline events arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [events]);

  const getEventIcon = (event: TimelineEvent) => {
    switch (event.phase) {
      case "setup":
        return event.eventType === "session.create" ? "bolt" : "inventory_2";
      case "workspace":
        return event.eventType === "workspace.clone" ? "folder_zip" : "psychology";
      case "agent":
        return "smart_toy";
      case "llm":
        return "memory";
      case "tool":
        return "build";
      case "git":
        return "difference";
      case "completion":
        return event.status === "failed" ? "error" : "check_circle";
      default:
        return "schedule";
    }
  };

  const getStatusClasses = (status: TimelineEvent["status"] | string) => {
    switch (status) {
      case "completed":
      case "success":
        return {
          nodeBg: "bg-emerald-400",
          border: "border-emerald-400",
          badgeBg: "bg-emerald-400",
          badgeText: "text-black border-[2px] border-black",
          text: "text-emerald-400",
          cardBg: "bg-black",
          shadow: "shadow-[4px_4px_0px_0px_#34d399]",
        };
      case "running":
      case "pending":
        return {
          nodeBg: "bg-primary-fixed",
          border: "border-primary-fixed",
          badgeBg: "bg-primary-fixed",
          badgeText: "text-black border-[2px] border-black",
          text: "text-primary-fixed",
          cardBg: "bg-[#111]", // Slightly lighter black to pop
          shadow: "shadow-[4px_4px_0px_0px_var(--color-primary-fixed)]",
        };
      case "failed":
      case "error":
        return {
          nodeBg: "bg-error",
          border: "border-error",
          badgeBg: "bg-error",
          badgeText: "text-black border-[2px] border-black",
          text: "text-error",
          cardBg: "bg-black",
          shadow: "shadow-[4px_4px_0px_0px_#ef4444]",
        };
      default:
        return {
          nodeBg: "bg-outline",
          border: "border-outline",
          badgeBg: "bg-outline",
          badgeText: "text-black border-[2px] border-black",
          text: "text-on-surface",
          cardBg: "bg-black",
          shadow: "shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]",
        };
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
      return timeStr;
    }
  };

  const formatDuration = (ms?: number) => {
    if (ms === undefined || ms === null) return "";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="bg-surface border-[3px] border-outline flex flex-col brutalist-shadow h-[220px] max-h-[220px] w-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b-[3px] border-outline flex justify-between items-center bg-black shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-xl">timeline</span>
          <div>
            <h3 className="text-base font-black uppercase text-on-surface">Execution Timeline</h3>
            {summary?.totalTokens !== undefined && summary.totalTokens > 0 && (
              <p className="font-mono-label text-[10px] text-primary-fixed font-bold uppercase">
                Tokens: {summary.totalTokens.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono-label text-xs font-bold">
          {isRunning || isLive ? (
            <span className="flex items-center gap-2 text-primary-fixed uppercase italic font-black animate-pulse">
              <span className="w-2.5 h-2.5 bg-primary-fixed"></span>
              Live Stream (Socket.IO)
            </span>
          ) : (
            <span className="text-outline uppercase text-[11px]">
              {events.length} Events
            </span>
          )}
        </div>
      </div>

      {/* Timeline Stream Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative bg-background"
      >
        {isLoading && events.length === 0 && !isLive && !isRunning ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8 animate-pulse font-black uppercase">
            Querying Traces...
          </div>
        ) : (!selectedRunId && events.length === 0) || (events.length === 0 && !isLive && !isRunning) ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8 space-y-2">
            <span className="material-symbols-outlined text-primary-fixed !text-3xl block">rocket_launch</span>
            <p className="font-black text-on-surface uppercase text-sm">Start your first run!</p>
          </div>
        ) : (
          events.map((item, idx) => {
            const statusStyle = getStatusClasses(item.status);
            const itemId = item.id || `evt-${idx}-${item.timestamp}`;
            const isExpanded = expandedId === itemId;
            const hasMeta = item.metadata && Object.keys(item.metadata).some(k => item.metadata![k] !== undefined);
            const isRunningEvt = item.status === 'running' || item.status === 'pending';

            return (
              <div
                key={itemId}
                onClick={() => setExpandedId(isExpanded ? null : itemId)}
                className="relative pl-12 group cursor-pointer mb-6 last:mb-0"
              >
                {/* Vertical Connecting Line */}
                {idx !== events.length - 1 && (
                  <div className={`absolute left-[3px] top-8 bottom-[-32px] w-[3px] ${isRunningEvt ? 'bg-primary-fixed animate-pulse' : 'bg-outline-variant'}`} />
                )}

                {/* Timeline Node */}
                <div
                  className={`absolute left-[-2px] top-1.5 w-3.5 h-3.5 border-[3px] border-background ${statusStyle.nodeBg} ${isRunningEvt ? 'animate-ping' : ''} z-10`}
                />
                {isRunningEvt && (
                  <div
                    className={`absolute left-[-2px] top-1.5 w-3.5 h-3.5 border-[3px] border-background ${statusStyle.nodeBg} z-20`}
                  />
                )}

                {/* Header Title & Duration */}
                <div className="flex justify-between items-start mb-2 font-mono-label">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-base ${statusStyle.text} ${isRunningEvt ? 'animate-spin' : ''}`}>
                      {getEventIcon(item)}
                    </span>
                    <span className={`font-black uppercase text-[13px] tracking-wide ${statusStyle.text}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-outline">
                    <span className="opacity-70">{formatTime(item.timestamp)}</span>
                    {item.durationMs !== undefined && (
                      <span className="text-on-surface bg-surface border-[2px] border-outline-variant px-2 py-0.5">{formatDuration(item.durationMs)}</span>
                    )}
                  </div>
                </div>

                {/* Brutalist Event Sub-Card */}
                <div className={`${statusStyle.cardBg} border-[3px] ${statusStyle.border} p-4 flex flex-col gap-3 transition-all duration-200 hover:-translate-y-1 hover:-translate-x-1 hover:${statusStyle.shadow} ${isExpanded ? statusStyle.shadow : ''}`}>
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-mono-label text-[13px] text-on-surface font-black truncate">
                      {item.description || item.title}
                    </span>
                    <div className="flex items-center gap-2">
                      {item.metadata?.isCached === true && (
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-mono-label text-[10px] font-black uppercase px-2 py-0.5 animate-pulse">
                          ⚡ CACHED
                        </span>
                      )}
                      <span className={`font-mono-label text-[11px] font-black uppercase px-3 py-1 ${statusStyle.badgeBg} ${statusStyle.badgeText} whitespace-nowrap ${isRunningEvt ? 'animate-pulse' : ''}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Expandable attributes */}
                  {isExpanded && hasMeta && (
                    <div className="mt-3 pt-3 border-t-[3px] border-dashed border-outline-variant/50 font-mono-label text-xs space-y-2 text-on-surface-variant bg-background p-3 border-2">
                      {Object.entries(item.metadata!).map(([key, val]) => {
                        if (val === undefined || val === null || val === '') return null;
                        return (
                          <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 sm:gap-4 border-b-2 border-outline-variant/30 pb-1 last:border-0 last:pb-0">
                            <span className="text-on-surface font-black uppercase">{key}</span>
                            <span className="text-primary-fixed font-mono whitespace-pre-wrap break-all">
                              {typeof val === "object" ? JSON.stringify(val) : String(val)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
