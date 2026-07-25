"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts";

interface ToolEntry { name: string; calls: number; }
interface Props { toolsData: ToolEntry[]; isLoading?: boolean; }

const NEON_SHADES = ["#dcee00", "#c4d400", "#acba00", "#94a000", "#7c8600", "#646c00", "#4c5200", "#343800"];

const TOOLTIP_STYLE = {
  backgroundColor: "#0d0e08",
  border: "3px solid #dcee00",
  borderRadius: "0px",
  fontFamily: "JetBrains Mono",
  fontSize: "11px",
  fontWeight: "bold",
  boxShadow: "6px 6px 0px 0px rgba(220,238,0,0.3)",
};

export function ToolsUsageChart({ toolsData, isLoading }: Props) {
  const hasData = toolsData.length > 0;
  const totalCalls = hasData ? toolsData.reduce((s, t) => s + t.calls, 0) : 0;

  return (
    <div className="col-span-12 lg:col-span-6 border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#dcee00 1px, transparent 1px), linear-gradient(90deg, #dcee00 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-primary-fixed text-lg">build</span>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Tools Used</h3>
        </div>
        <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-1">
          {hasData ? `${totalCalls} total calls · SigNoz OpenTelemetry spans` : "From last 10 runs · SigNoz spans"}
        </p>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-[3px] border-primary-fixed border-t-transparent animate-spin" />
            <span className="font-mono-label text-xs text-outline uppercase font-bold">Querying spans...</span>
          </div>
        ) : !hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 mt-6">
            <span className="material-symbols-outlined text-outline text-5xl">handyman</span>
            <span className="font-mono-label text-xs text-outline uppercase font-bold text-center">No tool calls traced</span>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {toolsData.map((tool, i) => {
              const pct = Math.round((tool.calls / toolsData[0].calls) * 100);
              const color = NEON_SHADES[i % NEON_SHADES.length];
              return (
                <div key={tool.name}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-label text-[10px] font-black text-on-surface-variant px-1.5 py-0.5 border border-outline-variant bg-surface-container">
                        #{i + 1}
                      </span>
                      <span className="font-mono-label text-xs font-bold text-on-surface uppercase">{tool.name}</span>
                    </div>
                    <span className="font-mono-label text-xs font-black" style={{ color }}>{tool.calls} calls</span>
                  </div>
                  <div className="h-2.5 bg-surface-container w-full">
                    <div
                      className="h-full transition-all duration-700 ease-out"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                        boxShadow: `0 0 10px ${color}80`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
