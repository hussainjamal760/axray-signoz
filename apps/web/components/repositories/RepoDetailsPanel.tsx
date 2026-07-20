"use client";
import { BarChart, Bar, ResponsiveContainer, Tooltip } from 'recharts';

const activityData = [
  { time: '00:00', events: 40 },
  { time: '02:00', events: 65 },
  { time: '04:00', events: 50 },
  { time: '06:00', events: 85 },
  { time: '08:00', events: 45 },
  { time: '10:00', events: 95 },
  { time: '12:00', events: 70 },
  { time: '14:00', events: 60 },
  { time: '16:00', events: 80 },
  { time: '18:00', events: 55 },
  { time: '20:00', events: 90 },
  { time: '22:00', events: 75 }
];

export function RepoDetailsPanel() {
  return (
    <section className="flex-1 bg-background p-8 overflow-y-auto relative custom-scrollbar shrink-0 min-w-0" data-lenis-prevent="true">
      <div className="relative z-10 max-w-4xl mx-auto flex flex-col gap-8">
        {/* Detail Header */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <h1 className="text-5xl font-black text-primary-fixed tracking-tighter uppercase leading-none">auth-test</h1>
              <span className="material-symbols-outlined text-4xl text-primary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            </div>
            <p className="font-mono-label text-outline uppercase tracking-widest flex items-center gap-2 text-xs">
              <span className="w-2 h-2 bg-primary-fixed rounded-full animate-pulse"></span>
              Currently connected to Cloud-A1 Instance
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-2 w-full md:w-auto">
            <label className="font-mono-label text-[10px] text-outline uppercase font-black">Active Branch</label>
            <div className="flex items-center gap-2 p-2 border-[3px] border-outline bg-surface-container-high w-full md:w-auto">
              <span className="material-symbols-outlined text-primary-fixed">account_tree</span>
              <select className="bg-transparent border-none text-white font-black text-sm uppercase p-0 pr-4 focus:ring-0">
                <option>main</option>
                <option>development</option>
                <option>feature/oauth-fix</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Permission Matrix */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="border-[3px] border-outline p-6 bg-surface-container relative">
            <div className="absolute -top-3 left-4 px-2 bg-background border-2 border-outline font-mono-label text-[10px] uppercase font-black text-outline">Security Scope</div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase">Agent Permissions</h3>
            <div className="flex flex-col gap-4">
              <label className="flex items-center justify-between p-3 border-2 border-outline-variant hover:border-white transition-all group cursor-pointer">
                <span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors uppercase">Read files</span>
                <div className="w-6 h-6 border-2 border-primary-fixed flex items-center justify-center">
                  <input defaultChecked className="hidden peer" type="checkbox"/>
                  <span className="material-symbols-outlined text-primary-fixed text-lg hidden peer-checked:block">check</span>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 border-2 border-outline-variant hover:border-white transition-all group cursor-pointer">
                <span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors uppercase">Modify files</span>
                <div className="w-6 h-6 border-2 border-primary-fixed flex items-center justify-center">
                  <input defaultChecked className="hidden peer" type="checkbox"/>
                  <span className="material-symbols-outlined text-primary-fixed text-lg hidden peer-checked:block">check</span>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 border-2 border-outline-variant hover:border-white transition-all group cursor-pointer">
                <span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors uppercase">Run tests</span>
                <div className="w-6 h-6 border-2 border-primary-fixed flex items-center justify-center">
                  <input defaultChecked className="hidden peer" type="checkbox"/>
                  <span className="material-symbols-outlined text-primary-fixed text-lg hidden peer-checked:block">check</span>
                </div>
              </label>
              <label className="flex items-center justify-between p-3 border-2 border-outline-variant hover:border-white transition-all group cursor-pointer">
                <span className="font-bold text-sm text-on-surface group-hover:text-white transition-colors uppercase">Create PR</span>
                <div className="w-6 h-6 border-2 border-primary-fixed flex items-center justify-center">
                  <input defaultChecked className="hidden peer" type="checkbox"/>
                  <span className="material-symbols-outlined text-primary-fixed text-lg hidden peer-checked:block">check</span>
                </div>
              </label>
            </div>
          </div>
          
          <div className="border-[3px] border-outline p-6 bg-surface-container relative">
            <div className="absolute -top-3 left-4 px-2 bg-background border-2 border-outline font-mono-label text-[10px] uppercase font-black text-outline">System Stats</div>
            <h3 className="text-2xl font-black text-white mb-4 uppercase">Repository Health</h3>
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono-label text-outline uppercase font-bold">Integrity Index</span>
                  <span className="text-3xl font-black text-primary-fixed">98.4%</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-mono-label text-outline uppercase font-bold">Build Status</span>
                  <span className="px-2 py-1 bg-primary-fixed text-on-primary-fixed font-black text-xs border-2 border-black uppercase tracking-tighter mt-1">Success</span>
                </div>
              </div>
              <div className="w-full h-24 border-2 border-outline-variant bg-surface relative overflow-hidden flex items-end justify-between p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={activityData}>
                    <Tooltip 
                      cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                      contentStyle={{ 
                        backgroundColor: '#131408', 
                        border: '2px solid #919378', 
                        borderRadius: '0px', 
                        fontFamily: 'JetBrains Mono', 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)' 
                      }}
                      itemStyle={{ color: '#dcee00' }}
                      labelStyle={{ color: '#c8c8ab' }}
                    />
                    <Bar dataKey="events" fill="#dcee00" activeBar={{ fill: '#ffffff' }} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] font-mono-label text-outline uppercase font-bold">Activity Pulse (Last 24h)</p>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 bg-primary-fixed text-on-primary-fixed font-black py-4 border-[3px] border-black brutalist-shadow hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all uppercase tracking-tight flex items-center justify-center gap-3">
            <span className="material-symbols-outlined font-black">bolt</span>
            Initiate Autonomous Agent
          </button>
          <button className="px-8 py-4 border-[3px] border-outline text-white font-black uppercase tracking-tight hover:bg-surface-container-high transition-all flex items-center justify-center gap-3">
            <span className="material-symbols-outlined">sync</span>
            Resync Source
          </button>
        </div>
        
        {/* Code Preview Mock */}
        <div className="border-[3px] border-outline bg-surface-container-lowest p-1 mb-8">
          <div className="flex items-center gap-2 p-2 border-b-2 border-outline-variant bg-surface-container-high">
            <div className="w-3 h-3 border-2 border-outline-variant"></div>
            <span className="font-mono-label text-xs text-outline tracking-tight font-bold">src / services / auth_agent.py</span>
          </div>
          <div className="p-4 font-mono-label text-xs text-on-surface-variant overflow-x-auto whitespace-pre custom-scrollbar">
            <span className="text-secondary-fixed">import</span> os<br/>
            <span className="text-secondary-fixed">from</span> black_box <span className="text-secondary-fixed">import</span> AgentCore<br/><br/>
            <span className="text-outline"># Initialize security layers</span><br/>
            agent = AgentCore(repo_id=<span className="text-primary-fixed">"auth-test"</span>)<br/><br/>
            <span className="text-secondary-fixed">def</span> <span className="text-white font-bold">verify_deployment</span>():<br/>
            {"    "}<span className="text-outline">"""Validates current main branch status"""</span><br/>
            {"    "}status = agent.run_scan(scope=<span className="text-primary-fixed">"full"</span>)<br/>
            {"    "}<span className="text-secondary-fixed">return</span> status.integrity_index
          </div>
        </div>
      </div>
    </section>
  );
}
