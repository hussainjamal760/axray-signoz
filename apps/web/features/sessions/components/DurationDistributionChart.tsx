"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, CartesianGrid } from "recharts";
import { useMemo } from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";

interface Props { runs: AgentRunSummary[]; isLoading?: boolean; }

const BUCKETS = [
  { label: "<10s",  min: 0,        max: 10_000,   color: "#dcee00", glow: "rgba(220,238,0,0.6)" },
  { label: "10-30s", min: 10_000,  max: 30_000,   color: "#b8c800", glow: "rgba(184,200,0,0.5)" },
  { label: "30-60s", min: 30_000,  max: 60_000,   color: "#94a200", glow: "rgba(148,162,0,0.4)" },
  { label: "1-3m",  min: 60_000,   max: 180_000,  color: "#708400", glow: "rgba(112,132,0,0.3)" },
  { label: "3-10m", min: 180_000,  max: 600_000,  color: "#ef9a00", glow: "rgba(239,154,0,0.4)" },
  { label: ">10m",  min: 600_000,  max: Infinity, color: "#ef4444", glow: "rgba(239,68,68,0.5)" },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#0d0e08",
  border: "3px solid #dcee00",
  borderRadius: "0px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
  fontWeight: "bold",
  boxShadow: "6px 6px 0px 0px rgba(220,238,0,0.3)",
};

export function DurationDistributionChart({ runs, isLoading }: Props) {
  const data = useMemo(() => BUCKETS.map(b => ({
    label: b.label,
    count: runs.filter(r => r.durationMs !== undefined && r.durationMs >= b.min && r.durationMs < b.max).length,
    color: b.color,
    glow: b.glow,
  })), [runs]);

  const hasData = runs.some(r => r.durationMs !== undefined);
  const topBucket = hasData ? data.reduce((a, b) => b.count > a.count ? b : a, data[0]) : null;

  const renderChartArea = () => {
    if (isLoading) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-[3px] border-primary-fixed border-t-transparent animate-spin" />
          <span className="font-mono-label text-xs text-outline uppercase font-bold">Loading...</span>
        </div>
      );
    }

    if (!hasData) {
      return (
        <div className="h-full flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-outline text-5xl">speed</span>
          <span className="font-mono-label text-xs text-outline uppercase font-bold">No duration data</span>
        </div>
      );
    }

    return (
    return (
      <ResponsiveContainer width="100%" height="100%" minHeight={160}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
          <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8a8a6e", fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: "bold" }}
            dy={8}
          />
          <YAxis
            allowDecimals={false}
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#8a8a6e", fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: "bold" }}
          />
          <Tooltip
            cursor={{ fill: "rgba(220,238,0,0.04)" }}
            contentStyle={TOOLTIP_STYLE}
            formatter={(value: number, _: string, props: any) => [`${value} runs`, props.payload.label]}
            itemStyle={{ color: "#dcee00" }}
            labelFormatter={() => "Duration"}
          />
          <Bar dataKey="count" barSize={32} radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                opacity={entry.count === 0 ? 0.15 : 1}
                style={entry.count > 0 ? { filter: `drop-shadow(0 0 6px ${entry.glow})` } : {}}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="h-full w-full border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#dcee00 1px, transparent 1px), linear-gradient(90deg, #dcee00 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-fixed text-lg">speed</span>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Run Speed</h3>
        </div>
        <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-4">
          How fast runs complete · {runs.length} total
        </p>

        {topBucket && topBucket.count > 0 && (
          <div className="flex gap-4 mb-4">
            <div>
              <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Most Common</div>
              <div className="text-xl font-black" style={{ color: topBucket.color, textShadow: `0 0 12px ${topBucket.glow}` }}>
                {topBucket.label}
              </div>
            </div>
            <div>
              <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Count</div>
              <div className="text-xl font-black text-white">{topBucket.count} runs</div>
            </div>
          </div>
        )}

        <div className="flex-1 min-h-[160px] relative w-full mt-2">
          {renderChartArea()}
        </div>
      </div>
    </div>
  );
}
