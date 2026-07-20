export function FailureVisualization() {
  return (
    <div className="h-64 border-[3px] border-background relative overflow-hidden bg-surface-container-lowest reveal-text" style={{ animationDelay: '0.4s' }}>
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
        <span className="font-mono-label text-primary-fixed uppercase mb-2 font-bold text-xs tracking-widest">Failure Vector Mapping</span>
        <div className="w-full h-1 bg-background mb-4 overflow-hidden">
          <div className="h-full bg-primary-fixed w-3/4 animate-pulse"></div>
        </div>
        <p className="text-[10px] font-mono-label font-bold text-on-surface-variant tracking-[0.2em] uppercase">ANOMALY DETECTED IN AUTH_FLOW.JS</p>
      </div>
    </div>
  );
}
