"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { SessionSummary } from "../types/sessions.types";
import { AgentRunSummary } from "@/features/agent-runs/types";
import { LiveTerminalLine } from "../hooks/useSessionSocket";

export interface TerminalPanelProps {
  session?: SessionSummary;
  selectedRun?: AgentRunSummary | null;
  liveTerminalLines?: LiveTerminalLine[];
}

export function TerminalPanel({
  session,
  selectedRun,
  liveTerminalLines = [],
}: TerminalPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [copied, setCopied] = useState(false);

  const isRunning = selectedRun?.status === "running" || selectedRun?.status === "pending";

  // Derive displayed terminal lines matching website theme
  const displayedContent = useMemo(() => {
    if (!selectedRun) {
      return [
        { type: "agent", text: "# Workspace terminal ready. Enter a task prompt above to begin AI agent execution." },
        { type: "stdout", text: `# Target repository: ${session?.repositoryFullName || "axray_workspace"} (${session?.branch || "main"})` },
      ];
    }

    if (isRunning) {
      if (liveTerminalLines.length > 0) {
        return liveTerminalLines.map((l) => ({ type: l.type, text: l.text }));
      }
      return [
        { type: "agent", text: `Task Prompt: "${selectedRun.prompt}"` },
        { type: "stdout", text: "Initializing Docker workspace container & runtime environment..." },
      ];
    }

    // Finished run: parse persisted terminalOutput
    if (selectedRun.terminalOutput) {
      const rawLines = selectedRun.terminalOutput.split("\n");
      return rawLines.map((line) => {
        if (line.startsWith("$ ")) {
          return { type: "command", text: line.substring(2) };
        } else if (line.startsWith("[Agent] ")) {
          return { type: "agent", text: line.substring(8) };
        } else if (line.startsWith("[Success] ")) {
          return { type: "success", text: line.substring(10) };
        } else if (line.startsWith("[Error] ")) {
          return { type: "error", text: line.substring(8) };
        } else if (line.startsWith("stderr: ")) {
          return { type: "stderr", text: line.substring(8) };
        } else {
          return { type: "stdout", text: line };
        }
      });
    }

    // Fallback if no terminal output recorded
    return [
      { type: "agent", text: `Task Prompt: "${selectedRun.prompt}"` },
      { type: "stdout", text: `Run Status: ${selectedRun.status}` },
      selectedRun.response
        ? { type: "stdout", text: selectedRun.response }
        : { type: "stdout", text: "No workspace terminal output logged." },
    ];
  }, [selectedRun, isRunning, liveTerminalLines, session]);

  // Handle user scroll detection for smart auto-scrolling
  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 40;
    setIsUserScrolledUp(!isAtBottom);
  };

  // Auto-scroll to bottom on output updates unless user scrolled up
  useEffect(() => {
    if (!isUserScrolledUp && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedContent, isUserScrolledUp]);

  // Copy terminal contents to clipboard
  const handleCopyTerminal = () => {
    const fullText = displayedContent
      .map((item) => {
        if (item.type === "command") return `$ ${item.text}`;
        if (item.type === "agent") return `[Agent] ${item.text}`;
        return item.text;
      })
      .join("\n");

    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full bg-surface border-[3px] border-outline flex flex-col h-[480px] brutalist-shadow font-mono-label selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Brutalist Header Bar matching website theme */}
      <div className="p-4 border-b-[3px] border-outline flex items-center justify-between bg-surface-container-high shrink-0 select-none">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-error border border-background"></div>
            <div className="w-3 h-3 bg-primary-fixed border border-background"></div>
            <div className="w-3 h-3 bg-outline border border-background"></div>
          </div>
          <div className="flex items-center gap-2 text-xs font-black uppercase text-on-surface">
            <span className="material-symbols-outlined text-sm text-primary-fixed">terminal</span>
            <span>TERMINAL // {session?.repositoryFullName || "WORKSPACE_ENV"}</span>
            {selectedRun && (
              <span className="text-[10px] bg-background border border-outline px-2 py-0.5 text-primary-fixed font-black">
                RUN #{selectedRun.id.slice(-6).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-mono-label text-[10px] font-bold text-on-surface-variant">
            {session?.containerId ? `DOCKER: ${session.containerId.substring(0, 8)}` : "CONTAINER: READY"}
          </span>

          <button
            type="button"
            onClick={handleCopyTerminal}
            className="flex items-center gap-1.5 text-[11px] font-black uppercase text-on-surface bg-surface border-2 border-outline px-3 py-1 hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
            title="Copy Terminal Log"
          >
            <span className="material-symbols-outlined text-xs">{copied ? "check" : "content_copy"}</span>
            <span>{copied ? "COPIED" : "COPY"}</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport themed to bg-background & brutalist tokens */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 p-6 font-mono-label text-xs overflow-y-auto space-y-2 custom-scrollbar bg-background text-on-surface leading-relaxed"
      >
        {displayedContent.map((item, idx) => {
          if (item.type === "command") {
            return (
              <div key={idx} className="flex items-start gap-2 pt-2 text-on-surface font-bold break-all">
                <span className="text-primary-fixed font-black select-none">$</span>
                <span className="text-on-surface font-black">{item.text}</span>
              </div>
            );
          }

          if (item.type === "agent") {
            return (
              <div key={idx} className="text-primary-fixed font-semibold break-all py-0.5">
                <span className="text-primary-fixed font-bold select-none">[Agent] </span>
                <span>{item.text}</span>
              </div>
            );
          }

          if (item.type === "success") {
            return (
              <div key={idx} className="text-emerald-400 font-bold break-all py-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-emerald-400">check_circle</span>
                <span>{item.text}</span>
              </div>
            );
          }

          if (item.type === "error") {
            return (
              <div key={idx} className="text-error font-bold break-all py-0.5 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm text-error">cancel</span>
                <span>{item.text}</span>
              </div>
            );
          }

          if (item.type === "stderr") {
            return (
              <div key={idx} className="text-error/90 break-all whitespace-pre-wrap pl-2 border-l-2 border-error/50">
                {item.text}
              </div>
            );
          }

          // Default stdout
          return (
            <div key={idx} className="text-on-surface-variant break-all whitespace-pre-wrap">
              {item.text}
            </div>
          );
        })}

        {/* Pulsing prompt line during live execution */}
        <div className="flex items-center gap-2 pt-3 select-none">
          <span className="text-primary-fixed font-black">$</span>
          {isRunning ? (
            <span className="text-xs text-primary-fixed font-bold uppercase animate-pulse flex items-center gap-2">
              <span className="w-2 h-2 bg-primary-fixed rounded-full animate-ping"></span>
              Agent executing workspace command...
            </span>
          ) : (
            <span className="inline-block w-2.5 h-4 bg-primary-fixed animate-pulse"></span>
          )}
        </div>
      </div>
    </div>
  );
}
