import Link from "next/link";

export function OnboardingPanel() {
  return (
    <div className="col-span-12 flex flex-col items-center justify-center py-20 px-6 bg-surface border-[3px] border-outline text-center relative overflow-hidden brutalist-shadow">
      {/* Background cyber grid effect */}
      <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      {/* Stylized Branding Icon */}
      <div className="relative mb-8 group">
        <div className="absolute -inset-1 rounded bg-gradient-to-r from-primary-fixed to-secondary-fixed opacity-75 blur-md group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative bg-background border-[3px] border-outline p-6 flex items-center justify-center brutalist-shadow-sm group-hover:translate-x-[2px] group-hover:translate-y-[2px] group-hover:shadow-none transition-all">
          <span className="material-symbols-outlined !text-6xl text-primary-fixed select-none">
            terminal
          </span>
        </div>
      </div>

      {/* Headlines */}
      <h1 className="font-headline-lg text-4xl md:text-5xl font-black text-on-surface uppercase tracking-tight mb-4">
        Welcome to <span className="text-primary-fixed">AXRAY</span>
      </h1>
      
      <p className="max-w-2xl text-on-surface-variant font-mono-label text-sm md:text-base leading-relaxed mb-10">
        AXRAY is a session-first diagnostic and observability dashboard for autonomous AI agents. 
        Track repository status, branch edits, code execution runs, and raw LLM decision traces in real time.
      </p>

      {/* Large CTA Button */}
      <Link 
        href="/dashboard/new"
        className="px-12 py-5 bg-primary-fixed text-on-primary-fixed font-black text-xl uppercase tracking-wider border-[3px] border-background brutalist-shadow flex items-center gap-4 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all active:translate-x-0 active:translate-y-0"
      >
        Start Your First Session
        <span className="material-symbols-outlined font-black">arrow_forward</span>
      </Link>

      {/* Micro Status Indicators */}
      <div className="flex gap-8 mt-12 text-on-surface-variant font-mono-label text-xs uppercase tracking-widest">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 bg-green-500 rounded-full animate-pulse"></span>
          Agent Core Ready
        </div>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined !text-[16px] text-primary-fixed">shield</span>
          Protected Session
        </div>
      </div>
    </div>
  );
}
