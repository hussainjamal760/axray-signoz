"use client";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis, CartesianGrid, Legend } from 'recharts';
import { DailyBucket } from "@/features/sessions/hooks/useAnalytics";

interface SuccessRateChartProps {
  dailyBuckets: DailyBucket[];
  isLoading?: boolean;
}

const tooltipStyle = {
  backgroundColor: '#131408',
  border: '3px solid white',
  borderRadius: '0px',
  fontFamily: 'JetBrains Mono',
  fontSize: '12px',
  fontWeight: 'bold',
  boxShadow: '4px 4px 0px 0px rgba(220,238,0,1)',
};

export function SuccessRateChart({ dailyBuckets, isLoading }: SuccessRateChartProps) {
  const hasData = dailyBuckets.length > 0;

  return (
    <div
      className="col-span-12 lg:col-span-8 border-[3px] border-white bg-surface-container p-6 brutalist-shadow relative"
      style={{ backgroundImage: 'radial-gradient(#353628 1px, transparent 1px)', backgroundSize: '16px 16px' }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Success vs Failure</h3>
          <p className="font-mono-label text-xs text-on-surface-variant font-bold mt-1">
            {hasData ? `Last ${dailyBuckets.length} days of executions` : 'Run the agent to see data'}
          </p>
        </div>
        <div className="flex gap-4 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-primary-fixed border border-white"></span>
            <span className="font-mono-label text-[10px] uppercase font-bold text-white">Success</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-error border border-white"></span>
            <span className="font-mono-label text-[10px] uppercase font-bold text-white">Failure</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full relative z-10">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <span className="font-mono-label text-xs text-outline animate-pulse uppercase font-bold">Querying SigNoz...</span>
          </div>
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center gap-3">
            <span className="material-symbols-outlined text-outline text-4xl">show_chart</span>
            <span className="font-mono-label text-xs text-outline uppercase font-bold">No data yet — start a run!</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gradSuccess" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dcee00" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#dcee00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }}
              />
              <Tooltip
                cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
                contentStyle={tooltipStyle}
                itemStyle={{ color: '#dcee00', textTransform: 'uppercase' }}
                labelStyle={{ color: '#ffffff', marginBottom: '8px' }}
              />
              <Area type="monotone" dataKey="success" name="Success" stroke="#dcee00" strokeWidth={3} fillOpacity={1} fill="url(#gradSuccess)" activeDot={{ r: 6, fill: '#131408', stroke: '#dcee00', strokeWidth: 3 }} />
              <Area type="monotone" dataKey="failed" name="Failed" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#gradFailed)" activeDot={{ r: 5, fill: '#131408', stroke: '#ef4444', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

