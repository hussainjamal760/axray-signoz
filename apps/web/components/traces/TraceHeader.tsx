export function TraceHeader() {
  return (
    <div className="w-full bg-surface-container border-b-[3px] border-primary-fixed px-8 py-6 shrink-0">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-primary-fixed mb-1 uppercase tracking-tight">Trace Explorer</h1>
          <p className="font-mono-label text-on-surface-variant uppercase text-sm">
            Analyzing session: <span className="text-white">abb-uuid-772-x1</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-grow xl:flex-grow-0">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-on-surface-variant">search</span>
            <input 
              className="bg-background border-2 border-primary-fixed text-white font-mono-label pl-10 pr-4 py-2 w-full xl:w-64 focus:ring-0 focus:outline-none focus:bg-surface-container-high transition-colors" 
              placeholder="Search traces..." 
              type="text" 
            />
          </div>
          <select className="bg-background border-2 border-primary-fixed text-white font-mono-label px-4 py-2 focus:ring-0 focus:outline-none uppercase">
            <option>Repository: ALL</option>
            <option>auth-test</option>
            <option>core-api</option>
          </select>
          <select className="bg-background border-2 border-primary-fixed text-white font-mono-label px-4 py-2 focus:ring-0 focus:outline-none uppercase">
            <option>Status: Any</option>
            <option>Success</option>
            <option>Failed</option>
          </select>
          <select className="bg-background border-2 border-primary-fixed text-white font-mono-label px-4 py-2 focus:ring-0 focus:outline-none uppercase">
            <option>Duration: 500ms+</option>
            <option>1s+</option>
            <option>5s+</option>
          </select>
        </div>
      </div>
    </div>
  );
}
