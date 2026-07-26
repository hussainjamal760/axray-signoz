"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeroSimulator from "@/features/marketing/components/HeroSimulator";
import AgentBentoGrid from "@/features/marketing/components/AgentBentoGrid";
import VideoModal from "@/features/marketing/components/VideoModal";
import SetupGuideModal from "@/features/marketing/components/SetupGuideModal";
import SectionVideoPlayer from "@/features/marketing/components/SectionVideoPlayer";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowRight, Play, Rocket, ShieldCheck, Terminal, Cpu, Activity, Sparkles, AlertTriangle, Layers, Eye, BookOpen, Wrench } from "lucide-react";

import { isVercelProductionDomain } from "@/lib/utils";

export default function Home() {
  const { data, isLoading } = useCurrentUser();
  const isAuthenticated = !!data?.authenticated;
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

  // Automatically trigger setup guide modal on page load or when setup query param is present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isVercel = isVercelProductionDomain();
      const hasSetupParam = window.location.search.includes("setup=true");
      if (isVercel || hasSetupParam) {
        const timer = setTimeout(() => {
          setIsSetupModalOpen(true);
        }, 400);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const heroCta = isLoading ? null : isVercelProductionDomain() ? (
    <button
      onClick={() => setIsSetupModalOpen(true)}
      className="bg-primary-fixed hover:bg-primary-fixed/90 text-black font-bold text-sm md:text-base px-8 py-4 rounded-2xl shadow-[0_0_25px_rgba(220,238,0,0.35)] hover:shadow-[0_0_35px_rgba(220,238,0,0.55)] transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
    >
      <span>Run Self-Hosted Setup</span>
      <Rocket size={18} strokeWidth={2.5} className="animate-bounce" />
    </button>
  ) : (
    <Link
      href={isAuthenticated ? "/sessions" : "/auth"}
      className="bg-primary-fixed hover:bg-primary-fixed/90 text-black font-bold text-sm md:text-base px-8 py-4 rounded-2xl shadow-[0_0_25px_rgba(220,238,0,0.35)] hover:shadow-[0_0_35px_rgba(220,238,0,0.55)] transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-0 w-full sm:w-auto"
    >
      <span>{isAuthenticated ? "Access Sessions" : "Initialize Protocol"}</span>
      <Rocket size={18} strokeWidth={2.5} className="animate-bounce" />
    </Link>
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-sans relative overflow-x-hidden" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      {/* NotchNavBar */}
      <Navbar activePath="/" isSticky={true} />

      <main className="flex-1">
        {/* Ticker Bar */}
        <div className="relative flex overflow-hidden border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md text-on-surface py-2.5 z-10 shadow-sm">
          <div className="flex whitespace-nowrap animate-marquee font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-on-surface-variant">
            <span className="mx-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse"></span>
              BUILT FOR WEMAKEDEVS HACKATHON
            </span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6">TRACK 01: AI & AGENT OBSERVABILITY</span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6 text-white font-semibold">POWERED BY SIGNOZ</span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6">THE FLIGHT RECORDER FOR AI AGENTS</span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6">OPENTELEMETRY NATIVE</span>
            {/* Duplicated for smooth loop */}
            <span className="mx-6 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse"></span>
              BUILT FOR WEMAKEDEVS HACKATHON
            </span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6">TRACK 01: AI & AGENT OBSERVABILITY</span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6 text-white font-semibold">POWERED BY SIGNOZ</span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6">THE FLIGHT RECORDER FOR AI AGENTS</span>
            <span className="mx-6 text-primary-fixed">✦</span>
            <span className="mx-6">OPENTELEMETRY NATIVE</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="px-6 md:px-12 py-12 md:py-20 relative overflow-hidden">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-center max-w-[1500px] mx-auto relative z-10">
            <div className="xl:col-span-7 space-y-8">

              {/* Version Pill & Setup Instructions Button */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="inline-flex items-center px-4 py-1.5 bg-surface-container-lowest/60 backdrop-blur-xl border border-outline-variant/30 rounded-full text-xs font-medium text-white shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2.5 animate-pulse shadow-[0_0_8px_currentColor]"></span>
                  <span className="font-mono text-primary-fixed font-bold uppercase tracking-wider">AXRAY v1.0.0</span>
                  <span className="text-on-surface-variant/40 mx-2.5">|</span>
                  <span className="text-on-surface-variant font-mono">Live Agent Observability</span>
                </div>

                <button
                  onClick={() => setIsSetupModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary-fixed/10 hover:bg-primary-fixed/20 border border-primary-fixed/30 hover:border-primary-fixed rounded-full text-xs font-mono font-bold text-primary-fixed uppercase tracking-wider transition-all duration-200 shadow-[0_0_15px_rgba(220,238,0,0.1)] cursor-pointer"
                >
                  <Wrench size={13} />
                  <span>Setup Guide (Self-Hosted)</span>
                </button>
              </div>

              {/* Compact Developer Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight uppercase leading-[1.1]">
                AI agents write code.
                <br />
                <span className="text-on-surface-variant/60 font-semibold">Who watches them fail?</span>
                <br />
                <span className="inline-block mt-3 px-4 py-1 bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 rounded-2xl shadow-[0_0_20px_rgba(220,238,0,0.15)] text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                  The Absolute Truth, Traced.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-on-surface-variant/90 max-w-2xl font-medium leading-relaxed">
                Record every decision, tool call, and file diff in real time. Bridge autonomous agent execution and human oversight with <strong className="text-white">SigNoz</strong> and <strong className="text-white">OpenTelemetry</strong>.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-4 pt-2">
                {heroCta}

                <button 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="bg-surface-container-lowest/60 hover:bg-surface-container/60 text-white font-semibold text-sm md:text-base px-8 py-4 rounded-2xl border border-outline-variant/30 backdrop-blur-xl transition-all duration-300 flex items-center justify-center gap-2.5 hover:border-white/40 shadow-sm w-full sm:w-auto cursor-pointer"
                >
                  <Play size={18} className="text-primary-fixed" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Partners Block */}
              <div className="pt-8 border-t border-outline-variant/20 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span className="font-mono text-xs text-on-surface-variant/70 uppercase font-semibold tracking-wider">
                  Built proudly for
                </span>
                <div className="flex items-center gap-4">
                  <div className="px-4 py-2 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/30 backdrop-blur-md flex items-center justify-center shadow-sm hover:border-primary-fixed/40 transition-colors">
                    <Image src="/logo/wemakedev.jpg" alt="WeMakeDevs" width={90} height={32} className="object-contain rounded" />
                  </div>
                  <span className="text-on-surface-variant/40 font-mono text-xs">✕</span>
                  <div className="px-4 py-2 rounded-2xl bg-surface-container-lowest/60 border border-outline-variant/30 backdrop-blur-md flex items-center justify-center shadow-sm hover:border-primary-fixed/40 transition-colors">
                    <Image src="/logo/signoz.jpg" alt="SigNoz" width={90} height={32} className="object-contain rounded" />
                  </div>
                </div>
              </div>

            </div>

            {/* Terminal Simulator Container */}
            <div className="xl:col-span-5 relative">
              <div className="w-full aspect-[4/3] md:aspect-video xl:aspect-[4/4.5] relative">
                <HeroSimulator />
              </div>

              {/* Floating Status Pill */}
              <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest/90 backdrop-blur-2xl p-4 rounded-2xl border border-outline-variant/30 shadow-2xl hidden lg:block max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_currentColor]"></span>
                  <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Intercept Active</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Terminal size={14} className="text-primary-fixed" />
                  <span>Agent: Axray-Agent #291</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem Section */}
        <section className="border-y border-outline-variant/20 bg-surface-container-lowest/30 backdrop-blur-md py-24 relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] h-[400px] bg-red-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

          <div className="max-w-6xl mx-auto text-center px-6 space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 border border-red-500/40 bg-red-500/10 px-5 py-2 rounded-full text-red-400 text-sm font-semibold uppercase tracking-widest shadow-[0_0_20px_rgba(248,113,113,0.15)]">
              <AlertTriangle size={16} className="animate-pulse" />
              The Reality of Autonomous Coding
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter uppercase leading-tight">
              The <span className="text-red-400 relative inline-block">Black Box<svg className="absolute -bottom-2 left-0 w-full text-red-500/50" viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M0 10 Q 50 20 100 10" stroke="currentColor" strokeWidth="4" fill="transparent"/></svg></span> Problem
            </h2>

            <p className="text-lg md:text-2xl text-on-surface-variant font-medium leading-relaxed max-w-4xl mx-auto">
              When AI agents fail, their execution output remains <span className="text-red-400 font-bold drop-shadow-[0_0_10px_rgba(248,113,113,0.3)]">opaque, frustrating, and costly.</span>
            </p>
            <p className="text-base md:text-lg text-on-surface-variant/90 max-w-3xl mx-auto leading-relaxed">
              Without trace-level observability, a failed PR from an agent is just an unreadable wall of logs. AXRAY acts as your flight recorder, powered natively by <strong className="text-white bg-white/10 px-2 py-0.5 rounded">SigNoz</strong>.
            </p>
            
            <SectionVideoPlayer />
          </div>
        </section>

        {/* Workflow Section */}
        <div className="border-b border-outline-variant/20">
          <AgentBentoGrid />
        </div>

        {/* Feature Grid */}
        <section className="py-32 relative overflow-hidden bg-background">
          {/* Awwwards-style Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-fixed/15 via-background to-transparent opacity-60 pointer-events-none"></div>

          <div className="px-6 md:px-12 max-w-[1500px] mx-auto relative z-10">
            <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between mb-20 gap-10">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container-lowest/50 border border-outline-variant/30 backdrop-blur-md text-primary-fixed text-xs font-semibold uppercase tracking-widest mb-6 shadow-[0_0_15px_rgba(220,238,0,0.1)]">
                  <Sparkles size={14} className="animate-pulse" />
                  System Architecture
                </div>
                <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter leading-[1.05]">
                  Engineered for <br className="hidden md:block" />
                  <span className="text-primary-fixed drop-shadow-[0_0_15px_rgba(220,238,0,0.3)]">Reliability</span>
                </h2>
              </div>
              <p className="text-on-surface-variant text-base md:text-xl font-medium max-w-md leading-relaxed border-l-[3px] border-primary-fixed/50 pl-6">
                Stop debugging black boxes. Trace every execution path with surgical precision using <span className="text-white font-bold tracking-wide">OpenTelemetry</span>.
              </p>
            </div>

            {/* Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">

              {/* Card 1 */}
              <div className="group relative bg-surface-container-lowest/20 backdrop-blur-2xl rounded-[32px] border border-outline-variant/20 p-1.5 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(220,238,0,0.2)] transition-all duration-700 hover:-translate-y-3 overflow-hidden isolate">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
                <div className="relative h-full bg-surface-container-lowest/40 rounded-[26px] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-primary-fixed/20 to-primary-fixed/5 border border-primary-fixed/30 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Activity size={32} className="text-primary-fixed drop-shadow-[0_0_8px_rgba(220,238,0,0.5)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary-fixed transition-colors duration-300">Agent Replay</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-medium">
                      Scrub through every action your agent executed frame-by-frame with full reconstructability of its LLM reasoning.
                    </p>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-primary-fixed/10 rounded-full blur-[64px] group-hover:bg-primary-fixed/25 transition-colors duration-700 -z-10"></div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group relative bg-surface-container-lowest/20 backdrop-blur-2xl rounded-[32px] border border-outline-variant/20 p-1.5 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(52,211,153,0.2)] transition-all duration-700 hover:-translate-y-3 overflow-hidden isolate md:mt-16">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
                <div className="relative h-full bg-surface-container-lowest/40 rounded-[26px] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <Eye size={32} className="text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-emerald-400 transition-colors duration-300">Trace Intelligence</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-medium">
                      Map high-level prompt decisions directly down to file diffs and tool execution spans.
                    </p>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-[64px] group-hover:bg-emerald-500/25 transition-colors duration-700 -z-10"></div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group relative bg-surface-container-lowest/20 backdrop-blur-2xl rounded-[32px] border border-outline-variant/20 p-1.5 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(248,113,113,0.2)] transition-all duration-700 hover:-translate-y-3 overflow-hidden isolate">
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 -z-10"></div>
                <div className="relative h-full bg-surface-container-lowest/40 rounded-[26px] p-8 md:p-10 flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-red-500/20 to-red-500/5 border border-red-500/30 flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                      <AlertTriangle size={32} className="text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-red-400 transition-colors duration-300">Automatic Root Cause</h3>
                    <p className="text-base text-on-surface-variant leading-relaxed font-medium">
                      Instant root cause diagnosis when agent executions stall or enter infinite logic loops.
                    </p>
                  </div>
                  {/* Decorative element */}
                  <div className="absolute -bottom-16 -right-16 w-64 h-64 bg-red-500/10 rounded-full blur-[64px] group-hover:bg-red-500/25 transition-colors duration-700 -z-10"></div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4-Step Cycle */}
        <section className="bg-background relative py-32 overflow-hidden border-t border-outline-variant/10">
          {/* Subtle connecting background line for desktop */}
          <div className="absolute top-[60%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary-fixed/20 to-transparent hidden lg:block -translate-y-1/2"></div>
          
          <div className="px-6 md:px-12 max-w-7xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.05] mb-6">
              The Automated <span className="text-primary-fixed drop-shadow-[0_0_15px_rgba(220,238,0,0.3)]">Review Cycle</span>
            </h2>
            <p className="text-on-surface-variant text-lg md:text-xl font-medium mb-20 max-w-2xl mx-auto leading-relaxed">
              Four steps from prompt to perfect pull request, powered natively by <span className="text-white font-bold tracking-wide">SigNoz</span>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-left relative">
              {[
                { step: "01", title: "Connect", desc: "Link repository & define agent boundary.", glow: "from-primary-fixed/20" },
                { step: "02", title: "Execute", desc: "Agent picks up task & runs autonomously.", glow: "from-emerald-500/20" },
                { step: "03", title: "Trace", desc: "AXRAY records every span into SigNoz.", glow: "from-blue-500/20" },
                { step: "04", title: "Review", desc: "Inspect file diffs alongside full traces.", glow: "from-purple-500/20" }
              ].map((item, i) => (
                <div key={item.step} className={`group relative bg-surface-container-lowest/30 backdrop-blur-2xl border border-outline-variant/20 rounded-[32px] p-8 shadow-2xl hover:shadow-[0_20px_40px_-15px_rgba(255,255,255,0.08)] transition-all duration-700 hover:-translate-y-3 isolate ${i % 2 !== 0 ? 'lg:mt-16' : ''}`}>
                  {/* Hover glow background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${item.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[32px] -z-10`}></div>
                  
                  {/* Large background number */}
                  <div className="absolute top-4 right-6 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-500 font-black text-8xl text-white pointer-events-none select-none">
                    {item.step}
                  </div>
                  
                  {/* Step indicator */}
                  <div className="w-14 h-14 rounded-[18px] bg-surface-container-lowest border border-outline-variant/30 flex items-center justify-center mb-8 shadow-inner relative group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                     <span className="font-mono text-sm font-bold text-white relative z-10">{item.step}</span>
                     {/* Outer animated ring */}
                     <div className="absolute inset-[-4px] rounded-[22px] border border-primary-fixed/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  
                  <h4 className="text-2xl font-bold text-white mb-3 tracking-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-400 transition-all duration-300">{item.title}</h4>
                  <p className="text-sm text-on-surface-variant font-medium leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer variant="home" />

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        videoSrc="/demo.mp4"
      />

      {/* Setup Guide Modal (Opens automatically on load) */}
      <SetupGuideModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onWatchDemo={() => setIsVideoModalOpen(true)}
      />
    </div>
  );
}

