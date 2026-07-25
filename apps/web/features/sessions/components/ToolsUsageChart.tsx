"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

interface ToolEntry {
  name: string;
  calls: number;
}

interface ToolsUsageChartProps {
  toolsData: ToolEntry[];
  isLoading?: boolean;
}

const COLORS = ['#dcee00', '#c8d000', '#b4b800', '#a0a000', '#8c8800', '#787000', '#646000', '#504800'];

export function ToolsUsageChart({ toolsData, isLoading }: ToolsUsageChartProps) {
  const hasData = toolsData.length > 0;

  return (
    <div className="col-span-12 lg:col-span-6 border-[3px] border-white bg-surface-container p-6 brutalist-shadow flex flex-col min-h-[320px]">
      <h3 className="font-black text-2xl uppercase text-white mb-1 tracking-tighter">Most Used Tools</h3>
      <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-6">
        From last 10 runs · SigNoz spans
      </p>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono-label text-xs text-outline animate-pulse uppercase font-bold">Querying OpenTelemetry spans...</span>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-outline text-4xl">build</span>
          <span className="font-mono-label text-xs text-outline uppercase font-bold text-center">No tool calls traced yet</span>
        </div>
      ) : (
        <div className="flex-1 w-full relative -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={toolsData} layout="vertical" margin={{ top: 0, right: 30, left: 30, bottom: 0 }}>
              <XAxis type="number" hide domain={[0, 'dataMax + 1']} />
              <YAxis
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 11, fontWeight: 'bold' }}
                width={110}
              />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{
                  backgroundColor: '#131408',
                  border: '3px solid white',
                  borderRadius: '0px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
                formatter={(value: number) => [`${value} calls`, 'Usage']}
                itemStyle={{ color: '#dcee00' }}
              />
              <Bar dataKey="calls" barSize={20} radius={[0, 4, 4, 0]}>
                {toolsData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    className="cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
