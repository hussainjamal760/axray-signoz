"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from 'recharts';

const toolsData = [
  { name: 'read_file', calls: 4892 },
  { name: 'write_file', calls: 3201 },
  { name: 'run_tests', calls: 2550 },
  { name: 'list_dir', calls: 1822 }
];

export function ToolsUsageChart() {
  return (
    <div className="col-span-12 lg:col-span-6 border-[3px] border-white bg-surface-container p-6 brutalist-shadow flex flex-col">
      <h3 className="font-black text-2xl uppercase text-white mb-6 tracking-tighter">Most Used Tools</h3>
      
      <div className="flex-1 w-full relative -ml-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={toolsData} layout="vertical" margin={{ top: 0, right: 20, left: 40, bottom: 0 }}>
            <XAxis type="number" hide domain={[0, 5000]} />
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
              formatter={(value: number) => [`${value} calls`, 'Usage']}
              itemStyle={{ color: '#dcee00' }}
            />
            <Bar dataKey="calls" barSize={32} fill="#dcee00">
              {toolsData.map((entry, index) => {
                // Different opacity based on index to mimic the original design
                const opacity = 1 - (index * 0.2);
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`rgba(220, 238, 0, ${opacity})`} 
                    stroke="#dcee00"
                    strokeWidth={2}
                    className="hover:fill-white cursor-pointer transition-colors" 
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
