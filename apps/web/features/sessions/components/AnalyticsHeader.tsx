import { AnalyticsMetrics } from "@/features/sessions/hooks/useAnalytics";
import { AgentRunSummary } from "@/features/agent-runs/types";

interface AnalyticsHeaderProps {
  session?: any;
  metrics: AnalyticsMetrics;
  isLoading?: boolean;
}

const statusColors: Record<string, string> = {
  completed: "bg-emerald-400 text-black",
  failed: "bg-error text-black",
  running: "bg-primary-fixed text-black animate-pulse",
  cancelled: "bg-outline text-black",
  pending: "bg-yellow-400 text-black",
  queued: "bg-yellow-400 text-black",
};

function shortLabel(run: AgentRunSummary, index: number): string {
  const prompt = run.prompt || "";
  const short = prompt.length > 28 ? prompt.slice(0, 28) + "…" : prompt;
  return `RUN ${index + 1}: ${short}`;
}

export function AnalyticsHeader({
  session, metrics, isLoading
}: AnalyticsHeaderProps) {
  const lastRunTime = metrics.lastRunAt
    ? new Date(metrics.lastRunAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "No runs yet";

  return (
    <div className="flex flex-col gap-6 mb-8 w-full">
      {/* Title Row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-primary-fixed text-2xl drop-shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.6)]">analytics</span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Session Analytics
              {session?.repositoryFullName && (
                <span className="text-on-surface-variant font-medium ml-3">
                  / {session.repositoryFullName.split("/")[1]}
                </span>
              )}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 tracking-wider uppercase shadow-sm">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"></span>
              ClickHouse Active
            </span>
            <span className="border border-outline-variant/20 px-3 py-1 rounded-full text-[10px] bg-surface-container/40 text-on-surface-variant font-bold tracking-wider uppercase shadow-sm">
              {isLoading ? "..." : `${metrics.totalRuns} Runs Indexed`}
            </span>
            <span className="border border-outline-variant/20 px-3 py-1 rounded-full text-[10px] bg-surface-container/40 text-on-surface-variant font-bold tracking-wider uppercase shadow-sm">
              Last Sync: {isLoading ? "..." : lastRunTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
