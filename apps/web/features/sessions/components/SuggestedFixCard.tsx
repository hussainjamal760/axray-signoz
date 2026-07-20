export function SuggestedFixCard() {
  return (
    <div className="bg-primary-fixed border-[3px] border-background brutalist-shadow p-6 reveal-text" style={{ animationDelay: '0.3s' }}>
      <h3 className="font-mono-label text-on-primary-fixed uppercase font-black text-xs mb-2 tracking-widest">Recommended Solution</h3>
      <p className="text-3xl font-black text-on-primary-fixed leading-tight mb-8">
        "Restore authentication middleware and update only validation logic."
      </p>
      <div className="flex flex-wrap gap-4">
        <button className="bg-background text-primary-fixed px-6 py-3 font-bold text-lg uppercase border-[3px] border-background hover:bg-surface-container-high transition-all brutalist-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
          Apply Fix
        </button>
        <button className="bg-surface text-on-surface px-6 py-3 font-bold text-lg uppercase border-[3px] border-background hover:bg-surface-container-high transition-all brutalist-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
          Create Patch
        </button>
        <button className="bg-surface text-on-surface px-6 py-3 font-bold text-lg uppercase border-[3px] border-background hover:bg-surface-container-high transition-all brutalist-shadow-sm active:translate-x-1 active:translate-y-1 active:shadow-none">
          Create Pull Request
        </button>
      </div>
    </div>
  );
}
