"use client";

import React, { useState, useEffect, useRef } from "react";
import { useTimeline } from "../hooks";
import { TimelineItem } from "../types/sessions.types";

export interface TimelinePanelProps {
  sessionId?: string;
  isRunning?: boolean;
}

export function TimelinePanel({ sessionId = "", isRunning = false }: TimelinePanelProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const { data: timelineItems = [], isLoading } = useTimeline(sessionId, {
    refetchInterval: isRunning ? 2000 : false,
  });

  // Automatically scroll to bottom as new timeline events arrive
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [timelineItems]);

  const getEventIcon = (item: TimelineItem) => {
    switch (item.type) {
      case "session":
        return "bolt";
      case "container":
        return "inventory_2";
      case "git":
        return "folder_zip";
      case "workspace":
        return "psychology";
      case "runtime":
        return "view_in_ar";
      case "agent":
        return "smart_toy";
      case "tool":
        return "build";
      case "diff":
        return "difference";
      default:
        return "schedule";
    }
  };

  const getStatusClasses = (status: TimelineItem["status"]) => {
    switch (status) {
      case "completed":
        return {
          nodeBg: "bg-emerald-500",
          border: "border-emerald-500/50",
          badgeBg: "bg-emerald-500/20",
          badgeText: "text-emerald-400 border border-emerald-500/40",
          text: "text-emerald-400",
        };
      case "running":
        return {
          nodeBg: "bg-primary-fixed animate-pulse",
          border: "border-primary-fixed",
          badgeBg: "bg-primary-fixed/20",
          badgeText: "text-primary-fixed border border-primary-fixed/40 animate-pulse",
          text: "text-primary-fixed",
        };
      case "failed":
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
      <div className="p-6 border-b-2 border-outline flex justify-between items-center bg-black shrink-0">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-xl">timeline</span>
          <h3 className="text-xl font-black uppercase text-on-surface">Execution Timeline</h3>
        </div>

        <div className="flex items-center gap-2 font-mono-label text-xs font-bold">
          {isRunning ? (
            <span className="flex items-center gap-2 text-primary-fixed uppercase italic font-black animate-pulse">
              <span className="w-3 h-3 bg-primary-fixed"></span>
              Active Polling
            </span>
          ) : (
            <span className="text-outline uppercase">
              {timelineItems.length} Events
            </span>
          )}
        </div>
      </div>

      {/* Brutalist Timeline Stream Body */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 relative bg-background"
      >
        {/* Connecting Vertical Line */}
        <div className="absolute left-[47px] top-6 bottom-6 w-[2px] bg-outline-variant"></div>

        {isLoading && timelineItems.length === 0 ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8 animate-pulse">
            Fetching OpenTelemetry spans from SigNoz...
          </div>
        ) : timelineItems.length === 0 ? (
          <div className="font-mono-label text-xs text-outline-variant text-center py-8">
            # No execution events recorded yet.
          </div>
        ) : (
          timelineItems.map((item) => {
            const statusStyle = getStatusClasses(item.status);
            const isExpanded = expandedId === item.id;
            const hasAttr = item.attributes && Object.keys(item.attributes).length > 0;
            const primaryDetail =
              item.attributes?.["filePath"] ||
              item.attributes?.["command"] ||
              item.attributes?.["repository.name"] ||
              item.attributes?.["prompt"] ||
              item.name;

            return (
              <div
                key={item.id}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
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
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-bold text-outline">
                    <span>{formatTime(item.startTime)}</span>
                    {item.durationMs !== undefined && (
                      <span className="text-primary-fixed font-black">{formatDuration(item.durationMs)}</span>
                    )}
                  </div>
                </div>

                {/* Brutalist Event Sub-Card */}
                <div className={`bg-black border-2 ${statusStyle.border} p-3 flex flex-col gap-2 transition-colors hover:border-primary-fixed`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono-label text-xs text-on-surface font-bold truncate">
                      {primaryDetail}
                    </span>
                    <span className={`font-mono-label text-[10px] font-black uppercase px-2 py-0.5 ${statusStyle.badgeBg} ${statusStyle.badgeText}`}>
                      {item.status}
                    </span>
                  </div>

                  {/* Expandable attributes */}
                  {isExpanded && hasAttr && (
                    <div className="mt-2 pt-2 border-t border-outline-variant/40 font-mono-label text-[11px] space-y-1 text-on-surface-variant">
                      {Object.entries(item.attributes!).map(([key, val]) => (
                        <div key={key} className="flex justify-between gap-2">
                          <span className="text-outline font-bold">{key}:</span>
                          <span className="text-primary-fixed font-mono whitespace-pre-wrap break-all">
                            {typeof val === "object" ? JSON.stringify(val) : String(val)}
                          </span>
                        </div>
                      ))}
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
