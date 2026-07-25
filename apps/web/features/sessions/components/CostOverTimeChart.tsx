"use client";
import {
  ComposedChart, Bar, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell,
} from "recharts";
import { DailyBucket } from "@/features/sessions/hooks/useAnalytics";

interface Props { dailyBuckets: DailyBucket[]; isLoading?: boolean; }

const TOOLTIP_STYLE = {
  backgroundColor: "#0d0e08",
  border: "3px solid #dcee00",
  borderRadius: "0px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
  fontWeight: "bold",
  boxShadow: "6px 6px 0px 0px rgba(220,238,0,0.3)",
};

export function CostOverTimeChart({ dailyBuckets, isLoading }: Props) {
  const hasData = dailyBuckets.length > 0;
  const totalCost = hasData ? dailyBuckets.reduce((s, d) => s + d.cost, 0) : 0;
  const maxCost = hasData ? Math.max(...dailyBuckets.map(d => d.cost)) : 0;
  const maxIdx = hasData ? dailyBuckets.findIndex(d => d.cost === maxCost) : -1;

  return (
    <div
      className="col-span-12 lg:col-span-6 border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#dcee00 1px, transparent 1px), linear-gradient(90deg, #dcee00 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-fixed text-lg">payments</span>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Cost Over Time</h3>
        </div>

        {/* Stats row */}
        <div className="flex gap-6 mb-5">
          <div>
            <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Total Spent</div>
            <div className="text-2xl font-black text-primary-fixed" style={{ textShadow: "0 0 16px rgba(220,238,0,0.4)" }}>
              ${totalCost.toFixed(4)}
            </div>
          </div>
          {maxCost > 0 && (
            <div>
              <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Peak Day</div>
              <div className="text-2xl font-black text-white">${maxCost.toFixed(4)}</div>
            </div>
          )}
        </div>

        <div className="h-52 w-full">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-[3px] border-primary-fixed border-t-transparent animate-spin" />
              <span className="font-mono-label text-xs text-outline uppercase font-bold">Querying...</span>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-outline text-5xl">payments</span>
              <span className="font-mono-label text-xs text-outline uppercase font-bold">No cost data yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={dailyBuckets} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dcee00" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#8a8a00" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8a8a6e", fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: "bold" }}
                  interval="preserveStartEnd"
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8a8a6e", fontFamily: "JetBrains Mono", fontSize: 9, fontWeight: "bold" }}
                  tickFormatter={(v) => `$${v.toFixed(3)}`}
                  width={58}
                />
                <Tooltip
                  cursor={{ fill: "rgba(220,238,0,0.05)" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number) => [`$${value.toFixed(5)}`, "Cost"]}
                  itemStyle={{ color: "#dcee00" }}
                  labelStyle={{ color: "#fff", marginBottom: "4px" }}
                />
                <Bar dataKey="cost" barSize={28} radius={[4, 4, 0, 0]}>
                  {dailyBuckets.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={index === maxIdx ? "url(#barGradCost)" : "rgba(220, 238, 0, 0.18)"}
                      stroke={index === maxIdx ? "#dcee00" : "transparent"}
                      strokeWidth={index === maxIdx ? 2 : 0}
                      style={index === maxIdx ? { filter: "drop-shadow(0 0 8px rgba(220,238,0,0.5))" } : {}}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
