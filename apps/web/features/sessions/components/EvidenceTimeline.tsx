export function EvidenceTimeline() {
  return (
    <div className="bg-surface-container-low border-[3px] border-background p-6 reveal-text" style={{ animationDelay: '0.5s' }}>
      <h3 className="font-mono-label font-bold uppercase text-primary-fixed mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">list_alt</span>
        Evidence Timeline
      </h3>
      <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant">
        
        <div className="relative pl-8 pb-8 group">
          <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-background border-2 border-on-surface-variant rounded-full z-10 flex items-center justify-center">
            <div className="w-2 h-2 bg-on-surface-variant"></div>
          </div>
          <div className="font-mono-label font-bold uppercase text-[10px] text-on-surface-variant mb-1">Turn 1</div>
          <div className="font-bold text-on-surface group-hover:text-primary-fixed transition-colors">Read auth.js</div>
        </div>

        <div className="relative pl-8 pb-8 group">
          <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-background border-2 border-on-surface-variant rounded-full z-10 flex items-center justify-center">
            <div className="w-2 h-2 bg-on-surface-variant"></div>
          </div>
          <div className="font-mono-label font-bold uppercase text-[10px] text-on-surface-variant mb-1">Turn 2</div>
          <div className="font-bold text-on-surface group-hover:text-primary-fixed transition-colors">Changed middleware</div>
        </div>

        <div className="relative pl-8 pb-8 group">
          <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-error-container border-2 border-background rounded-full z-10 flex items-center justify-center scale-110">
            <span className="material-symbols-outlined text-[14px] text-on-error-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
          </div>
          <div className="font-mono-label font-black uppercase text-[10px] text-error mb-1">Turn 3</div>
          <div className="font-bold text-on-surface group-hover:text-error transition-colors">Tests failed (Exit Code 1)</div>
        </div>

        <div className="relative pl-8 group">
          <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-background border-2 border-on-surface-variant rounded-full z-10 flex items-center justify-center">
            <div className="w-2 h-2 bg-on-surface-variant"></div>
          </div>
          <div className="font-mono-label font-bold uppercase text-[10px] text-on-surface-variant mb-1">Turn 4</div>
          <div className="font-bold text-on-surface group-hover:text-primary-fixed transition-colors">Retry loop detected</div>
        </div>

      </div>
    </div>
  );
}
