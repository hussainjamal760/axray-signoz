"use client";
import {
  LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine,
} from "recharts";
import { DailyBucket } from "@/features/sessions/hooks/useAnalytics";

interface Props { dailyBuckets: DailyBucket[]; isLoading?: boolean; }

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

const TOOLTIP_STYLE = {
  backgroundColor: "#0d0e08",
  border: "3px solid #dcee00",
  borderRadius: "0px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
  fontWeight: "bold",
  boxShadow: "6px 6px 0px 0px rgba(220,238,0,0.3)",
};

export function TokensOverTimeChart({ dailyBuckets, isLoading }: Props) {
  const hasData = dailyBuckets.length > 0;
  const total = hasData ? dailyBuckets.reduce((s, d) => s + d.tokens, 0) : 0;
  const avg = hasData ? Math.round(total / dailyBuckets.length) : 0;
  const peak = hasData ? Math.max(...dailyBuckets.map(d => d.tokens)) : 0;

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
          <span className="material-symbols-outlined text-primary-fixed text-lg">memory</span>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Tokens Used</h3>
        </div>

        <div className="flex gap-6 mb-5">
          <div>
            <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Total</div>
            <div className="text-2xl font-black text-primary-fixed" style={{ textShadow: "0 0 16px rgba(220,238,0,0.4)" }}>
              {fmt(total)}
            </div>
          </div>
          {avg > 0 && (
            <div>
              <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Avg / Day</div>
              <div className="text-2xl font-black text-white">{fmt(avg)}</div>
            </div>
          )}
          {peak > 0 && (
            <div>
              <div className="font-mono-label text-[9px] text-on-surface-variant font-bold uppercase mb-0.5">Peak</div>
              <div className="text-2xl font-black text-white">{fmt(peak)}</div>
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
              <span className="material-symbols-outlined text-outline text-5xl">memory</span>
              <span className="font-mono-label text-xs text-outline uppercase font-bold">No token data yet</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyBuckets} margin={{ top: 5, right: 10, left: 5, bottom: 0 }}>
                <defs>
                  <filter id="glowLine">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <CartesianGrid strokeDasharray="6 6" stroke="rgba(255,255,255,0.04)" />
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
                  tickFormatter={fmt}
                  width={45}
                />
                {avg > 0 && (
                  <ReferenceLine
                    y={avg}
                    stroke="rgba(220,238,0,0.25)"
                    strokeDasharray="8 4"
                    label={{ value: "AVG", position: "insideTopRight", fill: "#8a8a6e", fontFamily: "JetBrains Mono", fontSize: 8, fontWeight: "bold" }}
                  />
                )}
                <Tooltip
                  cursor={{ stroke: "rgba(220,238,0,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={TOOLTIP_STYLE}
                  formatter={(value: number) => [fmt(value), "Tokens"]}
                  itemStyle={{ color: "#dcee00" }}
                  labelStyle={{ color: "#fff", marginBottom: "4px" }}
                />
                <Line
                  type="monotone"
                  dataKey="tokens"
                  stroke="#dcee00"
                  strokeWidth={3}
                  dot={{ fill: "#0d0e08", stroke: "#dcee00", strokeWidth: 2, r: 5 }}
                  activeDot={{ r: 8, fill: "#0d0e08", stroke: "#dcee00", strokeWidth: 3, style: { filter: "drop-shadow(0 0 6px #dcee00)" } }}
                  filter="url(#glowLine)"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
