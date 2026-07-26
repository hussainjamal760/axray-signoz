"use client";

import React, { useMemo } from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";
import { LiveSocketEvent } from "../hooks/useSessionSocket";
import { classifyRunError } from "@/features/agent-runs/lib/run-error-utils";

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
  const configuredMaxTurns = 80;

  const category = useMemo(() => {
    return classifyRunError(run?.status, run?.errorMessage || latestEvent?.description);
  }, [run?.status, run?.errorMessage, latestEvent?.description]);

  const errorMessage = useMemo(() => {
    if (category === 'incomplete') {
      return `Agent execution reached the maximum limit of ${configuredMaxTurns} turns without naturally terminating. Work accomplished up to this turn has been recorded.`;
    }
    return (
      run?.errorMessage ||
      latestEvent?.description ||
      latestEvent?.title ||
      "Agent execution encountered an unhandled error during execution."
    );
  }, [run, latestEvent, category]);

  const details = useMemo(() => {
    if (category === 'incomplete') {
      return {
        title: `Agent Reached Max Turn Limit (${configuredMaxTurns} Turns)`,
        pill: "MAX TURNS REACHED",
        solution: "The agent reached the maximum allowed execution steps without finishing the task. You can continue this session with a follow-up run.",
        isWarning: true,
        icon: "warning",
      };
    }
    if (category === 'token_limit_413') {
      return {
        title: "Groq Token Limit Exceeded (HTTP 413)",
        pill: "TOKEN / PAYLOAD LIMIT",
        solution: "Prompt context or repository files exceeded Groq model context limits.",
        isWarning: false,
        icon: "error",
      };
    }
    if (category === 'rate_limit_429') {
      return {
        title: "Groq Rate Limit (HTTP 429)",
        pill: "API QUOTA EXCEEDED",
        solution: "Groq API Daily/Minute token quota reached. The agent automatically retries with backoff, or you can wait for quota reset.",
        isWarning: false,
        icon: "error",
      };
    }

    const msg = errorMessage.toLowerCase();
    let solution = "Review the error trace in SigNoz, refine your prompt instructions, and click 'Retry Task' to rerun.";
    if (msg.includes("package.json") || msg.includes("enoent")) {
      solution = "Project files may be located inside a subfolder (e.g. nodeServer-main). Try adding 'Look inside subfolder nodeServer-main' to your prompt.";
    } else if (msg.includes("tool_use_failed") || msg.includes("output_parse")) {
      solution = "LLM generated invalid tool syntax. The self-correction engine will attempt alternative formatting on retry.";
    }

    return {
      title: "Run Execution Failed",
      pill: "EXIT_CODE_ERROR",
      solution,
      isWarning: false,
      icon: "error",
    };
  }, [category, errorMessage]);

  const signozUrl = "http://localhost:8080/logs/logs-explorer";
  const isWarning = details.isWarning;
  const borderColor = isWarning ? "border-amber-500/30" : "border-rose-500/30";
  const headerBg = isWarning ? "bg-amber-500/10" : "bg-rose-500/10";
  const headerBorder = isWarning ? "border-amber-500/30" : "border-rose-500/30";
  const headerText = isWarning ? "text-amber-400" : "text-rose-400";
  const pillBg = isWarning ? "bg-amber-500/10 text-amber-400 border-amber-500/30" : "bg-rose-500/10 text-rose-400 border-rose-500/30";
  const codeBorder = isWarning ? "border-amber-500/20 text-amber-300" : "border-rose-500/20 text-rose-300";
  const codeHeader = isWarning ? "text-amber-400 border-amber-500/20" : "text-rose-400 border-rose-500/20";
  const btnBg = isWarning ? "bg-amber-500 hover:bg-amber-600 text-black" : "bg-rose-500 hover:bg-rose-600 text-white";

  return (
    <div className={`w-full bg-surface-container-lowest border ${borderColor} rounded-3xl p-6 flex flex-col gap-5 font-sans shadow-sm animate-fadeIn`}>
      {/* 1. Header & Status Pill */}
      <div className={`flex flex-wrap items-center justify-between gap-4 border-b ${isWarning ? 'border-amber-500/20' : 'border-rose-500/20'} pb-4`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl ${headerBg} border ${headerBorder} ${headerText} flex items-center justify-center font-semibold`}>
            <span className="material-symbols-outlined text-xl">{details.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-on-surface">
              {details.title}
            </h3>
            <p className={`text-xs ${headerText} font-medium`}>
              SigNoz OTLP Telemetry Captured • Service: axray-agent
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`border px-3 py-1 rounded-full text-xs font-semibold ${pillBg}`}>
            {details.pill}
          </span>
        </div>
      </div>

      {/* 2. Error Message / Summary Output */}
      <div className={`bg-[#0d1117] border ${codeBorder} rounded-2xl p-4 text-xs font-mono leading-relaxed overflow-x-auto max-h-40 custom-scrollbar`}>
        <div className={`flex items-center justify-between mb-2 text-[10px] ${codeHeader} font-semibold border-b pb-1`}>
          <span>{isWarning ? "Run Execution Summary" : "Captured Exception Payload"}</span>
          <span>Span Status: {isWarning ? "INCOMPLETE" : "ERROR"}</span>
        </div>
        <pre className="whitespace-pre-wrap break-all text-xs">{errorMessage}</pre>
      </div>

      {/* 3. AI Recovery & Suggested Solution */}
      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
          <span className="material-symbols-outlined text-base">psychology</span>
          <span>AI Execution Guidance</span>
        </div>
        <p className="text-xs text-emerald-300 leading-relaxed font-normal">
          {details.solution}
        </p>
      </div>

      {/* 4. Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <a
          href={signozUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-surface-container border border-outline-variant/30 px-4 py-2.5 rounded-xl text-xs font-medium text-on-surface hover:bg-surface-container-high transition-all active:scale-[0.98]"
        >
          <span className="material-symbols-outlined text-sm text-primary-fixed">monitoring</span>
          <span>View Traces in SigNoz</span>
          <span className="material-symbols-outlined text-xs text-on-surface-variant">open_in_new</span>
        </a>

        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`flex items-center gap-2 ${btnBg} px-6 py-2.5 rounded-xl text-xs font-semibold active:scale-[0.98] transition-all shadow-sm`}
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
            <span>{isWarning ? "Continue Session Run" : "Retry Run Execution"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
