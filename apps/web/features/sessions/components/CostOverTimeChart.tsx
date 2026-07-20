"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, Cell } from 'recharts';

const costData = [
  { day: 'MON', cost: 40 },
  { day: 'TUE', cost: 55 },
  { day: 'WED', cost: 45 },
  { day: 'THU', cost: 70 },
  { day: 'FRI', cost: 60 },
  { day: 'SAT', cost: 85 },
  { day: 'SUN', cost: 95 }
];

export function CostOverTimeChart() {
  return (
    <div className="col-span-12 lg:col-span-6 border-[3px] border-white bg-surface-container p-6 brutalist-shadow" style={{ backgroundImage: 'radial-gradient(#353628 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      <h3 className="font-black text-2xl uppercase text-white mb-8 tracking-tighter">Cost Over Time</h3>
      
      <div className="h-48 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={costData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#c8c8ab', fontFamily: 'JetBrains Mono', fontSize: 10, fontWeight: 'bold' }} 
              dy={10}
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
              formatter={(value: number) => [`$${value}`, 'Cost']}
              itemStyle={{ color: '#dcee00' }}
            />
            <Bar dataKey="cost" barSize={32}>
              {costData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 6 ? '#dcee00' : 'rgba(200, 200, 171, 0.2)'} 
                  className="hover:fill-primary-fixed transition-colors cursor-pointer" 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
