import { Cpu } from "@phosphor-icons/react/dist/ssr";

export function LiveTraceTree() {
  return (
    <div className="col-span-12 md:col-span-5 bg-background border-[3px] border-outline flex flex-col h-[450px] brutalist-shadow relative overflow-hidden">
      <div className="p-4 border-b-2 border-outline flex items-center justify-between bg-surface z-10 shrink-0">
        <h4 className="font-black uppercase text-sm flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed">schema</span>
          Live Trace Tree
        </h4>
        <span className="material-symbols-outlined text-outline cursor-pointer hover:text-primary-fixed transition-none">fullscreen</span>
      </div>
      
      {/* Offline Node Visualization replacing Three.js */}
      <div className="flex-1 relative flex items-center justify-center flex-col group">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#e5e3cf 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
        
        <Cpu weight="fill" className="text-primary-fixed/20 w-24 h-24 mb-4" />
        <span className="font-mono-label text-xs text-on-surface-variant uppercase tracking-widest opacity-50">
          Node Visualization Offline
        </span>

        {/* Overlay UI mapping to the original HTML overlay */}
        <div className="absolute inset-0 pointer-events-none p-6 font-mono-label text-[10px] text-primary-fixed/80 uppercase">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-on-surface">root</span> &gt; agent_session_1024
            </div>
            <div className="pl-4 border-l border-primary-fixed/30 mt-2">
              <div>L call: GPT-4</div>
              <div className="text-on-surface">L tool: READ_FILE [WAIT]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
