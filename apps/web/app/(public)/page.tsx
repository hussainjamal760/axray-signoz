"use client";

import Image from "next/image";
import Link from "next/link";
import HeroSimulator from "@/features/marketing/components/HeroSimulator";
import AgentBentoGrid from "@/features/marketing/components/AgentBentoGrid";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function Home() {
  const { data, isLoading } = useCurrentUser();
  const isAuthenticated = !!data?.authenticated;

  const navCta = isLoading ? null : (
    <Link
      href={isAuthenticated ? "/sessions" : "/auth"}
      className="group relative inline-flex h-8 md:h-9 items-center justify-center overflow-hidden border-[3px] border-primary-fixed bg-background px-4 md:px-6 font-cta-label text-[10px] md:text-xs uppercase text-primary-fixed transition-all hover:scale-105 active:scale-95"
    >
      <span className="absolute inset-0 -translate-y-full bg-primary-fixed transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-y-0"></span>
      <span className="relative z-10 flex items-center gap-2 transition-colors duration-300 group-hover:text-black font-black tracking-widest whitespace-nowrap">
        {isAuthenticated ? "Sessions" : "Login GitHub"}
        <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">
          arrow_outward
        </span>
      </span>
    </Link>
  );

  const heroCta = isLoading ? null : (
    <div className="relative inline-block group w-full sm:w-auto">
      <div className="absolute inset-0 translate-x-2 translate-y-2 border-[3px] border-primary-fixed bg-primary-fixed/20 transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-active:translate-x-0 group-active:translate-y-0"></div>
      <Link
        href={isAuthenticated ? "/sessions" : "/auth"}
        className="relative flex h-16 md:h-20 items-center justify-center border-[3px] border-primary-fixed bg-background px-6 md:px-12 font-cta-label text-base md:text-xl uppercase text-primary-fixed transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0 overflow-hidden"
      >
        <span className="absolute inset-0 -translate-y-full bg-primary-fixed transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-y-0"></span>
        <span className="relative z-10 flex items-center gap-3 font-black tracking-[0.2em] transition-colors duration-300 group-hover:text-black">
          {isAuthenticated ? "ACCESS SESSIONS" : "INITIALIZE PROTOCOL"}
          <span className="material-symbols-outlined text-[24px] md:text-[28px] group-hover:rotate-90 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]">
            rocket_launch
          </span>
        </span>
      </Link>
    </div>
  );

  return (
    <>
      {/* NotchNavBar */}
      <Navbar activePath="/" isSticky={true} />

      <main>
        {/* Brutalist Marquee Ticker */}
        <div className="relative flex overflow-hidden border-b-[3px] border-primary-fixed bg-primary-fixed text-black py-2 md:py-3 z-10">
          <div className="flex whitespace-nowrap animate-marquee font-mono-label text-[10px] md:text-xs font-black uppercase tracking-[0.3em]">
            <span className="mx-4">✦ BUILT FOR WEMAKEDEVS HACKATHON</span>
            <span className="mx-4">✦ TRACK 01: AI & AGENT OBSERVABILITY</span>
            <span className="mx-4">✦ POWERED BY SIGNOZ</span>
            <span className="mx-4">✦ THE FLIGHT RECORDER FOR AI AGENTS</span>
            <span className="mx-4">✦ FULL OPENTELEMETRY INTEGRATION</span>
            {/* Duplicated for seamless scrolling */}
            <span className="mx-4">✦ BUILT FOR WEMAKEDEVS HACKATHON</span>
            <span className="mx-4">✦ TRACK 01: AI & AGENT OBSERVABILITY</span>
            <span className="mx-4">✦ POWERED BY SIGNOZ</span>
            <span className="mx-4">✦ THE FLIGHT RECORDER FOR AI AGENTS</span>
            <span className="mx-4">✦ FULL OPENTELEMETRY INTEGRATION</span>
          </div>
        </div>

        {/* Hero Section */}
        <section className="px-margin py-8 md:py-16 relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface-container-high via-background to-background">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-12 md:gap-gutter items-start max-w-[1600px] mx-auto relative z-10">
            <div className="xl:col-span-7 space-y-10">

              <div
                className="animate-fade-in-up group inline-flex items-center px-5 py-2.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full hover:border-primary-fixed/50 hover:bg-black/60 transition-all duration-500 cursor-default"
              >
                <div className="relative flex h-3 w-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-fixed opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-fixed shadow-[0_0_10px_theme(colors.primary-fixed)]"></span>
                </div>
                <span className="font-mono-label text-xs md:text-sm text-white/90 font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                  AXRAY v1.0.0 <span className="text-white/30 mx-2">|</span> Live Observability
                </span>
              </div>

              <h1 className="font-headline-xl text-[48px] leading-[1.05] md:text-[64px] lg:text-[76px] text-white tracking-tighter uppercase relative z-10">
                <div 
                  className="animate-fade-in-up inline-block opacity-0"
                  style={{ animationDelay: '0.1s' }}
                >
                  AI agents
                </div>
                <br />
                <div 
                  className="animate-fade-in-up inline-block text-white opacity-0"
                  style={{ animationDelay: '0.2s' }}
                >
                  write code.
                </div>
                <br />
                <div 
                  className="animate-fade-in-scale relative inline-block mt-4 group/highlight opacity-0"
                  style={{ animationDelay: '0.4s' }}
                >
                  <div className="absolute inset-0 bg-primary-fixed blur-xl opacity-20 group-hover/highlight:opacity-40 transition-opacity duration-500"></div>
                  <span className="relative inline-block text-black bg-primary-fixed px-6 py-2 border-[3px] border-primary-fixed shadow-[6px_6px_0px_0px_#000] group-hover/highlight:translate-x-1 group-hover/highlight:-translate-y-1 group-hover/highlight:shadow-[10px_10px_0px_0px_#000] transition-all duration-300">
                    Who watches them fail?
                  </span>
                </div>
              </h1>

              <p 
                className="animate-fade-in-up font-body-md text-lg md:text-xl text-on-surface-variant max-w-2xl font-medium leading-relaxed mt-4 opacity-0"
                style={{ animationDelay: '0.5s' }}
              >
                The absolute truth, traced. Record every decision, tool call, and file diff. Bridge the gap between autonomous execution and human oversight using the power of <span className="text-white font-bold">SigNoz</span> and <span className="text-white font-bold">OpenTelemetry</span>.
              </p>

              <div className="flex flex-col sm:flex-row flex-wrap gap-6 md:gap-8 pt-4">
                {heroCta}

                <div className="relative inline-block group w-full sm:w-auto">
                  <div className="absolute inset-0 translate-x-2 translate-y-2 bg-surface-container-high transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-active:translate-x-0 group-active:translate-y-0"></div>
                  <button className="relative w-full sm:w-auto bg-surface text-white px-8 h-16 md:h-20 border-[3px] border-outline-variant font-cta-label text-base md:text-xl font-black uppercase tracking-widest transition-all hover:bg-surface-container hover:border-white hover:text-primary-fixed group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0 flex items-center justify-center gap-3">
                    <span className="material-symbols-outlined text-[24px]">play_circle</span>
                    Watch Demo
                  </button>
                </div>
              </div>

              {/* Partners Block */}
              <div className="pt-12 border-t-[3px] border-outline-variant/30 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <span className="font-mono-label text-[10px] text-on-surface-variant uppercase font-black tracking-widest">
                  Built proudly for
                </span>
                <div className="flex items-center gap-4">
                  <div className="relative group/logo">
                    <div className="absolute inset-0 bg-primary-fixed translate-x-1 translate-y-1 transition-transform group-hover/logo:translate-x-2 group-hover/logo:translate-y-2"></div>
                    <div className="relative border-[3px] border-black bg-white p-2 w-32 h-12 flex items-center justify-center transition-transform group-hover/logo:-translate-x-1 group-hover/logo:-translate-y-1">
                      <Image src="/logo/wemakedev.jpg" alt="WeMakeDevs" width={100} height={40} className="object-contain" />
                    </div>
                  </div>
                  <span className="text-outline-variant">✕</span>
                  <div className="relative group/logo">
                    <div className="absolute inset-0 bg-primary-fixed translate-x-1 translate-y-1 transition-transform group-hover/logo:translate-x-2 group-hover/logo:translate-y-2"></div>
                    <div className="relative border-[3px] border-black bg-white p-2 w-32 h-12 flex items-center justify-center transition-transform group-hover/logo:-translate-x-1 group-hover/logo:-translate-y-1">
                      <Image src="/logo/signoz.jpg" alt="SigNoz" width={100} height={40} className="object-contain" />
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="xl:col-span-5 relative mt-6 xl:-mt-8">
              <div className="border-[3px] border-black bg-surface-container shadow-[12px_12px_0px_0px_theme(colors.primary-fixed)] relative aspect-[4/3] md:aspect-video xl:aspect-[4/5] overflow-hidden flex flex-col group/sim">
                <div className="absolute inset-0 bg-primary-fixed/5 z-0"></div>
                <HeroSimulator />

                {/* Tech Stack Floating Tags */}
                <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2 opacity-0 group-hover/sim:opacity-100 transition-opacity duration-300">
                  <span className="bg-black text-white border-[2px] border-primary-fixed px-3 py-1 font-mono-label text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_theme(colors.primary-fixed)]">
                    SigNoz MCP Server
                  </span>
                  <span className="bg-black text-white border-[2px] border-primary-fixed px-3 py-1 font-mono-label text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_0px_theme(colors.primary-fixed)]">
                    OpenTelemetry JS
                  </span>
                </div>
              </div>

              {/* Floating Status Card */}
              <div className="absolute -bottom-8 -left-8 border-[3px] border-black bg-surface p-5 min-w-[280px] shadow-[8px_8px_0px_0px_theme(colors.primary-fixed)] hidden lg:block z-30 hover:-translate-y-2 transition-transform duration-300">
                <p className="font-mono-label text-[10px] text-on-surface-variant font-black tracking-widest uppercase mb-3">Live Intercept</p>
                <div className="flex items-center justify-between border-b-[3px] border-outline-variant pb-3 mb-3">
                  <span className="font-bold text-white uppercase text-sm">Agent: Axray-Agent</span>
                  <div className="w-3 h-3 bg-primary-fixed border-[2px] border-black rounded-none animate-pulse"></div>
                </div>
                <div className="flex items-start gap-3 text-primary-fixed">
                  <span className="material-symbols-outlined text-lg mt-0.5">terminal</span>
                  <div className="flex flex-col">
                    <span className="font-mono-label text-xs font-bold truncate max-w-[200px]">Running self-check.ts</span>
                    <span className="font-mono-label text-[10px] text-on-surface-variant mt-1">Querying SigNoz traces...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Black Box Problem Section */}
        <section className="border-y-[3px] border-black bg-surface-container py-24 relative overflow-hidden">
          {/* Brutalist Grid Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: "radial-gradient(var(--color-outline-variant) 2px, transparent 2px)", backgroundSize: "32px 32px" }}></div>

          <div className="px-margin max-w-5xl mx-auto text-center space-y-12 relative z-10">
            <div className="inline-block border-[3px] border-error text-error bg-error/10 px-6 py-2 font-mono-label text-sm font-black uppercase tracking-[0.2em] shadow-[4px_4px_0px_0px_theme(colors.error)]">
              The Reality of Autonomous Coding
            </div>

            <h2 className="font-headline-xl text-[40px] md:text-[64px] leading-none uppercase text-white tracking-tighter">
              The <span className="bg-error text-black px-4 ml-2 shadow-[6px_6px_0px_0px_#000]">Black Box</span> Problem
            </h2>

            <div className="w-32 h-[3px] bg-primary-fixed mx-auto"></div>

            <p className="font-body-md text-xl md:text-3xl text-on-surface leading-snug font-medium max-w-4xl mx-auto">
              While AI agents are powerful enough to build entire features, their failures remain <span className="text-primary-fixed underline decoration-[3px] underline-offset-4">opaque, frustrating, and expensive.</span>
            </p>
            <p className="font-body-md text-lg md:text-xl text-on-surface-variant max-w-3xl mx-auto">
              Without deep observability, a failed PR from an agent is just a wall of unstructured logs. We give you the "flight recorder" to see exactly where the logic drifted, powered natively by <strong className="text-white">SigNoz</strong>.
            </p>
          </div>
        </section>

        {/* Workflow Section */}
        <div className="border-b-[3px] border-black">
          <AgentBentoGrid />
        </div>

        {/* Feature Grid - Awwwards Level */}
        <section className="py-32 relative overflow-hidden bg-background">
          {/* Background noise/grid */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>

          <div className="px-margin max-w-[1600px] mx-auto relative z-10">
            {/* Header */}
            <div className="flex flex-col xl:flex-row items-start xl:items-end justify-between mb-20 gap-12">
              <div className="max-w-4xl relative">
                <div className="absolute -left-8 top-0 w-2 h-full bg-primary-fixed hidden md:block"></div>
                <span className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
                  <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
                  System Architecture
                </span>
                <h2 className="font-headline-xl text-5xl md:text-[80px] text-white uppercase tracking-tighter leading-[0.9] font-black">
                  Engineered for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed to-secondary-fixed filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black" style={{ WebkitTextStroke: "2px black" }}>Reliability</span>
                </h2>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-4">
                <p className="font-mono-label text-on-surface-variant max-w-sm text-right text-xs uppercase tracking-widest">
                  Stop debugging black boxes. Trace every execution path with surgical precision.
                </p>
                <button className="group relative bg-black text-primary-fixed border-[3px] border-primary-fixed px-8 py-4 font-cta-label uppercase font-black tracking-widest overflow-hidden transition-transform active:scale-95 shadow-[8px_8px_0px_0px_theme(colors.primary-fixed)]">
                  <span className="absolute inset-0 w-full h-full bg-primary-fixed translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)]"></span>
                  <span className="relative z-10 group-hover:text-black flex items-center gap-2">
                    View Full Specs <span className="material-symbols-outlined text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Asymmetric Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[280px]">

              {/* Card 1: Agent Replay (Large) */}
              <div className="lg:col-span-2 lg:row-span-2 relative group cursor-pointer border-[3px] border-black bg-surface-container p-8 transition-all duration-500 overflow-hidden flex flex-col shadow-[8px_8px_0px_0px_theme(colors.primary-fixed)] hover:shadow-[16px_16px_0px_0px_theme(colors.primary-fixed)] hover:-translate-y-2 hover:-translate-x-2">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_theme(colors.primary-fixed)_0%,_transparent_50%)] opacity-0 group-hover:opacity-20 transition-opacity duration-700"></div>
                <div className="absolute top-4 right-4 font-headline-xl text-[180px] text-black/20 leading-none select-none group-hover:text-primary-fixed/20 transition-colors duration-500 -z-0">01</div>

                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-start justify-between mb-auto">
                    <div className="border-[3px] border-black bg-primary-fixed w-16 h-16 flex items-center justify-center shadow-[4px_4px_0px_0px_#000] group-hover:rotate-12 transition-transform duration-300">
                      <span className="material-symbols-outlined text-black text-3xl">replay</span>
                    </div>
                    <span className="font-mono-label text-[10px] font-black border-[2px] border-black px-3 py-1 bg-black text-primary-fixed uppercase tracking-widest shadow-[2px_2px_0px_0px_#fff]">OBS-01</span>
                  </div>
                  <h3 className="font-headline-xl text-4xl md:text-5xl uppercase mt-12 mb-6 text-white group-hover:text-primary-fixed transition-colors duration-300 font-black tracking-tighter">
                    Agent Replay
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-lg font-medium leading-relaxed max-w-md group-hover:text-white transition-colors duration-300">
                    See every action your coding agent took in a frame-by-frame scrubbing interface. No guessing. Total reconstructability of the LLM thought process.
                  </p>
                </div>
              </div>

              {/* Card 2: Trace Intelligence */}
              <div className="lg:col-span-1 lg:row-span-1 relative group cursor-pointer border-[3px] border-black bg-black p-6 transition-all duration-300 overflow-hidden flex flex-col hover:bg-primary-fixed hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_#000]">
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-auto">
                    <span className="material-symbols-outlined text-primary-fixed text-3xl group-hover:text-black">insights</span>
                    <span className="font-mono-label text-[9px] font-black border-[2px] border-outline-variant group-hover:border-black px-2 py-1 text-on-surface-variant group-hover:text-black">OBS-02</span>
                  </div>
                  <h3 className="font-headline-lg-mobile text-2xl uppercase mt-8 mb-2 text-white group-hover:text-black transition-colors duration-300 font-black tracking-tighter">Trace Intel</h3>
                  <p className="font-mono-label text-xs text-on-surface-variant group-hover:text-black/80 font-medium leading-relaxed">Map LLM calls to file changes instantly via OTel.</p>
                </div>
              </div>

              {/* Card 3: Failure Analysis */}
              <div className="lg:col-span-1 lg:row-span-1 relative group cursor-pointer border-[3px] border-black bg-error p-6 transition-all duration-300 overflow-hidden flex flex-col hover:bg-black hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_theme(colors.error)]">
                <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-700">
                  <span className="material-symbols-outlined text-[120px] text-black group-hover:text-error">search</span>
                </div>
                <div className="relative z-10 flex flex-col h-full">
                  <div className="flex items-center gap-4 mb-auto">
                    <span className="material-symbols-outlined text-black text-3xl group-hover:text-error">search</span>
                    <span className="font-mono-label text-[9px] font-black border-[2px] border-black px-2 py-1 bg-black text-error">OBS-03</span>
                  </div>
                  <h3 className="font-headline-lg-mobile text-2xl uppercase mt-8 mb-2 text-black group-hover:text-error transition-colors duration-300 font-black tracking-tighter">Auto Triage</h3>
                  <p className="font-mono-label text-xs text-black/80 group-hover:text-white font-medium leading-relaxed">Automatic root cause identification via LLM trace analysis.</p>
                </div>
              </div>

              {/* Card 4: Self-Correction (Wide) */}
              <div className="lg:col-span-2 lg:row-span-1 relative group cursor-pointer border-[3px] border-black bg-surface-container-high p-8 transition-all duration-300 overflow-hidden flex flex-col justify-end hover:bg-secondary-fixed hover:-translate-y-1 shadow-[6px_6px_0px_0px_#000]">
                {/* Scrolling Marquee Background on hover */}
                <div className="absolute inset-0 bg-secondary-fixed opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0 flex items-center overflow-hidden">
                  <div className="animate-marquee whitespace-nowrap flex text-[120px] font-headline-xl font-black text-black/10 uppercase tracking-tighter select-none">
                    <span>SELF-CORRECTING LOOP • SELF-CORRECTING LOOP • </span>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col h-full md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 border-[2px] border-black bg-white flex items-center justify-center rounded-full group-hover:animate-spin">
                        <span className="material-symbols-outlined text-black">published_with_changes</span>
                      </div>
                      <span className="font-mono-label text-[10px] font-black border-[2px] border-black bg-black text-secondary-fixed px-3 py-1 group-hover:bg-white group-hover:text-black">OBS-04</span>
                    </div>
                    <h3 className="font-headline-xl text-3xl md:text-4xl uppercase text-white group-hover:text-black font-black tracking-tighter mb-2">Self-Correction</h3>
                    <p className="font-body-md text-on-surface-variant group-hover:text-black/80 font-medium leading-relaxed max-w-sm">Agents query their telemetry via SigNoz MCP mid-run to detect loops dynamically.</p>
                  </div>
                </div>
              </div>

              {/* Card 5: Cost Monitoring */}
              <div className="lg:col-span-2 lg:row-span-1 relative group cursor-pointer border-[3px] border-black bg-[repeating-linear-gradient(45deg,theme(colors.surface-container),theme(colors.surface-container)_10px,theme(colors.background)_10px,theme(colors.background)_20px)] p-8 transition-all duration-300 overflow-hidden hover:shadow-[8px_8px_0px_0px_#fff]">
                <div className="absolute inset-0 bg-black/80 group-hover:bg-transparent transition-colors duration-500 z-0"></div>
                <div className="relative z-10 flex items-center justify-between h-full">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="material-symbols-outlined text-primary-fixed text-3xl group-hover:scale-125 transition-transform">payments</span>
                      <span className="font-mono-label text-[10px] font-black text-primary-fixed bg-primary-fixed/20 px-2 py-0.5">OBS-05</span>
                    </div>
                    <h3 className="font-headline-xl text-3xl uppercase text-white font-black tracking-tighter mb-2 group-hover:text-black group-hover:bg-white inline-block">Cost Analytics</h3>
                    <p className="font-mono-label text-xs text-on-surface-variant max-w-[250px] group-hover:text-white bg-black/50 p-2 border border-outline-variant group-hover:border-primary-fixed backdrop-blur-sm">Track token usage per agent turn. See the real-time ROI.</p>
                  </div>
                  {/* Fake Chart */}
                  <div className="hidden md:flex items-end gap-2 h-32">
                    {[40, 70, 30, 90, 60, 100].map((h, i) => (
                      <div key={i} className="w-6 bg-primary-fixed/20 border border-primary-fixed/50 group-hover:bg-primary-fixed transition-all duration-300 ease-out" style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 6: GitHub Integration (Full Width Banner) */}
              <div className="lg:col-span-4 lg:row-span-1 relative group cursor-pointer border-[3px] border-primary-fixed bg-surface p-8 md:p-12 transition-all duration-500 overflow-hidden hover:bg-primary-fixed hover:-translate-y-2 shadow-[8px_8px_0px_0px_theme(colors.primary-fixed)]">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 h-full">
                  <div className="flex items-center gap-6 md:gap-8">
                    <div className="w-16 h-16 md:w-24 md:h-24 bg-black border-[3px] border-primary-fixed rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-500">
                      {/* GitHub logo placeholder or icon */}
                      <svg className="w-10 h-10 md:w-14 md:h-14 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-4 mb-2">
                        <span className="font-mono-label text-[10px] font-black border-[2px] border-primary-fixed bg-primary-fixed/10 text-primary-fixed px-3 py-1 group-hover:bg-black group-hover:border-black transition-colors">OBS-06</span>
                      </div>
                      <h3 className="font-headline-xl text-3xl md:text-5xl uppercase text-white group-hover:text-black font-black tracking-tighter">Native PR Workflows</h3>
                    </div>
                  </div>
                  <p className="font-body-md text-on-surface-variant group-hover:text-black/80 font-medium leading-relaxed max-w-lg md:text-right text-lg">
                    Review agent traces directly from the GitHub interface without leaving your flow. Approve, reject, or debug autonomously generated PRs seamlessly.
                  </p>
                </div>
                {/* Accent lines */}
                <div className="absolute top-0 right-0 w-32 h-32 border-t-[8px] border-r-[8px] border-primary-fixed group-hover:border-black transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 border-b-[8px] border-l-[8px] border-primary-fixed group-hover:border-black transition-colors"></div>
              </div>

            </div>
          </div>
        </section>

        {/* GitHub Workflow / Call to Action */}
        <section className="bg-primary-fixed text-black border-t-[3px] border-black py-32 overflow-hidden relative">
          <div className="absolute right-[-5%] top-[-2%] opacity-10 select-none pointer-events-none">
            <span className="font-headline-xl text-[200px] leading-[0.8] uppercase block font-black tracking-tighter">
              SIGNOZ<br />WEMAKE<br />DEVS
            </span>
          </div>

          <div className="px-margin relative z-10 max-w-7xl mx-auto">
            <div className="max-w-3xl mb-20">
              <h2 className="font-headline-xl text-[56px] md:text-[80px] leading-[0.9] uppercase font-black tracking-tighter mb-8">
                The Automated <br />Review Cycle
              </h2>
              <p className="font-body-md text-2xl font-bold max-w-2xl text-black/70">
                Four steps from prompt to perfect pull request. Built on the backbone of SigNoz Foundry.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { step: "01", title: "Connect", desc: "Connect repository and define scopes." },
                { step: "02", title: "Execute", desc: "Agent identifies issues & begins session." },
                { step: "03", title: "Trace", desc: "AXRAY captures every tool call in detail." },
                { step: "04", title: "Review", desc: "Review code diffs alongside full traces." }
              ].map((item) => (
                <div key={item.step} className="group border-[3px] border-black bg-white p-6 hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#000] transition-all duration-300 cursor-pointer">
                  <div className="font-mono-label text-[10px] font-black uppercase tracking-widest text-white bg-black inline-block px-2 py-1 mb-6 border-[2px] border-black">
                    STEP {item.step}
                  </div>
                  <h4 className="font-headline-lg-mobile text-2xl font-black uppercase mb-4">{item.title}</h4>
                  <p className="font-body-md font-bold text-black/70 leading-snug">{item.desc}</p>
                </div>
              ))}
            </div>

            <div className="mt-20 flex justify-center">
              <button className="group relative bg-black text-primary-fixed border-[3px] border-black px-12 py-8 font-cta-label text-2xl uppercase tracking-[0.2em] font-black overflow-hidden transition-transform active:scale-95 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.5)]">
                <span className="absolute inset-0 w-full h-full bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]"></span>
                <span className="relative z-10 flex items-center gap-4 group-hover:text-black transition-colors duration-500">
                  INITIALIZE SYSTEM
                  <span className="material-symbols-outlined text-[32px] group-hover:translate-x-2 transition-transform duration-500">
                    east
                  </span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer variant="home" />
    </>
  );
}
