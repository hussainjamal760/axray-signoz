import { useMemo } from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";

export interface SuggestedFixCardProps {
  activeRun?: AgentRunSummary | null;
}

export function SuggestedFixCard({ activeRun }: SuggestedFixCardProps) {
  const fixText = useMemo(() => {
    const error = activeRun?.errorMessage?.toLowerCase() || "";
    if (error.includes("rate limit") || error.includes("429")) {
      return "Wait for API quota to reset, or implement exponential backoff in the agent.";
    }
    if (error.includes("ENOENT") || error.includes("not found")) {
      return "Verify file paths and directories in the prompt. Ensure the agent is working in the correct root directory.";
    }
    if (error.includes("parse") || error.includes("json")) {
      return "LLM generated invalid syntax. Consider refining the prompt to enforce strict output formats.";
    }
    if (error.includes("timeout")) {
      return "The execution timed out. Try breaking down the task into smaller, sequential steps.";
    }
    return "Review the error trace, refine prompt instructions, and retry the run.";
  }, [activeRun]);

  return (
    <div className="bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/30 p-6 shadow-sm reveal-text relative overflow-hidden group" style={{ animationDelay: '0.3s' }}>
      {/* Subtle Glow */}
      <div className="absolute w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl -top-10 -right-10 pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700"></div>
      
      <div className="relative z-10">
        <h3 className="text-emerald-400 font-bold uppercase text-[11px] mb-4 tracking-widest flex items-center gap-2">
          <span className="material-symbols-outlined text-base">auto_fix</span>
          Recommended Solution
        </h3>
        <p className="text-xl md:text-2xl font-bold text-emerald-300 leading-relaxed mb-2">
          "{fixText}"
        </p>
      </div>
    </div>
  );
}
