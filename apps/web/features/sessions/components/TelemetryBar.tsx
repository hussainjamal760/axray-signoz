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
    <div className="w-full bg-surface border-b-2 border-outline flex flex-col font-mono-label">
      {/* 1. Rate Limit / Error Live Alert Banner */}
      {(rateLimitWarning || latestEvent?.eventType === "rate_limit.retry") && (
        <div className="bg-rose-500/20 border-b border-rose-500/40 px-6 py-2 text-xs font-bold text-rose-300 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-rose-400">warning</span>
            <span>
              {latestEvent?.eventType === "rate_limit.retry"
                ? `GROQ API RATE LIMITED — ${latestEvent.title}: ${latestEvent.description}`
                : "GROQ API RATE LIMIT HIT — Retrying with exponential backoff..."}
            </span>
          </div>
          <span className="bg-rose-500 text-white text-[10px] uppercase font-black px-2 py-0.5">HTTP 429</span>
        </div>
      )}

      {/* 2. Primary Telemetry Bar */}
      <div className="px-6 py-3 bg-surface-container-highest/60 flex flex-wrap items-center justify-between gap-4">
        {/* Left side: Live Execution Phase & Turn counter */}
        <div className="flex items-center gap-4">
          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSessionActive ? "bg-emerald-400 animate-ping" : isError ? "bg-rose-500" : "bg-primary-fixed"}`} />
            <span className="text-xs font-black uppercase text-white tracking-wider">
              {isSessionActive ? "Live Telemetry" : "Telemetry History"}
            </span>
          </div>

          <div className="h-4 w-px bg-outline-variant" />

          {/* Turn Indicator */}
          {currentTurn > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface">
              <span className="text-on-surface-variant font-medium">Turn:</span>
              <span className="font-black text-primary-fixed bg-surface-container border border-outline px-2 py-0.5">
                {currentTurn} / 30
              </span>
            </div>
          )}

          {/* Active Phase Pill */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-on-surface-variant font-medium">Phase:</span>
            <span className="font-bold text-on-surface bg-surface border border-outline px-2 py-0.5 truncate max-w-[220px]">
              {executionPhase}
            </span>
          </div>
        </div>

        {/* Right side: Live Token Usage & Cost Meter */}
        <div className="flex items-center gap-6 text-xs">
          {/* Model Badge */}
          <div className="hidden sm:flex items-center gap-1.5 text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">memory</span>
            <span className="font-bold text-white truncate max-w-[180px]">{modelName}</span>
          </div>

          <div className="h-4 w-px bg-outline-variant hidden sm:block" />

          {/* Token Breakdown (Input / Output) */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[14px] text-primary-fixed">token</span>
            <div className="flex flex-col">
              <span className="font-black text-white leading-none">
                {totalTokens.toLocaleString()} <span className="text-[10px] text-on-surface-variant font-normal">tokens</span>
              </span>
              {totalTokens > 0 && (
                <span className="text-[9px] text-on-surface-variant leading-none mt-0.5">
                  In: {inputTokens.toLocaleString()} • Out: {outputTokens.toLocaleString()}
                </span>
              )}
            </div>
          </div>

          <div className="h-4 w-px bg-outline-variant" />

          {/* Cost USD Counter */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-emerald-400">
            <span className="material-symbols-outlined text-[14px]">attach_money</span>
            <div className="flex flex-col">
              <span className="font-black text-xs leading-none">${estimatedCost}</span>
              <span className="text-[8px] text-emerald-500/80 uppercase font-semibold leading-none mt-0.5">Est. Cost</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
