import { AgentRunSummary } from "@/features/agent-runs/types";

export interface StatsModuleProps {
  activeRun?: AgentRunSummary | null;
}

export function StatsModule({ activeRun }: StatsModuleProps) {
  const durationStr = activeRun?.durationMs ? `${(activeRun.durationMs / 1000).toFixed(1)}s` : "-";
  const tokensStr = activeRun?.tokensUsed ? `${activeRun.tokensUsed.toLocaleString()}` : "-";

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-surface-container border-[3px] border-background p-4">
        <div className="font-mono-label uppercase text-[10px] font-bold text-on-surface-variant mb-1">Execution Time</div>
        <div className="text-xl font-black uppercase text-on-surface">{durationStr}</div>
      </div>
      <div className="bg-surface-container border-[3px] border-background p-4">
        <div className="font-mono-label uppercase text-[10px] font-bold text-on-surface-variant mb-1">Tokens Used</div>
        <div className="text-xl font-black uppercase text-on-surface">{tokensStr}</div>
      </div>
    </div>
  );
}
