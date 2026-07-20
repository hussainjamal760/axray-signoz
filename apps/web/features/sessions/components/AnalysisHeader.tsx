export function AnalysisHeader() {
  return (
    <header className="col-span-12 mb-8">
      <div className="flex items-baseline justify-between border-b-[3px] border-on-surface-variant pb-4">
        <div className="flex flex-col">
          <span className="font-mono-label text-xs uppercase text-primary-fixed mb-1 font-bold">Incident Report</span>
          <h1 className="text-5xl font-black uppercase tracking-tighter text-on-surface">
            Failure Analysis <span className="text-outline">/ Session #1042</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-error-container text-on-error-container border-2 border-background font-mono-label font-bold text-xs uppercase">
            Critical Failure
          </span>
          <span className="px-3 py-1 bg-surface-container-high border-2 border-background font-mono-label font-bold text-xs uppercase text-on-surface">
            0.42ms Latency
          </span>
        </div>
      </div>
    </header>
  );
}
