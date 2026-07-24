"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, LabelList } from "recharts";
import { FailureCategory } from "@/features/sessions/hooks/useAnalytics";

interface Props { categories: FailureCategory[]; isLoading?: boolean; }

const GRADIENT_COLORS = [
  { fill: "#dcee00", glow: "rgba(220,238,0,0.6)" },
  { fill: "#b8c800", glow: "rgba(184,200,0,0.5)" },
  { fill: "#94a200", glow: "rgba(148,162,0,0.4)" },
  { fill: "#707c00", glow: "rgba(112,124,0,0.3)" },
  { fill: "#4c5600", glow: "rgba(76,86,0,0.3)" },
];

const TOOLTIP_STYLE = {
  backgroundColor: "#0d0e08",
  border: "3px solid #dcee00",
  borderRadius: "0px",
  fontFamily: "JetBrains Mono",
  fontSize: "12px",
  fontWeight: "bold",
  boxShadow: "6px 6px 0px 0px rgba(220,238,0,0.4)",
};

export function FailureCategoriesChart({ categories, isLoading }: Props) {
  const hasData = categories.length > 0;
  const total = categories.reduce((s, c) => s + c.count, 0);

  return (
    <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl p-6 border border-outline-variant/30 shadow-sm flex flex-col relative overflow-hidden group">
      {/* Subtle Glow */}
      <div className="absolute w-40 h-40 rounded-full blur-3xl -bottom-10 -right-10 pointer-events-none transition-all duration-700 bg-rose-500/5 group-hover:bg-rose-500/10"></div>

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-error text-lg">bug_report</span>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Failure Causes</h3>
        </div>
        <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-5">
          {hasData ? `${total} total failures parsed` : "What breaks most often"}
        </p>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-[3px] border-error border-t-transparent animate-spin" />
            <span className="font-mono-label text-xs text-outline uppercase font-bold">Parsing errors...</span>
          </div>
        ) : !hasData ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-emerald-400 text-5xl" style={{ textShadow: "0 0 20px rgba(52,211,153,0.5)" }}>check_circle</span>
            <span className="font-mono-label text-xs text-emerald-400 uppercase font-bold text-center">Zero failures!</span>
            <span className="font-mono-label text-[9px] text-on-surface-variant uppercase font-bold text-center">All runs completed successfully</span>
          </div>
        ) : (
          <>
            {/* Legend-style category list */}
            <div className="space-y-3 mb-4">
              {categories.slice(0, 5).map((cat, i) => {
                const pct = Math.round((cat.count / total) * 100);
                const color = GRADIENT_COLORS[i % GRADIENT_COLORS.length];
                return (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono-label text-[11px] font-bold text-on-surface-variant uppercase">{cat.name}</span>
                      <span className="font-mono-label text-[11px] font-black" style={{ color: color.fill }}>{cat.count} runs</span>
                    </div>
                    <div className="h-2 bg-surface-container-high w-full">
                      <div
                        className="h-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: color.fill,
                          boxShadow: `0 0 8px ${color.glow}`,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Donut-style total */}
            <div className="mt-auto pt-4 border-t-2 border-outline-variant flex items-center justify-between">
              <span className="font-mono-label text-[10px] text-on-surface-variant font-bold uppercase">Most Common</span>
              <span className="font-mono-label text-xs font-black text-error uppercase">{categories[0]?.name}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
