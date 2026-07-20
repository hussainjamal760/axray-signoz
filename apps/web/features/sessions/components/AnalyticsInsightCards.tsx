export function AnalyticsInsightCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 w-full">
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow hover:border-primary-fixed group transition-all cursor-default">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-white group-hover:text-primary-fixed transition-colors">timer</span>
          <span className="font-mono-label text-[10px] bg-primary-fixed text-on-primary-fixed font-black px-2 py-0.5">HEALTHY</span>
        </div>
        <h4 className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Average Fix Time</h4>
        <p className="text-3xl font-black text-white">4.2m</p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant pt-2 font-bold">AUTOMATED RECOVERY ENGINE ACTIVE</p>
      </div>
      
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow hover:border-primary-fixed group transition-all cursor-default">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-white group-hover:text-primary-fixed transition-colors">token</span>
          <span className="font-mono-label text-[10px] bg-secondary-container text-white font-black px-2 py-0.5 border border-white">OPTIMIZED</span>
        </div>
        <h4 className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Avg Tokens/Session</h4>
        <p className="text-3xl font-black text-white">3.4k</p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant pt-2 font-bold">CONTEXT_WINDOW_EFFICIENCY: 88%</p>
      </div>
      
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow hover:border-error group transition-all cursor-default">
        <div className="flex justify-between items-start mb-4">
          <span className="material-symbols-outlined text-error">warning</span>
          <span className="font-mono-label text-[10px] bg-error text-on-error font-black px-2 py-0.5">ALERT</span>
        </div>
        <h4 className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-1 font-bold">Most Common Failure</h4>
        <p className="text-3xl font-black text-white group-hover:text-error transition-colors">logic_drift</p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 border-t border-outline-variant pt-2 font-bold">32% OF ALL EXECUTION INTERRUPTS</p>
      </div>
    </div>
  );
}
