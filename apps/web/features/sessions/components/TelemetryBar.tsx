"use client";

import React, { useMemo } from "react";
import { LiveSocketEvent, LiveTraceSpan } from "../hooks/useSessionSocket";

interface TelemetryBarProps {
  events?: LiveSocketEvent[];
  latestEvent?: LiveSocketEvent | null;
  liveTraces?: LiveTraceSpan[];
  isSessionActive?: boolean;
}

export function TelemetryBar({
  events = [],
  latestEvent,
  isSessionActive = false,
}: TelemetryBarProps) {
  // Compute cumulative token usage from live events stream
  const { inputTokens, outputTokens, totalTokens, currentTurn, modelName, rateLimitWarning, executionPhase, isError } =
    useMemo(() => {
      let inTokens = 0;
      let outTokens = 0;
      let maxTurn = 0;
      let model = "groq / openai/gpt-oss-20b";
      let rateLimit = false;
      let phase = "Idle";
      let hasErr = false;

      for (const ev of events) {
        if (ev.metadata) {
          if (typeof ev.metadata.inputTokens === "number") {
            inTokens += ev.metadata.inputTokens;
          }
          if (typeof ev.metadata.outputTokens === "number") {
            outTokens += ev.metadata.outputTokens;
          }
          if (typeof ev.metadata.turn === "number" && ev.metadata.turn > maxTurn) {
            maxTurn = ev.metadata.turn;
          }
          if (typeof ev.metadata.model === "string") {
            model = `groq / ${ev.metadata.model}`;
          }
          if (ev.metadata.isRateLimit === true || ev.description?.includes("RATE LIMITED") || ev.title?.includes("RATE LIMITED")) {
            rateLimit = true;
          }
        }

        if (ev.status === "failed" || ev.phase === "error") {
          hasErr = true;
        }
      }

      // Determine active execution phase label
      if (latestEvent) {
        if (latestEvent.phase === "llm") phase = "LLM Reasoning";
        else if (latestEvent.phase === "tool") phase = `Executing: ${latestEvent.title.replace("Tool: ", "")}`;
        else if (latestEvent.phase === "workspace") phase = "Preparing Workspace";
        else if (latestEvent.phase === "completion") phase = "Completed";
        else if (latestEvent.phase === "error") phase = "Execution Error";
      }

      const tot = inTokens + outTokens;
      return {
        inputTokens: inTokens,
        outputTokens: outTokens,
        totalTokens: tot,
        currentTurn: maxTurn,
        modelName: model,
        rateLimitWarning: rateLimit,
        executionPhase: phase,
        isError: hasErr,
      };
    }, [events, latestEvent]);

  // Groq pricing formula: ($0.59 / 1M prompt) + ($0.79 / 1M completion)
  const estimatedCost = useMemo(() => {
    const cost = (inputTokens * 0.59 + outputTokens * 0.79) / 1_000_000;
    return cost.toFixed(5);
  }, [inputTokens, outputTokens]);

  return (
    <div className="w-full bg-surface-container-lowest/40 backdrop-blur-md border-b border-white/5 flex flex-col font-sans">
      {/* 1. Rate Limit / Error Live Alert Banner */}
      {(rateLimitWarning || latestEvent?.eventType === "rate_limit.retry") && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 px-6 py-2 text-xs font-medium text-rose-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-rose-400">warning</span>
            <span>
              {latestEvent?.eventType === "rate_limit.retry"
                ? `GROQ API RATE LIMITED — ${latestEvent.title}: ${latestEvent.description}`
                : "GROQ API RATE LIMIT HIT — Retrying with exponential backoff..."}
            </span>
          </div>
          <span className="bg-rose-500/20 text-rose-300 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-rose-500/30">
            HTTP 429
          </span>
        </div>
      )}

      {/* 2. Primary Telemetry Bar */}
      <div className="px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Left side: Live Execution Phase & Turn counter */}
        <div className="flex items-center gap-4">
          {/* Status Indicator Pill */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-2xl">
            <span className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.5)] ${isSessionActive ? "bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.5)]" : isError ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]" : "bg-primary-fixed"}`} />
            <span className="font-semibold uppercase tracking-wider text-on-surface text-[10px]">
              {isSessionActive ? "Live Telemetry" : "Telemetry History"}
            </span>
          </div>

          <div className="h-4 w-px bg-white/10" />

          {/* Turn Indicator */}
          {currentTurn > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-on-surface-variant font-medium">Turn:</span>
              <span className="font-semibold text-primary-fixed bg-primary-fixed/10 rounded-2xl px-2.5 py-0.5 text-[11px]">
                {currentTurn} / 30
              </span>
            </div>
          )}

          {/* Active Phase Pill */}
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant font-medium">Phase:</span>
            <span className="font-medium text-on-surface bg-white/5 rounded-2xl px-3 py-1 text-[11px] truncate max-w-[220px]">
              {executionPhase}
            </span>
          </div>
        </div>

        {/* Right side: Live Token Usage & Cost Meter */}
        <div className="flex items-center gap-6">
          {/* Model Badge */}
          <div className="hidden sm:flex items-center gap-2 text-on-surface-variant bg-white/5 rounded-2xl px-3 py-1.5">
            <span className="material-symbols-outlined text-[14px]">memory</span>
            <span className="font-medium text-on-surface text-[11px] truncate max-w-[180px]">{modelName}</span>
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          {/* Token Breakdown (Input / Output) */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-primary-fixed">token</span>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-on-surface text-xs">
                {totalTokens.toLocaleString()} <span className="text-[11px] text-on-surface-variant font-normal">tokens</span>
              </span>
              {totalTokens > 0 && (
                <span className="text-[10px] text-on-surface-variant font-mono">
                  ({inputTokens.toLocaleString()} in / {outputTokens.toLocaleString()} out)
                </span>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-outline-variant/20" />

          {/* Cost USD Counter */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 rounded-2xl px-3.5 py-1 text-emerald-400">
            <span className="material-symbols-outlined text-[14px]">attach_money</span>
            <span className="font-semibold text-xs font-mono">${estimatedCost}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
