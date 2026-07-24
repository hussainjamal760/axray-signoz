import Link from "next/link";
import { ArrowRight, Terminal, Shield, Sparkles } from "lucide-react";

export function OnboardingPanel() {
  return (
    <div className="col-span-12 flex flex-col items-center justify-center py-20 px-6 bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 text-center relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] group">
      {/* Background glow & subtle light */}
      <div className="absolute w-96 h-96 rounded-full blur-[100px] -top-20 -left-20 pointer-events-none bg-primary-fixed/5 group-hover:bg-primary-fixed/10 transition-all duration-700"></div>
      <div className="absolute w-96 h-96 rounded-full blur-[100px] -bottom-20 -right-20 pointer-events-none bg-purple-500/5 group-hover:bg-purple-500/10 transition-all duration-700"></div>

      {/* Stylized Branding Icon */}
      <div className="relative mb-8 group/icon">
        <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary-fixed to-purple-500 opacity-30 blur-lg group-hover/icon:opacity-60 transition-opacity duration-500"></div>
        <div className="relative bg-surface-container-high/80 border border-outline-variant/30 p-5 rounded-2xl flex items-center justify-center shadow-lg group-hover/icon:scale-105 transition-transform duration-300">
          <Terminal className="h-10 w-10 text-primary-fixed" />
        </div>
      </div>

      {/* Headlines */}
      <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
        Welcome to <span className="text-primary-fixed drop-shadow-[0_0_15px_rgba(220,238,0,0.4)]">AXRAY</span>
      </h1>
      
      <p className="max-w-2xl text-on-surface-variant text-sm md:text-base leading-relaxed mb-10 font-medium">
        AXRAY is a session-first diagnostic and observability dashboard for autonomous AI agents. 
        Track repository status, branch edits, code execution runs, and raw LLM decision traces in real time.
      </p>

      {/* Large CTA Button */}
      <Link 
        href="/sessions/new"
        className="px-8 py-4 bg-primary-fixed hover:bg-primary-fixed/90 text-black font-semibold text-base rounded-2xl shadow-[0_0_25px_rgba(220,238,0,0.35)] hover:shadow-[0_0_35px_rgba(220,238,0,0.55)] flex items-center gap-3 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
      >
        <Sparkles size={18} strokeWidth={2.5} />
        Start Your First Session
        <ArrowRight size={18} strokeWidth={2.5} />
      </Link>

      {/* Micro Status Indicators */}
      <div className="flex flex-wrap justify-center gap-6 mt-12 text-on-surface-variant text-xs font-medium">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/40 border border-outline-variant/20">
          <span className="h-2 w-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_currentColor]"></span>
          Agent Core Ready
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container/40 border border-outline-variant/20">
          <Shield size={14} className="text-primary-fixed" />
          Protected Session Environment
        </div>
      </div>
    </div>
  );
}
