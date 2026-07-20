"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const failureData = [
  { name: 'Logic Drift', value: 32 },
  { name: 'API Limit', value: 28 },
  { name: 'Syntax Error', value: 22 },
  { name: 'Timeout', value: 18 }
];

export function FailureCategoriesChart() {
  return (
    <div className="col-span-12 lg:col-span-4 border-[3px] border-white bg-surface-container p-6 brutalist-shadow flex flex-col">
      <h3 className="font-black text-2xl uppercase text-white mb-6 tracking-tighter">Failure Categories</h3>
      
      <div className="flex-1 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={failureData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 40]} />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 12, fontWeight: 'bold' }} 
              width={100}
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
                boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' 
              }}
              formatter={(value: number) => [`${value}%`, 'Frequency']}
              itemStyle={{ color: '#dcee00' }}
            />
            <Bar dataKey="value" barSize={16} radius={[0, 4, 4, 0]}>
              {failureData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="#dcee00" className="hover:fill-white transition-colors cursor-pointer" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
