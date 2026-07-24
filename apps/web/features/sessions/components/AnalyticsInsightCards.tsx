import { AnalyticsMetrics } from "@/features/sessions/hooks/useAnalytics";

interface AnalyticsInsightCardsProps {
  metrics: AnalyticsMetrics;
  isLoading?: boolean;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  if (n === 0) return "0";
  return String(n);
}

export function AnalyticsInsightCards({ metrics, isLoading }: AnalyticsInsightCardsProps) {
  const pulse = isLoading ? "animate-pulse opacity-40" : "";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 w-full">

      {/* Avg Duration */}
      <div className="bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 p-6 shadow-sm hover:border-primary-fixed/50 hover:-translate-y-1 hover:shadow-lg group transition-all cursor-default">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-white group-hover:text-primary-fixed transition-colors">speed</span>
          <span className={`font-mono-label text-[10px] px-2 py-0.5 font-black ${
            metrics.avgDurationMs > 180_000 ? 'bg-error text-black' :
            metrics.avgDurationMs > 60_000 ? 'bg-yellow-400 text-black' :
            'bg-primary-fixed text-on-primary-fixed'
          }`}>
            {metrics.avgDurationMs > 180_000 ? 'SLOW' : metrics.avgDurationMs > 60_000 ? 'MODERATE' : 'FAST'}
          </span>
        </div>
        <h4 className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Avg Run Duration</h4>
        <p className={`text-3xl font-black text-white ${pulse}`}>{isLoading ? "---" : metrics.avgDurationLabel}</p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant pt-2 font-bold">
          ACROSS {metrics.totalRuns} RUNS
        </p>
      </div>

      {/* Avg tokens */}
      <div className="bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 p-6 shadow-sm hover:border-primary-fixed/50 hover:-translate-y-1 hover:shadow-lg group transition-all cursor-default">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-white group-hover:text-primary-fixed transition-colors">memory</span>
          <span className="font-mono-label text-[10px] bg-secondary-container text-white font-black px-2 py-0.5 border border-white">OPENTELEMETRY</span>
        </div>
        <h4 className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Avg Tokens / Run</h4>
        <p className={`text-3xl font-black text-white ${pulse}`}>{isLoading ? "---" : formatTokens(metrics.avgTokens)}</p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant pt-2 font-bold">
          {formatTokens(metrics.totalTokens)} TOTAL CONSUMED
        </p>
      </div>

      {/* Most common failure */}
      <div className="bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 p-6 shadow-sm hover:border-error/50 hover:-translate-y-1 hover:shadow-lg group transition-all cursor-default">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-error">warning</span>
          <span className={`font-mono-label text-[10px] font-black px-2 py-0.5 ${metrics.failedCount > 0 ? 'bg-error text-black' : 'bg-emerald-400 text-black'}`}>
            {metrics.failedCount > 0 ? 'ALERT' : 'HEALTHY'}
          </span>
        </div>
        <h4 className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Top Failure Cause</h4>
        <p className={`text-2xl font-black text-white group-hover:text-error transition-colors ${pulse}`}>
          {isLoading ? "---" : metrics.mostCommonFailure}
        </p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant pt-2 font-bold">
          {metrics.failedCount > 0
            ? `${metrics.failedCount} FAILED OUT OF ${metrics.totalRuns}`
            : 'NO FAILURES DETECTED'}
        </p>
      </div>

    </div>
  );
}
