"use client";
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis } from 'recharts';

const successData = [
  { date: 'Oct 15', success: 70 },
  { date: 'Oct 16', success: 75 },
  { date: 'Oct 17', success: 65 },
  { date: 'Oct 18', success: 85 },
  { date: 'Oct 19', success: 80 },
  { date: 'Oct 20', success: 92 },
  { date: 'Oct 21', success: 88 },
  { date: 'Oct 22', success: 70 },
  { date: 'Oct 23', success: 75 },
  { date: 'Oct 24', success: 92.4 },
  { date: 'Oct 25', success: 85 },
  { date: 'Oct 26', success: 80 },
  { date: 'Oct 27', success: 92 },
  { date: 'Oct 28', success: 88 },
  { date: 'Oct 29', success: 70 }
];

export function SuccessRateChart() {
  return (
    <div className="col-span-12 lg:col-span-8 border-[3px] border-white bg-surface-container p-6 brutalist-shadow relative" style={{ backgroundImage: 'radial-gradient(#353628 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
      <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h3 className="font-black text-2xl uppercase text-white tracking-tighter">Agent Success Rate</h3>
          <p className="font-mono-label text-xs text-on-surface-variant font-bold mt-1">Last 30 Days Execution Reliability</p>
        </div>
        <div className="flex gap-4">
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
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={successData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dcee00" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#dcee00" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2, strokeDasharray: '4 4' }}
              contentStyle={{ 
                backgroundColor: '#131408', 
                border: '3px solid white', 
                borderRadius: '0px', 
                fontFamily: 'JetBrains Mono', 
                fontSize: '12px', 
                fontWeight: 'bold', 
                boxShadow: '4px 4px 0px 0px rgba(220,238,0,1)' 
              }}
              itemStyle={{ color: '#dcee00', textTransform: 'uppercase' }}
              labelStyle={{ color: '#ffffff', marginBottom: '8px' }}
            />
            <Area 
              type="step" 
              dataKey="success" 
              stroke="#dcee00" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSuccess)" 
              activeDot={{ r: 6, fill: '#131408', stroke: '#dcee00', strokeWidth: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
