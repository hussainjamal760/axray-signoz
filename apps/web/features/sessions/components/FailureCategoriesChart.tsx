"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';
import { FailureCategory } from "@/features/sessions/hooks/useAnalytics";

interface FailureCategoriesChartProps {
  categories: FailureCategory[];
  isLoading?: boolean;
}

const COLORS = ['#dcee00', '#c8d000', '#b4b800', '#a0a000', '#8c8800', '#787000', '#646000', '#504800'];

export function FailureCategoriesChart({ categories, isLoading }: FailureCategoriesChartProps) {
  const hasData = categories.length > 0;

  return (
    <div className="col-span-12 lg:col-span-4 border-[3px] border-white bg-surface-container p-6 brutalist-shadow flex flex-col min-h-[320px]">
      <h3 className="font-black text-2xl uppercase text-white mb-1 tracking-tighter">Failure Causes</h3>
      <p className="font-mono-label text-xs text-on-surface-variant font-bold mb-6">What breaks most often</p>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="font-mono-label text-xs text-outline animate-pulse uppercase font-bold">Loading...</span>
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <span className="material-symbols-outlined text-emerald-400 text-4xl">check_circle</span>
          <span className="font-mono-label text-xs text-emerald-400 uppercase font-bold text-center">No failures — great job!</span>
        </div>
      ) : (
        <div className="flex-1 w-full relative -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categories} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
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
                formatter={(value: number) => [`${value} runs`, 'Count']}
                itemStyle={{ color: '#dcee00' }}
              />
              <Bar dataKey="count" barSize={16} radius={[0, 4, 4, 0]}>
                {categories.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

