"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { SessionSummary } from "../types/sessions.types";
import { AgentRunSummary } from "@/features/agent-runs/types";
import { LiveTerminalLine } from "../hooks/useSessionSocket";
import { BASE_URL } from "@/lib/api-client";

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
  const [signozLogs, setSignozLogs] = useState<Array<{ type: string; text: string }> | null>(null);

  const isRunning = selectedRun?.status === "running" || selectedRun?.status === "pending";

  useEffect(() => {
    if (selectedRun?.id && !isRunning) {
      fetch(`${BASE_URL}/api/agent-runs/${selectedRun.id}/logs`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.logs) && data.logs.length > 0) {
            setSignozLogs(data.logs);
          } else {
            setSignozLogs(null);
          }
        })
        .catch(() => setSignozLogs(null));
    } else {
      setSignozLogs(null);
    }
  }, [selectedRun?.id, isRunning]);

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

    if (signozLogs && signozLogs.length > 0) {
      return signozLogs;
    }

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

    return [
      { type: "agent", text: `Task Prompt: "${selectedRun.prompt}"` },
      { type: "stdout", text: `Run Status: ${selectedRun.status}` },
      selectedRun.response
        ? { type: "stdout", text: selectedRun.response }
        : { type: "stdout", text: "No workspace terminal output logged." },
    ];
  }, [selectedRun, isRunning, liveTerminalLines, signozLogs, session]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= 40;
    setIsUserScrolledUp(!isAtBottom);
  };

  useEffect(() => {
    if (!isUserScrolledUp && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedContent, isUserScrolledUp]);

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
    <div className="relative w-full bg-[#0a0c10]/80 backdrop-blur-2xl border border-outline-variant/20 rounded-[24px] flex flex-col h-[400px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] font-mono overflow-hidden transition-all duration-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:border-outline-variant/30">
      {/* macOS Style Window Bar */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-black/40 shrink-0 select-none relative z-20 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-500/90 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500/90 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/90 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium text-[#8b949e]">
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
               <span className="material-symbols-outlined text-[16px] text-[#e6edf3]">terminal</span>
            </div>
            <span className="text-[#e6edf3] tracking-wide">Terminal — {session?.repositoryFullName || "Workspace Environment"}</span>
            {selectedRun && (
              <span className="text-[10px] bg-primary-fixed/10 border border-primary-fixed/20 text-primary-fixed rounded-lg px-2.5 py-1 font-mono tracking-widest uppercase">
                Run #{selectedRun.id.slice(-6)}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {signozLogs && signozLogs.length > 0 ? (
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-xl hidden sm:inline-block shadow-sm">
              SIGNOZ CLICKHOUSE
            </span>
          ) : (
            <span className="bg-primary-fixed/10 border border-primary-fixed/20 text-primary-fixed text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-xl hidden sm:inline-block shadow-sm">
              SIGNOZ OTLP
            </span>
          )}

          <span className="text-[11px] text-[#8b949e] font-mono bg-white/5 border border-white/5 px-2.5 py-1.5 rounded-lg shadow-inner">
            {session?.containerId ? `Docker: ${session.containerId.substring(0, 8)}` : "Container: Ready"}
          </span>

          <button
            type="button"
            onClick={handleCopyTerminal}
            className="flex items-center gap-2 text-xs text-[#c9d1d9] hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl px-3 py-1.5 transition-all duration-300 active:scale-95 group shadow-sm"
            title="Copy Terminal Log"
          >
            <span className="material-symbols-outlined text-[16px] group-hover:scale-110 transition-transform duration-300">{copied ? "check" : "content_copy"}</span>
            <span className="font-semibold tracking-wide">{copied ? "Copied" : "Copy"}</span>
          </button>
        </div>
      </div>

      {/* Terminal Viewport */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 p-6 md:p-8 font-mono text-[13px] overflow-y-auto space-y-3 custom-scrollbar bg-[#0a0c10]/60 text-[#c9d1d9] leading-[1.7] relative z-10"
      >
        {/* Subtle Ambient Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/5 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 space-y-2">
          {displayedContent.map((item, idx) => {
            if (item.type === "command") {
              return (
                <div key={idx} className="flex items-start gap-3 pt-3 text-[#f0f6fc] font-semibold break-all relative group">
                  <span className="text-primary-fixed select-none opacity-80 mt-0.5">$</span>
                  <span className="group-hover:text-white transition-colors duration-300">{item.text}</span>
                </div>
              );
            }

            if (item.type === "agent") {
              return (
                <div key={idx} className="text-primary-fixed font-medium break-all py-1.5 flex items-start gap-3">
                  <span className="text-primary-fixed font-bold select-none opacity-90 mt-0.5 border border-primary-fixed/30 bg-primary-fixed/10 px-1.5 rounded-md text-[9px] tracking-widest uppercase">Agent</span>
                  <span className="text-primary-fixed/90">{item.text}</span>
                </div>
              );
            }

            if (item.type === "success") {
              return (
                <div key={idx} className="text-emerald-400 font-semibold break-all py-2 flex items-start gap-3 bg-emerald-500/5 rounded-xl px-3.5 -mx-3.5 border border-emerald-500/10">
                  <span className="material-symbols-outlined text-[18px] text-emerald-400 mt-0.5 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">check_circle</span>
                  <span className="pt-0.5">{item.text}</span>
                </div>
              );
            }

            if (item.type === "error") {
              return (
                <div key={idx} className="text-rose-400 font-semibold break-all py-2 flex items-start gap-3 bg-rose-500/5 rounded-xl px-3.5 -mx-3.5 border border-rose-500/10">
                  <span className="material-symbols-outlined text-[18px] text-rose-400 mt-0.5 drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]">cancel</span>
                  <span className="pt-0.5">{item.text}</span>
                </div>
              );
            }

            if (item.type === "stderr") {
              return (
                <div key={idx} className="text-rose-400/90 break-all whitespace-pre-wrap pl-4 py-2.5 my-2 border-l-[3px] border-rose-500/50 bg-rose-500/5 rounded-r-xl text-[12px]">
                  {item.text}
                </div>
              );
            }

            return (
              <div key={idx} className="text-[#8b949e] break-all whitespace-pre-wrap pl-[25px] hover:text-[#c9d1d9] transition-colors duration-300">
                {item.text}
              </div>
            );
          })}

          {/* Pulsing prompt line during live execution */}
          <div className="flex items-center gap-3 pt-5 select-none relative z-10">
            <span className="text-primary-fixed font-bold opacity-80">$</span>
            {isRunning ? (
              <span className="text-[13px] text-primary-fixed font-semibold flex items-center gap-3">
                <span className="w-1.5 h-3 bg-primary-fixed animate-pulse shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.8)]"></span>
                <span className="opacity-80 animate-pulse tracking-wide">Agent executing workspace command...</span>
              </span>
            ) : (
              <span className="inline-block w-2.5 h-4 bg-primary-fixed animate-pulse shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.8)]"></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
