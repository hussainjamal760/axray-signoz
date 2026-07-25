"use client";

import React, { useMemo } from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";
import { LiveSocketEvent } from "../hooks/useSessionSocket";

interface FailureVisualizationProps {
  run?: AgentRunSummary | null;
  latestEvent?: LiveSocketEvent | null;
  onRetry?: () => void;
}

export function FailureVisualization({
  run,
  latestEvent,
  onRetry,
}: FailureVisualizationProps) {
  const errorMessage = useMemo(() => {
    return (
      run?.errorMessage ||
      latestEvent?.description ||
      latestEvent?.title ||
      "Agent execution encountered an unhandled error during execution."
    );
  }, [run, latestEvent]);

  const isRateLimit = useMemo(() => {
    const msg = errorMessage.toLowerCase();
    return msg.includes("429") || msg.includes("rate limit") || msg.includes("rate_limit");
  }, [errorMessage]);

  const suggestedFix = useMemo(() => {
    const msg = errorMessage.toLowerCase();
    if (isRateLimit) {
      return "Groq API Daily/Minute token quota reached. The agent automatically retries with backoff, or you can wait for quota reset.";
    }
    if (msg.includes("package.json") || msg.includes("enoent")) {
      return "Project files may be located inside a subfolder (e.g. nodeServer-main). Try adding 'Look inside subfolder nodeServer-main' to your prompt.";
    }
    if (msg.includes("tool_use_failed") || msg.includes("output_parse")) {
      return "LLM generated invalid tool syntax. The self-correction engine will attempt alternative formatting on retry.";
    }
    return "Review the error trace in SigNoz, refine your prompt instructions, and click 'Retry Task' to rerun.";
  }, [errorMessage, isRateLimit]);

  const signozUrl = "http://localhost:8080/logs/logs-explorer";

  return (
    <div className="w-full bg-surface border-[3px] border-rose-500 brutalist-shadow p-6 flex flex-col gap-6 font-mono-label animate-fadeIn">
      {/* 1. Header & Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-rose-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rose-500 text-white flex items-center justify-center font-black">
            <span className="material-symbols-outlined text-2xl">error</span>
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-white tracking-wider">
              {isRateLimit ? "Groq Rate Limit (HTTP 429)" : "Run Execution Failed"}
            </h3>
            <p className="text-xs text-rose-400 font-bold uppercase">
              SigNoz OTLP Error Captured • Service: axray-agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/50 px-3 py-1 font-bold text-xs uppercase">
            {isRateLimit ? "API QUOTA EXCEEDED" : "EXIT_CODE_ERROR"}
          </span>
        </div>
      </div>

      {/* 2. Error Message Output */}
      <div className="bg-black border-2 border-rose-500/50 p-4 text-xs font-mono text-rose-300 leading-relaxed overflow-x-auto max-h-40 custom-scrollbar">
        <div className="flex items-center justify-between mb-2 text-[10px] text-rose-400 uppercase font-black border-b border-rose-500/30 pb-1">
          <span>Captured Exception Payload</span>
          <span>Span Status: ERROR</span>
        </div>
        <pre className="whitespace-pre-wrap break-all">{errorMessage}</pre>
      </div>

      {/* 3. AI Recovery & Suggested Solution */}
      <div className="bg-emerald-500/10 border-2 border-emerald-500/40 p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-400 font-black text-xs uppercase">
          <span className="material-symbols-outlined text-base">psychology</span>
          <span>AI Self-Healing Recommendation</span>
        </div>
        <p className="text-xs text-emerald-300 leading-normal font-semibold">
          {suggestedFix}
        </p>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <a
          href={signozUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-surface-container-highest border-2 border-outline px-4 py-2 text-xs font-black uppercase text-white hover:bg-surface-variant transition-all brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
        >
          <span className="material-symbols-outlined text-sm text-primary-fixed">monitoring</span>
          <span>View Traces in SigNoz</span>
          <span className="material-symbols-outlined text-xs text-on-surface-variant">open_in_new</span>
        </a>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="flex items-center gap-2 bg-rose-500 text-white border-2 border-outline px-6 py-2 text-xs font-black uppercase hover:bg-rose-600 transition-all brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>Retry Run Execution</span>
          </button>
        )}
      </div>
    </div>
  );
}
