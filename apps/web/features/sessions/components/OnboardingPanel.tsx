import Link from "next/link";

export function OnboardingPanel() {
  return (
    <div className="col-span-12 flex flex-col items-center justify-center py-16 px-6 bg-surface border-[3px] border-outline text-center relative overflow-hidden brutalist-shadow max-w-4xl mx-auto my-12">
      {/* Accent structural frames */}
      <div className="w-full border-b-[3px] border-outline-variant py-2 bg-surface-container-highest flex items-center justify-center font-mono-label text-[10px] text-on-surface-variant font-bold tracking-widest uppercase mb-10">
        // AXRAY_OBSERVATORY_INITIALIZATION_INTERFACE
      </div>

      {/* Brand Label */}
      <div className="font-headline-xl text-5xl md:text-6xl font-black text-on-surface tracking-tighter uppercase mb-6 select-none">
        AXRAY
      </div>

      {/* Headline */}
      <h1 className="font-headline-lg text-2xl md:text-3xl font-black text-primary-fixed uppercase tracking-tight mb-6">
        Welcome to AXRAY
      </h1>
      
      {/* Description list */}
      <div className="max-w-xl text-on-surface-variant font-mono-label text-sm md:text-base leading-relaxed mb-10 space-y-2">
        <p>AXRAY is a session-first diagnostic</p>
        <p>and observability dashboard for</p>
        <p>autonomous AI agents.</p>
        <div className="h-4"></div>
        <p className="text-on-surface/80">Track repository status,</p>
        <p className="text-on-surface/80 font-bold text-white">branch edits,</p>
        <p className="text-on-surface/80">execution runs,</p>
        <p className="text-on-surface/80">and raw LLM reasoning traces</p>
        <p className="text-on-surface/80">in real time.</p>
      </div>

      {/* Large CTA Button */}
      <Link 
        href="/dashboard/new"
        className="px-12 py-5 bg-primary-fixed text-on-primary-fixed font-black text-xl uppercase tracking-wider border-[3px] border-background brutalist-shadow flex items-center gap-4 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all active:translate-x-0 active:translate-y-0"
      >
        Start Your First Session
        <span className="material-symbols-outlined font-black">arrow_forward</span>
      </Link>

      {/* Badge container at bottom */}
      <div className="w-full border-t-[3px] border-outline-variant mt-12 pt-8 flex flex-wrap justify-center gap-6">
        <div className="flex items-center gap-2 border-2 border-green-600 bg-green-500/10 px-3 py-1 font-mono-label text-xs font-bold text-green-500 uppercase tracking-widest">
          ✓ Agent Core Ready
        </div>
        <div className="flex items-center gap-2 border-2 border-primary-fixed bg-primary-fixed-dim/10 px-3 py-1 font-mono-label text-xs font-bold text-primary-fixed uppercase tracking-widest">
          ✓ Protected Sessions
        </div>
        <div className="flex items-center gap-2 border-2 border-outline bg-surface-container-high px-3 py-1 font-mono-label text-xs font-bold text-on-surface-variant uppercase tracking-widest">
          ✓ GitHub Connected
        </div>
      </div>
    </div>
  );
}
