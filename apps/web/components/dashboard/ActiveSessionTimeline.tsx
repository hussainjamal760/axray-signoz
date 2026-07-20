export function ActiveSessionTimeline() {
  return (
    <section className="col-span-12 lg:col-span-5 bg-surface border-[3px] border-outline flex flex-col brutalist-shadow">
      <div className="p-6 border-b-2 border-outline flex justify-between items-center bg-background">
        <div className="flex items-center gap-3">
          <div className="px-2 py-1 bg-outline text-background font-mono-label text-xs font-black">#1024</div>
          <h3 className="text-xl font-black uppercase text-on-surface">Timeline</h3>
        </div>
        <span className="flex items-center gap-2 text-primary-fixed font-black uppercase italic">
          <span className="w-3 h-3 bg-primary-fixed"></span>
          Active
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 space-y-8 relative custom-scrollbar">
        <div className="absolute left-[47px] top-8 bottom-8 w-0.5 bg-outline-variant"></div>
        
        <div className="relative pl-12">
          <div className="absolute left-[-4px] top-1 w-4 h-4 border-2 border-background bg-outline"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-black uppercase text-primary-fixed">Planning</span>
            <span className="font-mono-label text-xs font-bold text-outline">1.2s</span>
          </div>
          <div className="bg-background border-2 border-outline-variant p-3 flex items-center justify-between">
            <span className="font-mono-label text-xs text-on-surface">Analyze workspace structure</span>
            <span className="font-mono-label text-xs font-bold text-primary-fixed">340_TOKENS</span>
          </div>
        </div>
        
        <div className="relative pl-12">
          <div className="absolute left-[-4px] top-1 w-4 h-4 border-2 border-background bg-outline"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-black uppercase text-primary-fixed">Reading</span>
            <span className="font-mono-label text-xs font-bold text-outline">0.8s</span>
          </div>
          <div className="bg-background border-2 border-outline-variant p-3 flex items-center justify-between">
            <span className="font-mono-label text-xs text-on-surface">src/auth/auth.js</span>
            <span className="font-mono-label text-xs font-bold text-primary-fixed">$0.0021</span>
          </div>
        </div>
        
        <div className="relative pl-12">
          <div className="absolute left-[-4px] top-1 w-4 h-4 border-2 border-background bg-primary-fixed"></div>
          <div className="flex justify-between items-start mb-2">
            <span className="font-black uppercase text-primary-fixed">Executing</span>
            <span className="font-mono-label text-xs font-bold text-primary-fixed animate-pulse">Running...</span>
          </div>
          <div className="bg-primary-container/10 border-2 border-primary-fixed p-3 flex items-center justify-between">
            <span className="font-mono-label text-xs text-primary-fixed font-bold">npm run test:auth</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary-fixed"></div>
              <div className="w-2 h-2 bg-primary-fixed opacity-50"></div>
              <div className="w-2 h-2 bg-primary-fixed opacity-20"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
