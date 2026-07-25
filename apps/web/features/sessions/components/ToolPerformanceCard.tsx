import { useToolPerformance } from "../hooks/useToolPerformance";

export interface ToolPerformanceCardProps {
  sessionId: string;
}

export function ToolPerformanceCard({ sessionId }: ToolPerformanceCardProps) {
  const { data: tools, isLoading, error } = useToolPerformance(sessionId);

  if (isLoading) {
    return (
      <div className="h-full w-full border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow flex flex-col justify-center items-center relative overflow-hidden">
        <div className="animate-spin w-8 h-8 border-4 border-primary-fixed border-t-transparent rounded-full mb-4"></div>
        <div className="font-mono-label uppercase text-xs font-bold text-on-surface-variant tracking-widest">
          Analyzing Telemetry...
        </div>
      </div>
    );
  }

  if (error || !tools) {
    return (
      <div className="h-full w-full border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow flex flex-col justify-center items-center relative overflow-hidden">
        <span className="material-symbols-outlined text-error text-3xl mb-2">warning</span>
        <div className="font-mono-label uppercase text-xs font-bold text-error tracking-widest">
          Failed to load telemetry
        </div>
      </div>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="h-full w-full border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow flex flex-col justify-center items-center text-center relative overflow-hidden">
        <span className="material-symbols-outlined text-on-surface-variant text-4xl mb-3">query_stats</span>
        <h3 className="font-mono-label font-bold uppercase text-white mb-2">No Tool Telemetry</h3>
        <p className="text-sm text-on-surface-variant max-w-[200px]">
          Start executing agent runs to see tool performance bottlenecks here.
        </p>
      </div>
    );
  }

  const maxAvgMs = Math.max(...tools.map(t => t.avgDurationMs), 1);

  return (
    <div className="h-full w-full border-[3px] border-white bg-[#0d0e08] p-6 brutalist-shadow flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: "linear-gradient(#dcee00 1px, transparent 1px), linear-gradient(90deg, #dcee00 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }} />

      <div className="relative z-10 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-1 shrink-0">
          <span className="material-symbols-outlined text-primary-fixed text-lg">speed</span>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter shrink-0">
            Performance
          </h3>
        </div>
        <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-6 shrink-0">
          Average execution time per tool across this session.
        </p>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {tools.map((tool, idx) => {
          const percentage = Math.min((tool.avgDurationMs / maxAvgMs) * 100, 100);
          
          let colorClass = "bg-green-400";
          let borderClass = "border-green-500";
          
          if (tool.avgDurationMs > 10000) {
            colorClass = "bg-red-500";
            borderClass = "border-red-600";
          } else if (tool.avgDurationMs > 2000) {
            colorClass = "bg-yellow-400";
            borderClass = "border-yellow-500";
          }

          const seconds = (tool.avgDurationMs / 1000).toFixed(1);

          return (
            <div key={tool.toolName} className="group reveal-text" style={{ animationDelay: `${idx * 0.05}s` }}>
              <div className="flex justify-between items-end mb-1">
                <span className="font-mono-label font-bold text-xs text-on-surface truncate pr-2">
                  {tool.toolName}
                </span>
                <span className="font-mono text-xs text-on-surface-variant whitespace-nowrap">
                  {seconds}s <span className="opacity-50 text-[10px]">({tool.executionCount}x)</span>
                </span>
              </div>
              <div className="h-4 bg-background border-2 border-outline w-full overflow-hidden flex items-stretch">
                <div 
                  className={`${colorClass} ${borderClass} border-r-2 h-full transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.max(percentage, 2)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
}
