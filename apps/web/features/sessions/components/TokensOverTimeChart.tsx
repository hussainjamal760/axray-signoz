"use client";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { DailyBucket } from "@/features/sessions/hooks/useAnalytics";

interface TokensOverTimeChartProps {
  dailyBuckets: DailyBucket[];
  isLoading?: boolean;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export function TokensOverTimeChart({ dailyBuckets, isLoading }: TokensOverTimeChartProps) {
  const hasData = dailyBuckets.length > 0;
  const totalTokens = hasData ? dailyBuckets.reduce((s, d) => s + d.tokens, 0) : 0;
  const avgTokens = hasData ? Math.round(totalTokens / dailyBuckets.length) : 0;

  return (
    <div
      className="col-span-12 lg:col-span-6 border-[3px] border-white bg-surface-container p-6 brutalist-shadow"
      style={{ backgroundImage: 'radial-gradient(#353628 1px, transparent 1px)', backgroundSize: '16px 16px' }}
    >
      <h3 className="font-black text-2xl uppercase text-white mb-1 tracking-tighter">Tokens Over Time</h3>
      <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-6">
        {hasData ? `${formatTokens(totalTokens)} total · avg ${formatTokens(avgTokens)}/day` : 'LLM tokens consumed per day'}
      </p>

      <div className="h-48 w-full mt-4">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <span className="font-mono-label text-xs text-outline animate-pulse uppercase font-bold">Querying...</span>
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-outline text-4xl">memory</span>
            <span className="font-mono-label text-xs text-outline uppercase font-bold">No token data yet</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyBuckets} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
                interval="preserveStartEnd"
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
                tickFormatter={formatTokens}
                width={45}
              />
              {avgTokens > 0 && (
                <ReferenceLine
                  y={avgTokens}
                  stroke="rgba(220,238,0,0.3)"
                  strokeDasharray="6 3"
                  label={{ value: 'AVG', fill: '#dcee00', fontFamily: 'JetBrains Mono', fontSize: 9, fontWeight: 'bold' }}
                />
              )}
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
                contentStyle={{
                  backgroundColor: '#131408',
                  border: '3px solid white',
                  borderRadius: '0px',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)',
                }}
                formatter={(value: number) => [formatTokens(value), 'Tokens']}
                itemStyle={{ color: '#dcee00' }}
                labelStyle={{ color: '#ffffff', marginBottom: '6px' }}
              />
              <Line
                type="monotone"
                dataKey="tokens"
                stroke="#dcee00"
                strokeWidth={3}
                dot={{ fill: '#131408', stroke: '#dcee00', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, fill: '#131408', stroke: '#dcee00', strokeWidth: 3 }}
                isAnimationActive
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
