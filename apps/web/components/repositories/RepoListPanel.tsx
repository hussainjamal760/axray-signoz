export function RepoListPanel() {
  return (
    <section className="w-full md:w-2/5 border-r-[3px] border-outline-variant bg-surface-container-lowest flex flex-col overflow-y-auto custom-scrollbar shrink-0" data-lenis-prevent="true">
      <div className="p-6 border-b-2 border-outline-variant bg-surface-container-low flex justify-between items-end sticky top-0 z-10">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Active Repos</h2>
          <p className="text-xs font-mono-label text-outline uppercase tracking-widest">Showing 12 repositories</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 border-2 border-outline text-outline hover:text-white hover:border-white transition-all">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>
      <div className="flex flex-col">
        {/* Active Card */}
        <div className="p-6 border-b-2 border-outline-variant bg-surface-container-high border-l-8 border-l-primary-fixed transition-all cursor-pointer">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-black text-primary-fixed tracking-tight">auth-test</h3>
            <span className="px-2 py-0.5 bg-primary-fixed text-on-primary-fixed text-[10px] font-black border-2 border-black uppercase tracking-tighter">Connected</span>
          </div>
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2 font-mono-label text-sm text-on-surface">
              <span className="material-symbols-outlined text-sm">person</span> hussain / main
            </div>
            <div className="flex items-center gap-2 font-mono-label text-xs text-outline">
              <span className="material-symbols-outlined text-sm">schedule</span> Last Session: 2 hours ago
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-primary-fixed text-on-primary-fixed font-black py-2 border-2 border-black brutalist-shadow-sm text-xs uppercase tracking-tighter hover:-translate-x-1 hover:-translate-y-1 hover:shadow-none transition-all">Open</button>
            <button className="flex-1 bg-surface border-2 border-outline text-white font-black py-2 text-xs uppercase tracking-tighter hover:bg-surface-container-high transition-all">Run Agent</button>
            <button className="p-2 border-2 border-outline text-outline hover:text-white transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
        
        {/* Inactive Card 1 */}
        <div className="p-6 border-b-2 border-outline-variant hover:bg-surface-container transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-black text-on-surface group-hover:text-white tracking-tight transition-colors">ui-core-v2</h3>
            <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant text-[10px] font-black border-2 border-outline uppercase tracking-tighter">Standby</span>
          </div>
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2 font-mono-label text-sm text-outline">
              <span className="material-symbols-outlined text-sm">person</span> systems-admin / staging
            </div>
            <div className="flex items-center gap-2 font-mono-label text-xs text-outline">
              <span className="material-symbols-outlined text-sm">schedule</span> Last Session: 3 days ago
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-surface border-2 border-outline text-outline font-black py-2 text-xs uppercase tracking-tighter hover:border-white hover:text-white transition-all">Connect</button>
            <button className="p-2 border-2 border-outline text-outline hover:text-white transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
        
        {/* Inactive Card 2 */}
        <div className="p-6 border-b-2 border-outline-variant hover:bg-surface-container transition-all cursor-pointer group">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-2xl font-black text-on-surface group-hover:text-white tracking-tight transition-colors">data-engine</h3>
            <span className="px-2 py-0.5 bg-outline-variant text-on-surface-variant text-[10px] font-black border-2 border-outline uppercase tracking-tighter">Standby</span>
          </div>
          <div className="flex flex-col gap-1 mb-6">
            <div className="flex items-center gap-2 font-mono-label text-sm text-outline">
              <span className="material-symbols-outlined text-sm">person</span> data-ops / production
            </div>
            <div className="flex items-center gap-2 font-mono-label text-xs text-outline">
              <span className="material-symbols-outlined text-sm">schedule</span> Last Session: 1 week ago
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-surface border-2 border-outline text-outline font-black py-2 text-xs uppercase tracking-tighter hover:border-white hover:text-white transition-all">Connect</button>
            <button className="p-2 border-2 border-outline text-outline hover:text-white transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
