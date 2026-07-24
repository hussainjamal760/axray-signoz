"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { SessionSummary } from "../types/sessions.types";
import { useCreatePullRequest } from "../hooks/useCreatePullRequest";
import { LiveSocketEvent } from "../hooks/useSessionSocket";
import { AgentRunSummary } from "@/features/agent-runs/types";

export interface SessionHeaderProps {
  session: SessionSummary;
  events?: LiveSocketEvent[];
  latestEvent?: LiveSocketEvent | null;
  isSessionActive?: boolean;
  selectedRun?: AgentRunSummary | null;
}

export function SessionHeader({
  session,
  events = [],
  latestEvent,
  isSessionActive = false,
  selectedRun,
}: SessionHeaderProps) {
  const queryClient = useQueryClient();
  const { mutate: handleCreatePR, isPending: isCreatingPR, error: prError, reset: resetPRState } = useCreatePullRequest(session.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (prError) {
      setToastMessage(prError.message || "No code changes detected in workspace.");
      queryClient.invalidateQueries({ queryKey: ['session', session.id] });
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      const timer = setTimeout(() => {
        setToastMessage(null);
        resetPRState();
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [prError, resetPRState, queryClient, session.id]);

  // Compute live telemetry metrics or fallback to historical run
  const { totalTokens, estimatedCost, executionPhase } = useMemo(() => {
    let inTokens = 0;
    let outTokens = 0;
    let phase = "Idle";

    if (events && events.length > 0) {
      for (const ev of events) {
        if (ev.metadata) {
          if (typeof ev.metadata.inputTokens === "number") inTokens += ev.metadata.inputTokens;
          if (typeof ev.metadata.outputTokens === "number") outTokens += ev.metadata.outputTokens;
        }
      }
    } else if (selectedRun && selectedRun.tokensUsed) {
      // Estimate split for cost calculation if we only have total tokens
      inTokens = selectedRun.tokensUsed * 0.8;
      outTokens = selectedRun.tokensUsed * 0.2;
    }

    if (latestEvent) {
      if (latestEvent.phase === "llm") phase = "LLM Reasoning";
      else if (latestEvent.phase === "tool") phase = `Executing Tool`;
      else if (latestEvent.phase === "workspace") phase = "Preparing Workspace";
      else if (latestEvent.phase === "completion") phase = "Completed";
      else if (latestEvent.phase === "error") phase = "Execution Error";
    }

    const tot = inTokens + outTokens;
    const cost = ((inTokens * 0.59 + outTokens * 0.79) / 1_000_000).toFixed(5);

    return { totalTokens: tot, estimatedCost: cost, executionPhase: phase };
  }, [events, latestEvent, selectedRun]);

  const badgeClass =
    session.status === "active"
      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
      : session.status === "completed"
        ? "bg-purple-500/10 border-purple-500/30 text-purple-300 font-medium"
        : "bg-surface-container-highest border-outline-variant/30 text-on-surface-variant";

  const pr = session.pullRequest;

  const getPrBadgeStyle = (status: string) => {
    switch (status) {
      case "merged":
        return "bg-purple-500/10 border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)] hover:border-purple-500/50";
      case "closed":
        return "bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] hover:border-rose-500/50";
      default:
        return "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:border-emerald-500/50";
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification Banner for Validation Errors */}
      {toastMessage && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-6 py-3 text-xs font-medium text-amber-200 flex items-center justify-between animate-fadeIn shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-base text-amber-400">info</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-amber-400 hover:text-white font-semibold text-[11px] uppercase tracking-wider transition-colors"
          >
            DISMISS
          </button>
        </div>
      )}

      <section className="px-6 py-4 border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 z-20">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 pr-2">
            <span className="material-symbols-outlined text-primary-fixed text-lg">dashboard</span>
            <h1 className="text-sm font-bold text-on-surface tracking-tight">Telemetry History</h1>
          </div>

          <div className="h-4 w-px bg-outline-variant/30 mx-1 hidden sm:block" />

          {/* 3. Session Status */}
          <div className={`flex items-center gap-2 border rounded-full px-3.5 py-1 text-xs font-medium ${badgeClass}`}>
            <span className="material-symbols-outlined text-[14px]">
              {session.status === "active" ? "check_circle" : session.status === "completed" ? "task_alt" : "archive"}
            </span>
            {session.status === "active" ? "Active" : session.status === "completed" ? "Completed" : "Archived"}
          </div>

          {/* Integrated Telemetry Pills */}
          <div className="flex items-center gap-2 bg-primary-fixed/10 border border-primary-fixed/30 rounded-full px-3 py-1 text-[11px] font-semibold text-primary-fixed">
            <span className={`w-2 h-2 rounded-full bg-primary-fixed ${isSessionActive ? "animate-ping" : ""}`}></span>
            <span>{isSessionActive ? executionPhase : "Idle"}</span>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container border border-outline-variant/20 rounded-full px-3 py-1 text-[11px] text-on-surface">
            <span className="material-symbols-outlined text-[13px] text-primary-fixed">token</span>
            <span className="font-mono">{Math.round(totalTokens).toLocaleString()} tokens</span>
          </div>

          <div className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full px-3 py-1 text-[11px] font-mono font-medium">
            <span>${estimatedCost}</span>
          </div>
        </div>

        {/* SigNoz Portal Link & Pull Request Actions */}
        <div className="flex items-center gap-4">
          <a
            href="http://localhost:8080"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center gap-2.5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-[#e6edf3] text-xs font-semibold rounded-2xl px-5 py-2.5 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:-translate-y-0.5 active:translate-y-0"
            title="Open Self-Hosted SigNoz Observability Portal"
          >
            <span className="material-symbols-outlined text-[16px] text-primary-fixed drop-shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.5)] group-hover:scale-110 transition-transform duration-300">monitoring</span>
            <span className="tracking-wide">SigNoz Portal</span>
            <span className="material-symbols-outlined text-[14px] text-white/30 group-hover:text-white/70 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all duration-300">arrow_outward</span>
          </a>

          {pr ? (
            <div className="flex items-center gap-3 text-xs">
              <a
                href={pr.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`group relative flex items-center gap-2 border rounded-2xl font-bold tracking-wide px-5 py-2.5 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 ${getPrBadgeStyle(
                  pr.status
                )}`}
              >
                <span>View PR</span>
                <span className="material-symbols-outlined text-[14px] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform duration-300">arrow_outward</span>
              </a>

              {pr.status === "open" && (
                <button
                  type="button"
                  onClick={() => handleCreatePR(undefined)}
                  disabled={isCreatingPR}
                  className="group relative flex items-center gap-2 bg-primary-fixed text-[#0a0c10] font-bold text-xs rounded-2xl px-6 py-2.5 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {isCreatingPR ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                      <span className="tracking-wide">Pushing...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px] group-hover:-translate-y-0.5 transition-transform duration-300">upload</span>
                      <span className="tracking-wide">Push New Changes</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCreatePR(undefined)}
              disabled={isCreatingPR}
              className="group relative flex items-center gap-2 bg-primary-fixed text-[#0a0c10] font-bold text-xs rounded-2xl px-6 py-2.5 hover:brightness-110 active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none"
            >
              {isCreatingPR ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  <span className="tracking-wide">Creating PR...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px] group-hover:rotate-12 transition-transform duration-300">call_split</span>
                  <span className="tracking-wide">Create Pull Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
