"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell, CartesianGrid } from 'recharts';
import { useMemo } from 'react';
import { AgentRunSummary } from "@/features/agent-runs/types";

interface DurationDistributionChartProps {
  runs: AgentRunSummary[];
  isLoading?: boolean;
}

// Buckets: <10s, 10-30s, 30-60s, 1-3m, 3-10m, 10m+
const BUCKETS = [
  { label: '<10s',  min: 0,       max: 10_000 },
  { label: '10-30s', min: 10_000,  max: 30_000 },
  { label: '30-60s', min: 30_000,  max: 60_000 },
  { label: '1-3m',  min: 60_000,  max: 180_000 },
  { label: '3-10m', min: 180_000, max: 600_000 },
  { label: '10m+',  min: 600_000, max: Infinity },
];

const BUCKET_COLORS = ['#dcee00', '#c0d400', '#a4ba00', '#88a000', '#6c8600', '#506c00'];

export function DurationDistributionChart({ runs, isLoading }: DurationDistributionChartProps) {
  const data = useMemo(() => {
    return BUCKETS.map((b, i) => ({
      label: b.label,
      count: runs.filter(r => r.durationMs !== undefined && r.durationMs >= b.min && r.durationMs < b.max).length,
      color: BUCKET_COLORS[i],
    }));
  }, [runs]);

  const hasData = runs.some(r => r.durationMs !== undefined);

  return (
    <div className="col-span-12 lg:col-span-6 border-[3px] border-white bg-surface-container p-6 brutalist-shadow flex flex-col min-h-[320px]">
      <h3 className="font-black text-2xl uppercase text-white mb-1 tracking-tighter">Run Speed</h3>
      <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-6">How fast your runs complete</p>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono-label text-xs text-outline animate-pulse uppercase font-bold">Querying...</span>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-outline text-4xl">speed</span>
          <span className="font-mono-label text-xs text-outline uppercase font-bold">No duration data yet</span>
        </div>
      ) : (
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
                dy={8}
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
                label={{
                  value: 'runs',
                  angle: -90,
                  position: 'insideLeft',
                  fill: '#c8c8ab',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 9,
                  fontWeight: 'bold',
                  dx: -4,
                }}
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
                  boxShadow: '4px 4px 0px 0px rgba(220,238,0,1)',
                }}
                formatter={(value: number, _: string, props: any) => [`${value} runs`, props.payload.label]}
                itemStyle={{ color: '#dcee00' }}
                labelFormatter={() => 'Duration'}
              />
              <Bar dataKey="count" barSize={36} radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
