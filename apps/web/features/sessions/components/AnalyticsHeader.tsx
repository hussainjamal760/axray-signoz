import { AnalyticsMetrics } from "@/features/sessions/hooks/useAnalytics";
import { AgentRunSummary } from "@/features/agent-runs/types";

interface AnalyticsHeaderProps {
  session?: any;
  metrics: AnalyticsMetrics;
  isLoading?: boolean;
  runs: AgentRunSummary[];
  selectedRunId: string;
  onSelectRun: (id: string) => void;
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
  session, metrics, isLoading, runs, selectedRunId, onSelectRun,
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
            <span className="material-symbols-outlined text-primary-fixed text-2xl">analytics</span>
            <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Analytics
              {session?.repositoryFullName && (
                <span className="text-outline text-2xl ml-3 font-black">
                  / {session.repositoryFullName.split("/")[1]}
                </span>
              )}
            </h1>
          </div>
          <div className="flex flex-wrap gap-3">
            <span className="border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 px-2 py-1 font-mono-label text-[10px] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
              SIGNOZ CLICKHOUSE
            </span>
            <span className="border-2 border-outline px-2 py-1 font-mono-label text-[10px] bg-surface-container-high text-on-surface-variant font-bold">
              {isLoading ? "..." : `${metrics.totalRuns} RUNS`}
            </span>
            <span className="border-2 border-outline px-2 py-1 font-mono-label text-[10px] bg-surface-container-high text-on-surface-variant font-bold">
              LAST: {isLoading ? "..." : lastRunTime}
            </span>
          </div>
        </div>
      </div>

      {/* Run Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b-[3px] border-outline pb-4">
        {/* ALL button */}
        <button
          onClick={() => onSelectRun("all")}
          className={`px-4 py-2 font-mono-label text-xs font-black uppercase border-[3px] transition-all ${
            selectedRunId === "all"
              ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed brutalist-shadow"
              : "border-outline text-on-surface-variant bg-surface hover:border-white hover:text-white"
          }`}
        >
          All Runs ({runs.length})
        </button>

        {/* Individual run buttons */}
        {runs.slice(0, 12).map((run, idx) => {
          const isSelected = selectedRunId === run.id;
          const statusClass = statusColors[run.status] || "bg-outline text-black";
          const shortPrompt = (run.prompt || "").slice(0, 22) + ((run.prompt || "").length > 22 ? "…" : "");

          return (
            <button
              key={run.id}
              onClick={() => onSelectRun(run.id)}
              title={run.prompt}
              className={`px-3 py-2 font-mono-label text-[10px] font-black uppercase border-[3px] transition-all flex items-center gap-2 ${
                isSelected
                  ? "bg-surface-container text-white border-white brutalist-shadow"
                  : "border-outline text-on-surface-variant bg-surface hover:border-white hover:text-white"
              }`}
            >
              <span className={`text-[9px] px-1.5 py-0.5 font-black ${statusClass}`}>
                #{idx + 1}
              </span>
              <span className="hidden sm:inline">{shortPrompt || `Run ${idx + 1}`}</span>
            </button>
          );
        })}

        {runs.length > 12 && (
          <span className="px-3 py-2 font-mono-label text-[10px] text-on-surface-variant font-bold self-center">
            +{runs.length - 12} more
          </span>
        )}
      </div>
    </div>
  );
}
