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
    <div className="bg-primary-fixed border-[3px] border-background brutalist-shadow p-6 reveal-text" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-mono-label text-on-primary-fixed uppercase font-black text-xs mb-4 tracking-widest flex items-center gap-2">
        <span className="material-symbols-outlined text-base">auto_fix</span>
        Recommended Solution
      </h3>
      <p className="text-2xl md:text-3xl font-black text-on-primary-fixed leading-tight mb-8">
        "{fixText}"
      </p>
    </div>
  );
}
