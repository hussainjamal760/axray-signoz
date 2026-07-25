import { AnalyticsMetrics } from "@/features/sessions/hooks/useAnalytics";

interface AnalyticsHeaderProps {
  session?: any;
  metrics: AnalyticsMetrics;
  isLoading?: boolean;
}

export function AnalyticsHeader({ session, metrics, isLoading }: AnalyticsHeaderProps) {
  const lastRunTime = metrics.lastRunAt
    ? new Date(metrics.lastRunAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "No runs yet";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 w-full">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="material-symbols-outlined text-primary-fixed">analytics</span>
          <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            Analytics
            {session?.repositoryFullName && (
              <span className="text-outline text-2xl ml-3 font-black">/ {session.repositoryFullName.split("/")[1]}</span>
            )}
          </h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="border-2 border-emerald-500/40 bg-emerald-500/10 text-emerald-400 px-2 py-1 font-mono-label text-[10px] font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            SIGNOZ CLICKHOUSE
          </span>
          <span className="border-2 border-outline px-2 py-1 font-mono-label text-[10px] bg-surface-container-high text-on-surface-variant font-bold">
            {isLoading ? "..." : `${metrics.totalRuns} TOTAL RUNS`}
          </span>
          <span className="border-2 border-outline px-2 py-1 font-mono-label text-[10px] bg-surface-container-high text-on-surface-variant font-bold">
            LAST RUN: {isLoading ? "..." : lastRunTime}
          </span>
        </div>
      </div>

      <div className="flex border-2 border-white bg-surface-container w-full md:w-auto overflow-x-auto shrink-0">
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs border-r-2 border-white bg-primary-fixed text-on-primary-fixed font-black transition-colors hover:bg-white hover:text-black">ALL</button>
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs border-r-2 border-white text-white font-bold hover:bg-surface-container-highest transition-colors">7D</button>
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs border-r-2 border-white text-white font-bold hover:bg-surface-container-highest transition-colors">30D</button>
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs text-white font-bold hover:bg-surface-container-highest transition-colors">CUSTOM</button>
      </div>
    </div>
  );
}

