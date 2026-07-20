export function AnalyticsHeader() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 w-full">
      <div>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase mb-2 tracking-tighter">Systems Analytics</h1>
        <div className="flex flex-wrap gap-4">
          <span className="border-2 border-outline px-2 py-1 font-mono-label text-[10px] bg-surface-container-high text-on-surface-variant font-bold">ENV: PRODUCTION</span>
          <span className="border-2 border-outline px-2 py-1 font-mono-label text-[10px] bg-surface-container-high text-on-surface-variant font-bold">REGION: US-EAST-1</span>
          <span className="border-2 border-primary-fixed px-2 py-1 font-mono-label text-[10px] bg-secondary-container/20 text-primary-fixed font-bold">STATUS: OPERATIONAL</span>
        </div>
      </div>
      <div className="flex border-2 border-white bg-surface-container w-full md:w-auto overflow-x-auto">
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs border-r-2 border-white bg-primary-fixed text-on-primary-fixed font-black transition-colors hover:bg-white hover:text-black">1H</button>
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs border-r-2 border-white text-white font-bold hover:bg-surface-container-highest transition-colors">24H</button>
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs border-r-2 border-white text-white font-bold hover:bg-surface-container-highest transition-colors">7D</button>
        <button className="flex-1 md:flex-none px-4 py-2 font-mono-label text-xs text-white font-bold hover:bg-surface-container-highest transition-colors">CUSTOM</button>
      </div>
    </div>
  );
}
