"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Cell } from 'recharts';
import { DailyBucket } from "@/features/sessions/hooks/useAnalytics";

interface CostOverTimeChartProps {
  dailyBuckets: DailyBucket[];
  isLoading?: boolean;
}

export function CostOverTimeChart({ dailyBuckets, isLoading }: CostOverTimeChartProps) {
  const hasData = dailyBuckets.length > 0;
  const maxCost = hasData ? Math.max(...dailyBuckets.map(d => d.cost)) : 0;

  return (
    <div
      className="col-span-12 lg:col-span-6 border-[3px] border-white bg-surface-container p-6 brutalist-shadow"
      style={{ backgroundImage: 'radial-gradient(#353628 1px, transparent 1px)', backgroundSize: '16px 16px' }}
    >
      <h3 className="font-black text-2xl uppercase text-white mb-1 tracking-tighter">Cost Over Time</h3>
      <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-6">
        {hasData ? `$${dailyBuckets.reduce((s, d) => s + d.cost, 0).toFixed(4)} total` : 'Cost per day'}
      </p>

      <div className="h-48 w-full mt-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <span className="font-mono-label text-xs text-outline animate-pulse uppercase font-bold">Querying...</span>
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-outline text-4xl">payments</span>
            <span className="font-mono-label text-xs text-outline uppercase font-bold">No cost data yet</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyBuckets} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
                interval="preserveStartEnd"
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
                tickFormatter={(v) => `$${v.toFixed(3)}`}
                width={55}
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
                formatter={(value: number) => [`$${value.toFixed(4)}`, 'Cost']}
                itemStyle={{ color: '#dcee00' }}
              />
              <Bar dataKey="cost" barSize={32}>
                {dailyBuckets.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.cost === maxCost ? '#dcee00' : 'rgba(200, 200, 171, 0.2)'}
                    className="hover:fill-primary-fixed transition-colors cursor-pointer"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}


