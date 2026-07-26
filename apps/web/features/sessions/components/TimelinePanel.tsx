"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRunTimeline } from "@/features/agent-runs/hooks";
import { TimelineEvent } from "@/features/agent-runs/types";

export interface TimelinePanelProps {
  selectedRunId?: string;
  runStatus?: string;
  sessionId?: string;
  liveSocketEvents?: TimelineEvent[];
  forcedEvents?: TimelineEvent[];
  isLive?: boolean;
  className?: string;
}

export function TimelinePanel({ selectedRunId, runStatus, liveSocketEvents = [], forcedEvents, isLive = false, className }: TimelinePanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isRunning = runStatus === "running" || runStatus === "pending";

  const { data: timelineData, isLoading } = useRunTimeline(selectedRunId, {
    enabled: Boolean(selectedRunId) && !isLive && !isRunning,
    refetchInterval: false,
  });

  const events: TimelineEvent[] = forcedEvents
    ? forcedEvents
    : (isLive || isRunning) && liveSocketEvents.length > 0
      ? liveSocketEvents
      : (timelineData?.events || []);

  const summary = timelineData?.summary;
  const telemetryStatus = timelineData?.telemetryStatus;

  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollToBottom = () => {
        container.scrollTop = container.scrollHeight;
      };
      scrollToBottom();
      const timer = setTimeout(scrollToBottom, 50);
      return () => clearTimeout(timer);
    }
  }, [events.length, events]);

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
          nodeBg: "bg-emerald-500",
          nodeGlow: "shadow-[0_0_12px_rgba(16,185,129,0.5)]",
          border: "border-emerald-500/20",
          badgeBg: "bg-emerald-500/10",
          badgeText: "text-emerald-400",
          text: "text-emerald-400",
          iconBg: "bg-emerald-500/10",
          cardBg: "bg-surface-container-lowest/60 hover:bg-surface-container-lowest",
        };
      case "running":
      case "pending":
        return {
          nodeBg: "bg-primary-fixed",
          nodeGlow: "shadow-[0_0_12px_rgba(var(--color-primary-fixed),0.6)]",
          border: "border-primary-fixed/30",
          badgeBg: "bg-primary-fixed/10",
          badgeText: "text-primary-fixed",
          text: "text-primary-fixed",
          iconBg: "bg-primary-fixed/10",
          cardBg: "bg-surface-container-lowest/60 hover:bg-surface-container-lowest",
        };
      case "failed":
      case "error":
        return {
          nodeBg: "bg-rose-500",
          nodeGlow: "shadow-[0_0_12px_rgba(244,63,94,0.5)]",
          border: "border-rose-500/20",
          badgeBg: "bg-rose-500/10",
          badgeText: "text-rose-400",
          text: "text-rose-400",
          iconBg: "bg-rose-500/10",
          cardBg: "bg-surface-container-lowest/60 hover:bg-surface-container-lowest",
        };
      default:
        return {
          nodeBg: "bg-on-surface-variant/50",
          nodeGlow: "",
          border: "border-outline-variant/10",
          badgeBg: "bg-surface-container/50",
          badgeText: "text-on-surface-variant",
          text: "text-on-surface-variant",
          iconBg: "bg-surface-container",
          cardBg: "bg-surface-container-lowest/40 hover:bg-surface-container-lowest",
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
    <div className={`relative bg-surface-container-lowest/40 backdrop-blur-2xl border border-outline-variant/20 rounded-[24px] flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:border-outline-variant/30 ${className || 'h-[280px] max-h-[280px]'}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-lowest/60 shrink-0 relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary-fixed/10 flex items-center justify-center border border-primary-fixed/20 shadow-inner">
             <span className="material-symbols-outlined text-primary-fixed text-[18px]">route</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-on-surface tracking-tight">Execution Timeline</h3>
            {summary?.totalTokens !== undefined && summary.totalTokens > 0 && (
              <p className="text-[10px] text-on-surface-variant font-mono font-medium mt-0.5 flex items-center gap-1">
                <span className="text-primary-fixed text-[8px]">⟡</span> {summary.totalTokens.toLocaleString()} tokens
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium">
          {telemetryStatus === 'authoritative_signoz' && (
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-sm font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
              SigNoz
            </span>
          )}

          {isRunning || isLive ? (
            <span className="flex items-center gap-2 text-primary-fixed text-[11px] font-bold tracking-wider uppercase animate-pulse">
              <span className="w-2 h-2 rounded-full bg-primary-fixed shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.8)]"></span>
              Live
            </span>
          ) : (
            <span className="text-on-surface-variant text-[11px] font-mono bg-white/5 px-2.5 py-1 rounded-xl">
              {events.length} EVTS
            </span>
          )}
        </div>
      </div>

      {/* Timeline Stream Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-2 relative z-10"
        data-lenis-prevent="true"
      >
        {isLoading && events.length === 0 && !isLive && !isRunning ? (
          <div className="text-xs text-on-surface-variant text-center py-8 animate-pulse font-medium tracking-wide">
            Querying Traces...
          </div>
        ) : (!selectedRunId && events.length === 0) || (events.length === 0 && !isLive && !isRunning) ? (
          <div className="text-xs text-on-surface-variant text-center py-8 space-y-3">
            <span className="material-symbols-outlined text-primary-fixed text-3xl block drop-shadow-[0_0_12px_rgba(var(--color-primary-fixed),0.4)]">rocket_launch</span>
            <p className="font-bold text-on-surface text-sm tracking-tight">Ready to Launch</p>
            <p className="text-on-surface-variant/70 text-[11px]">Start your first run to see the timeline</p>
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
                className="relative pl-10 group cursor-pointer mb-5 last:mb-0"
              >
                {/* Vertical Connecting Line */}
                {idx !== events.length - 1 && (
                  <div className={`absolute left-[11px] top-8 bottom-[-24px] w-[2px] rounded-full ${isRunningEvt ? 'bg-gradient-to-b from-primary-fixed via-primary-fixed/50 to-transparent animate-pulse' : 'bg-gradient-to-b from-outline-variant/30 to-outline-variant/5'}`} />
                )}

                {/* Timeline Node (Apple style ring) */}
                <div
                  className={`absolute left-[5px] top-4 w-3.5 h-3.5 rounded-full border-[2px] bg-background flex items-center justify-center z-10 transition-transform duration-500 ease-out group-hover:scale-125 ${statusStyle.border}`}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${statusStyle.nodeBg} ${statusStyle.nodeGlow} ${isRunningEvt ? 'animate-ping' : ''}`} />
                </div>

                {/* Event Card */}
                <div className={`relative ${statusStyle.cardBg} backdrop-blur-md border ${statusStyle.border} rounded-2xl p-3.5 flex flex-col gap-3 transition-all duration-500 ease-out group-hover:translate-x-1 hover:shadow-lg overflow-hidden group-hover:border-opacity-50`}>
                  
                  {/* Subtle Background Glow */}
                  <div className={`absolute -right-10 -top-10 w-24 h-24 rounded-full blur-3xl opacity-[0.15] ${statusStyle.nodeBg} pointer-events-none transition-opacity duration-700 group-hover:opacity-30`} />

                  <div className="flex items-center justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-9 h-9 rounded-[10px] ${statusStyle.iconBg} flex items-center justify-center shrink-0 border border-white/5`}>
                        <span className={`material-symbols-outlined text-[18px] ${statusStyle.text} ${isRunningEvt ? 'animate-spin' : ''}`}>
                          {getEventIcon(item)}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[13px] font-bold text-on-surface truncate tracking-tight">
                          {item.description || item.title}
                        </span>
                        <span className="text-[10px] font-medium text-on-surface-variant/70 font-mono">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {item.durationMs !== undefined && (
                        <span className="text-[10px] text-on-surface-variant bg-white/5 rounded-xl px-2 py-1 font-mono tracking-wider">
                          {formatDuration(item.durationMs)}
                        </span>
                      )}
                      <span className={`text-[9px] font-bold uppercase tracking-widest rounded-xl px-2.5 py-1 ${statusStyle.badgeBg} ${statusStyle.badgeText}`}>
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Expandable attributes with CSS Grid Animation */}
                  <div 
                    className={`grid transition-[grid-template-rows,opacity,margin] duration-500 ease-in-out ${isExpanded && hasMeta ? "grid-rows-[1fr] opacity-100 mt-2" : "grid-rows-[0fr] opacity-0 mt-0"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="pt-3 border-t border-outline-variant/10 font-mono text-[11px] space-y-2 text-on-surface-variant bg-surface-container-lowest/30 p-3 rounded-xl shadow-inner">
                        {item.metadata && Object.entries(item.metadata).map(([key, val]) => {
                          if (val === undefined || val === null || val === '') return null;
                          return (
                            <div key={key} className="flex flex-col sm:flex-row sm:justify-between gap-1 border-b border-outline-variant/5 pb-1.5 last:border-0 last:pb-0">
                              <span className="text-on-surface/80 font-bold text-[10px] uppercase tracking-wider">{key}</span>
                              <span className="text-primary-fixed whitespace-pre-wrap break-all text-[10px] max-w-[75%] sm:text-right">
                                {typeof val === "object" ? JSON.stringify(val) : String(val)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
