export function TimelinePanel() {
  return (
    <div className="w-80 border-r-[3px] border-primary-fixed flex flex-col bg-surface shrink-0 hidden md:flex">
      <div className="p-4 border-b-2 border-outline-variant bg-surface-container-high flex justify-between items-center shrink-0">
        <span className="font-mono-label text-mono-label font-black text-on-surface">AGENT TIMELINE</span>
        <span className="material-symbols-outlined text-primary-fixed pulse-neon">sensors</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {/* Turn 01 */}
        <div className="p-4 border-2 border-outline-variant bg-surface-container-low flex flex-col gap-1 transition-all hover:border-primary-fixed-dim cursor-pointer">
          <div className="flex justify-between font-mono-label text-mono-label">
            <span className="text-on-surface-variant">TURN 01</span>
            <span className="text-on-surface-variant">0.8s</span>
          </div>
          <div className="font-mono-label text-mono-label text-primary font-bold">read_dir()</div>
          <div className="font-mono-label text-[10px] text-on-surface-variant truncate">./src/middleware/</div>
        </div>
        
        {/* Turn 02 */}
        <div className="p-4 border-2 border-outline-variant bg-surface-container-low flex flex-col gap-1 transition-all hover:border-primary-fixed-dim cursor-pointer">
          <div className="flex justify-between font-mono-label text-mono-label">
            <span className="text-on-surface-variant">TURN 02</span>
            <span className="text-on-surface-variant">1.1s</span>
          </div>
          <div className="font-mono-label text-mono-label text-primary font-bold">read_file()</div>
          <div className="font-mono-label text-[10px] text-on-surface-variant truncate">src/auth.js</div>
        </div>
        
        {/* Turn 03 ACTIVE */}
        <div className="p-4 border-2 border-primary-fixed bg-primary-fixed text-on-primary-fixed flex flex-col gap-1 active-turn-shadow">
          <div className="flex justify-between font-mono-label text-mono-label">
            <span className="font-black">TURN 03 [ACTIVE]</span>
            <span className="font-black">1.2s</span>
          </div>
          <div className="font-mono-label text-mono-label font-black">write_file()</div>
          <div className="font-mono-label text-[10px] truncate opacity-80">src/auth.js</div>
        </div>
        
        {/* Turn 04 */}
        <div className="p-4 border-2 border-outline-variant bg-surface-container-low opacity-50 flex flex-col gap-1">
          <div className="flex justify-between font-mono-label text-mono-label">
            <span className="text-on-surface-variant">TURN 04</span>
            <span className="text-on-surface-variant">--</span>
          </div>
          <div className="font-mono-label text-mono-label font-bold text-on-surface-variant">npm_test()</div>
          <div className="font-mono-label text-[10px] italic">Pending...</div>
        </div>
      </div>
    </div>
  );
}
