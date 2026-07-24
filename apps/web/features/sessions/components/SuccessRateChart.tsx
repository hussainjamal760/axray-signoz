"use client";
import {
  AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis, CartesianGrid, ReferenceLine,
} from "recharts";
import { DailyBucket } from "@/features/sessions/hooks/useAnalytics";

interface Props { dailyBuckets: DailyBucket[]; isLoading?: boolean; }

const TOOLTIP_STYLE = {
  backgroundColor: "#0d0e08",
  border: "3px solid #dcee00",
  borderRadius: "0px",
  fontFamily: "JetBrains Mono",
  fontSize: "12px",
  fontWeight: "bold",
  boxShadow: "6px 6px 0px 0px rgba(220,238,0,0.4)",
};

export function SuccessRateChart({ dailyBuckets, isLoading }: Props) {
  const hasData = dailyBuckets.length > 0;
  const maxSuccess = hasData ? Math.max(...dailyBuckets.map(d => d.success)) : 0;

  return (
    <div 
      className="col-span-12 lg:col-span-8 bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl p-6 border border-outline-variant/30 shadow-sm relative overflow-hidden group"
    >
      {/* Neon grid background */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: "linear-gradient(#dcee00 1px, transparent 1px), linear-gradient(90deg, #dcee00 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary-fixed text-lg">show_chart</span>
              <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Success vs Failure</h3>
            </div>
            <p className="font-mono-label text-xs text-on-surface-variant font-bold">
              {hasData ? `${dailyBuckets.length} day trend · OpenTelemetry traces` : "Run the agent to see trend data"}
            </p>
          </div>
          <div className="flex gap-4 shrink-0">
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 border-2 border-outline">
              <span className="w-3 h-3 bg-primary-fixed shadow-[0_0_8px_#dcee00]"></span>
              <span className="font-mono-label text-[10px] uppercase font-bold text-white">Success</span>
            </div>
            <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 border-2 border-outline">
              <span className="w-3 h-3 bg-error shadow-[0_0_8px_#ef4444]"></span>
              <span className="font-mono-label text-[10px] uppercase font-bold text-white">Failure</span>
            </div>
          </div>
        </div>

        {/* Big number highlight */}
        {hasData && (
          <div className="flex gap-6 mb-6">
            <div>
              <div className="font-mono-label text-[10px] text-on-surface-variant font-bold uppercase mb-1">Peak Success</div>
              <div className="text-3xl font-black text-primary-fixed" style={{ textShadow: "0 0 20px rgba(220,238,0,0.5)" }}>
                {maxSuccess}
              </div>
            </div>
            <div>
              <div className="font-mono-label text-[10px] text-on-surface-variant font-bold uppercase mb-1">Total Runs</div>
              <div className="text-3xl font-black text-white">
                {dailyBuckets.reduce((s, d) => s + d.total, 0)}
              </div>
            </div>
          </div>
        )}

        <div className="h-52 w-full">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-[3px] border-primary-fixed border-t-transparent animate-spin" />
              <span className="font-mono-label text-xs text-outline uppercase font-bold">Querying SigNoz ClickHouse...</span>
            </div>
          ) : !hasData ? (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-outline text-5xl">rocket_launch</span>
              <span className="font-mono-label text-xs text-outline uppercase font-bold">Start your first run!</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyBuckets} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradSuccessV2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#dcee00" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#dcee00" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradFailedV2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0.02} />
                  </linearGradient>
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
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#8a8a6e", fontFamily: "JetBrains Mono", fontSize: 10, fontWeight: "bold" }}
                />
                <Tooltip
                  cursor={{ stroke: "rgba(220,238,0,0.3)", strokeWidth: 1, strokeDasharray: "4 4" }}
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ textTransform: "uppercase" }}
                  labelStyle={{ color: "#ffffff", marginBottom: "6px", fontSize: "11px" }}
                />
                <Area
                  type="monotone"
                  dataKey="success"
                  name="Success"
                  stroke="#dcee00"
                  strokeWidth={3}
                  fill="url(#gradSuccessV2)"
                  dot={{ fill: "#0d0e08", stroke: "#dcee00", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 7, fill: "#0d0e08", stroke: "#dcee00", strokeWidth: 3 }}
                />
                <Area
                  type="monotone"
                  dataKey="failed"
                  name="Failed"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#gradFailedV2)"
                  dot={{ fill: "#0d0e08", stroke: "#ef4444", strokeWidth: 2, r: 3 }}
                  activeDot={{ r: 6, fill: "#0d0e08", stroke: "#ef4444", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
