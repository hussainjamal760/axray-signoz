import { AnalyticsMetrics } from "@/features/sessions/hooks/useAnalytics";

interface MetricsRowProps {
  metrics: AnalyticsMetrics;
  isLoading?: boolean;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatCost(n: number): string {
  if (n === 0) return "$0.00";
  if (n < 0.01) return `$${(n * 100).toFixed(2)}¢`;
  return `$${n.toFixed(3)}`;
}

interface StatCardProps {
  label: string;
  value: string;
  sub: string;
  subColor?: string;
  hoverBorder?: string;
  isLoading?: boolean;
}

function StatCard({ label, value, sub, subColor = "text-primary-fixed", hoverBorder = "hover:border-primary-fixed/50", isLoading }: StatCardProps) {
  return (
    <div className={`bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl p-6 border border-outline-variant/30 shadow-sm transition-all duration-300 ${hoverBorder} hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] cursor-default relative overflow-hidden group`}>
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
        backgroundSize: "20px 20px",
      }} />
      {/* Subtle Glow */}
      <div className="absolute w-32 h-32 rounded-full blur-3xl -top-10 -right-10 pointer-events-none transition-all duration-700 bg-primary-fixed/5 group-hover:bg-primary-fixed/10"></div>

      <p className="font-mono text-[11px] text-on-surface-variant uppercase mb-4 font-bold tracking-wider relative z-10">{label}</p>
      <p className={`text-3xl font-black text-white relative z-10 tracking-tight ${isLoading ? "animate-pulse opacity-40" : ""}`}>
        {isLoading ? "---" : value}
      </p>
      <p className={`font-mono text-[10px] mt-2 font-semibold relative z-10 uppercase tracking-widest ${subColor}`}>{sub}</p>
    </div>
  );
}


export function MetricsRow({ metrics, isLoading }: MetricsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 w-full">
      <StatCard
        label="Total Runs"
        value={String(metrics.totalRuns)}
        sub={`${metrics.successCount} COMPLETED`}
        isLoading={isLoading}
      />
      <StatCard
        label="Success Rate"
        value={`${metrics.successRate}%`}
        sub={`${metrics.successCount} SUCCESSFUL`}
        isLoading={isLoading}
      />
      <StatCard
        label="Failed Runs"
        value={String(metrics.failedCount)}
        sub={`${metrics.totalRuns > 0 ? (100 - metrics.successRate) : 0}% FAILURE RATE`}
        subColor="text-error"
        hoverBorder="hover:border-error"
        isLoading={isLoading}
      />
      <StatCard
        label="Avg Duration"
        value={metrics.avgDurationLabel}
        sub="PER EXECUTION"
        isLoading={isLoading}
      />
      <StatCard
        label="Total Tokens"
        value={formatTokens(metrics.totalTokens)}
        sub={`AVG ${formatTokens(metrics.avgTokens)}/RUN`}
        isLoading={isLoading}
      />
    </div>
  );
}

