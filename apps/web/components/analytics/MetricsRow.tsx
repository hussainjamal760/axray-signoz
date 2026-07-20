export function MetricsRow() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8 w-full">
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none hover:border-primary-fixed cursor-default">
        <p className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-4 font-bold">Total Sessions</p>
        <p className="text-4xl font-black text-white">12,402</p>
        <p className="font-mono-label text-[10px] text-primary-fixed mt-2 font-bold">↑ 12.3% VS PREV</p>
      </div>
      
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none hover:border-primary-fixed cursor-default">
        <p className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-4 font-bold">Successful Runs</p>
        <p className="text-4xl font-black text-white">10,891</p>
        <p className="font-mono-label text-[10px] text-primary-fixed mt-2 font-bold">87.8% SUCCESS RATE</p>
      </div>
      
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none hover:border-error cursor-default">
        <p className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-4 font-bold">Failed Runs</p>
        <p className="text-4xl font-black text-error">1,511</p>
        <p className="font-mono-label text-[10px] text-error mt-2 font-bold">12.2% FAILURE RATE</p>
      </div>
      
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none hover:border-primary-fixed cursor-default">
        <p className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-4 font-bold">Average Cost</p>
        <p className="text-4xl font-black text-white">$0.14</p>
        <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 font-bold">PER_TASK_EXECUTION</p>
      </div>
      
      <div className="border-[3px] border-white p-6 bg-surface-container brutalist-shadow transition-transform hover:-translate-y-1 hover:-translate-x-1 hover:shadow-none hover:border-primary-fixed cursor-default">
        <p className="font-mono-label text-[10px] text-on-surface-variant uppercase mb-4 font-bold">Total Tokens</p>
        <p className="text-4xl font-black text-white">42.8M</p>
        <p className="font-mono-label text-[10px] text-primary-fixed mt-2 font-bold">OPTIMIZED: 94%</p>
      </div>
    </div>
  );
}
