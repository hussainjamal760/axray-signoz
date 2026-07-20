export function StatsModule() {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-surface-container border-[3px] border-background p-4">
        <div className="font-mono-label uppercase text-[10px] font-bold text-on-surface-variant mb-1">Memory Usage</div>
        <div className="text-xl font-black uppercase text-on-surface">1.2 GB</div>
      </div>
      <div className="bg-surface-container border-[3px] border-background p-4">
        <div className="font-mono-label uppercase text-[10px] font-bold text-on-surface-variant mb-1">Tokens Used</div>
        <div className="text-xl font-black uppercase text-on-surface">14.2k</div>
      </div>
    </div>
  );
}
