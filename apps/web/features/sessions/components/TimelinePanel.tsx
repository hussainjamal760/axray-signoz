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
          nodeBg: "bg-emerald-500",
          border: "border-emerald-500/50",
          badgeBg: "bg-emerald-500/20",
          badgeText: "text-emerald-400 border border-emerald-500/40",
          text: "text-emerald-400",
        };
      case "running":
      case "pending":
        return {
          nodeBg: "bg-primary-fixed animate-pulse",
          border: "border-primary-fixed",
          badgeBg: "bg-primary-fixed/20",
          badgeText: "text-primary-fixed border border-primary-fixed/40 animate-pulse",
          text: "text-primary-fixed",
        };
      case "failed":
      case "error":
        return {
          nodeBg: "bg-error",
          border: "border-error/60",
          badgeBg: "bg-error/20",
          badgeText: "text-error border border-error/40",
          text: "text-error",
        };
      default:
        return {
          nodeBg: "bg-outline",
          border: "border-outline-variant",
          badgeBg: "bg-surface-container-high",
          badgeText: "text-outline-variant",
          text: "text-primary-fixed",
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
    <div className="bg-surface border-[3px] border-outline flex flex-col brutalist-shadow h-[380px] max-h-[380px] w-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b-2 border-outline flex justify-between items-center bg-black shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-xl">timeline</span>
          <div>
            <h3 className="text-base font-black uppercase text-on-surface">Execution Timeline</h3>
            {summary?.totalTokens !== undefined && summary.totalTokens > 0 && (
              <p className="font-mono-label text-[10px] text-primary-fixed font-bold">
                Tokens Used: {summary.totalTokens.toLocaleString()} {summary.inputTokens !== undefined ? `(${summary.inputTokens.toLocaleString()} in / ${(summary.outputTokens || 0).toLocaleString()} out)` : ''}
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
          ) : telemetryStatus === "authoritative_signoz" ? (
            <span className="text-emerald-400 font-mono text-[10px] uppercase border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
              SigNoz Traces
            </span>
          ) : (
            <span className="text-outline uppercase text-[11px]">
              {events.length} Events
            </span>
          )}
        </div>
      </div>

      {/* Brutalist Timeline Stream Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative bg-background"
      >
        {isLoading && events.length === 0 && !isLive && !isRunning ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8 animate-pulse">
            Querying SigNoz telemetry traces...
          </div>
        ) : telemetryStatus === "unavailable" && events.length === 0 && !isLive && !isRunning ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8">
            # Execution telemetry is temporarily unavailable.
          </div>
        ) : (!selectedRunId && events.length === 0) || (events.length === 0 && !isLive && !isRunning) ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8 space-y-2">
            <span className="material-symbols-outlined text-primary-fixed !text-3xl block">rocket_launch</span>
            <p className="font-black text-on-surface uppercase text-sm">Start your first run and see the magic here!</p>
            <p className="text-[11px] text-outline font-bold">Telemetry traces will stream live as the agent executes.</p>
          </div>
        ) : (
          events.map((item, idx) => {
            const statusStyle = getStatusClasses(item.status);
            const itemId = item.id || `evt-${idx}-${item.timestamp}`;
            const isExpanded = expandedId === itemId;
            const hasMeta = item.metadata && Object.keys(item.metadata).some(k => item.metadata![k] !== undefined);

            return (
              <div
                key={itemId}
                onClick={() => setExpandedId(isExpanded ? null : itemId)}
                className="relative pl-12 group cursor-pointer"
              >
                {/* Square Timeline Node */}
                <div
                  className={`absolute left-[-4px] top-1 w-4 h-4 border-2 border-background ${statusStyle.nodeBg}`}
                />

                {/* Header Title & Duration */}
                <div className="flex justify-between items-start mb-2 font-mono-label">
                  <div className="flex items-center gap-2">
                    <span className={`material-symbols-outlined text-sm ${statusStyle.text}`}>
                      {getEventIcon(item)}
                    </span>
                    <span className={`font-black uppercase text-xs ${statusStyle.text}`}>
                      {item.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-outline">
                    <span>{formatTime(item.timestamp)}</span>
                    {item.durationMs !== undefined && (
                      <span className="text-primary-fixed font-black">{formatDuration(item.durationMs)}</span>
                    )}
                  </div>
                </div>

                {/* Brutalist Event Sub-Card */}
                <div className={`bg-black border-2 ${statusStyle.border} p-3 flex flex-col gap-2 transition-colors hover:border-primary-fixed`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-label text-xs text-on-surface font-bold truncate">
                      {item.description || item.title}
                    </span>
                    <span className={`font-mono-label text-[10px] font-black uppercase px-2 py-0.5 ${statusStyle.badgeBg} ${statusStyle.badgeText}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Expandable attributes */}
                  {isExpanded && hasMeta && (
                    <div className="mt-2 pt-2 border-t border-outline-variant/40 font-mono-label text-[11px] space-y-1 text-on-surface-variant">
                      {Object.entries(item.metadata!).map(([key, val]) => {
                        if (val === undefined || val === null || val === '') return null;
                        return (
                          <div key={key} className="flex justify-between gap-2">
                            <span className="text-outline font-bold">{key}:</span>
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
