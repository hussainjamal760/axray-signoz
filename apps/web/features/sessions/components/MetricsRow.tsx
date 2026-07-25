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

function StatCard({ label, value, sub, subColor = "text-primary-fixed", hoverBorder = "hover:border-primary-fixed", isLoading }: StatCardProps) {
  return (
    <div className={`border-[3px] border-white p-6 bg-[#0d0e08] brutalist-shadow transition-all ${hoverBorder} hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none cursor-default relative overflow-hidden`}>
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#dcee00 1px, transparent 1px), linear-gradient(90deg, #dcee00 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }} />
      <p className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-4 font-bold relative z-10">{label}</p>
      <p className={`text-4xl font-black text-white relative z-10 ${isLoading ? "animate-pulse opacity-40" : ""}`}
        style={!isLoading && value !== "-" ? { textShadow: "0 0 20px rgba(220,238,0,0.3)" } : {}}>
        {isLoading ? "---" : value}
      </p>
      <p className={`font-mono-label text-[10px] mt-2 font-bold relative z-10 ${subColor}`}>{sub}</p>
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

