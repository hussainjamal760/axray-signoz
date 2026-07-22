"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function HowItWorksPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

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

  const steps = [
    {
      id: "01",
      title: "Embed the Tracer",
      color: "bg-primary-fixed",
      textColor: "text-primary-fixed",
      desc: "AXRAY connects seamlessly to any agentic framework (LangChain, AutoGen, custom) via standard OpenTelemetry libraries. Drop in two lines of code, and you're instantly hooked into the pipeline.",
      icon: "integration_instructions",
    },
    {
      id: "02",
      title: "Span Generation",
      color: "bg-secondary-fixed",
      textColor: "text-secondary-fixed",
      desc: "As your agent loops through thoughts, tool executions, and external API requests, the tracer emits distinct, deeply-attributed spans containing prompts, context, latency, and tokens used.",
      icon: "electric_bolt",
    },
    {
      id: "03",
      title: "SigNoz Aggregation",
      color: "bg-error",
      textColor: "text-error",
      desc: "Spans are fired asynchronously to your SigNoz instance. We leverage ClickHouse under the hood to ingest millions of agent events per second with zero performance hit to your main thread.",
      icon: "database",
    },
    {
      id: "04",
      title: "AXRAY Visualizer",
      color: "bg-white",
      textColor: "text-white",
      desc: "The AXRAY dashboard pulls those traces in real-time. Instead of raw JSON, you get a frame-by-frame flight recorder UI that allows human operators to scrub through the agent's entire thought process.",
      icon: "query_stats",
    }
  ];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-fixed selection:text-black overflow-hidden" ref={containerRef}>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-background)_0%,_transparent_100%)] z-0"></div>

      {/* NotchNavBar */}
      <header className="fixed top-0 z-50 h-16 flex w-full pointer-events-none">
        <div className="flex-1 max-w-[20px] md:max-w-[120px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto border-b-[3px] border-primary-fixed"></div>

        <div className="flex h-16 relative z-10 shrink-0 flex-1 pointer-events-auto">
          <div className="w-[30px] h-full relative shrink-0">
            <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V64 C15 64 15 40 0 40 Z')" }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
              <path d="M0 38.5 C15 38.5 15 62.5 30 62.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
            </svg>
          </div>

          <div className="flex-1 h-full relative min-w-0 bg-background border-b-[3px] border-primary-fixed flex items-end justify-between pb-2.5 px-4 md:px-8">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image src="/logo/axray-logo.png" alt="AXRAY Logo" width={28} height={28} className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform" />
              <span className="font-headline-lg text-lg font-black tracking-tighter text-white uppercase hidden sm:inline-block">AXRAY</span>
            </Link>

            <div className="hidden lg:flex gap-6 items-center shrink-0">
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="/">Home</Link>
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="/features">Features</Link>
              <Link className="text-primary-fixed font-cta-label underline decoration-3 underline-offset-8 transition-transform active:translate-x-[2px] active:translate-y-[2px]" href="/how-it-works">How it Works</Link>
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="#">Docs</Link>
            </div>

            <div className="shrink-0 flex items-center mb-1">
              {navCta}
            </div>
          </div>

          <div className="w-[30px] h-full relative shrink-0">
            <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V40 C15 40 15 64 0 64 Z')" }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
              <path d="M0 62.5 C15 62.5 15 38.5 30 38.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
            </svg>
          </div>
        </div>

        <div className="flex-1 max-w-[20px] md:max-w-[120px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto border-b-[3px] border-primary-fixed"></div>
      </header>

      <main className="relative z-10 pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="px-margin max-w-[1600px] mx-auto min-h-[60vh] flex flex-col justify-center relative items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl relative z-10 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
              <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
              System Pipeline
            </div>

            <h1 className="font-headline-xl text-6xl md:text-[100px] leading-[0.9] text-white uppercase tracking-tighter font-black mb-8">
              The Anatomy <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-outline-variant filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black" style={{ WebkitTextStroke: "2px black" }}>Of a Trace</span>
            </h1>

            <p className="font-body-md text-xl md:text-2xl text-on-surface-variant font-medium leading-relaxed max-w-2xl">
              From the first line of code generated by an agent to the final render in your browser. See exactly how data moves through the AXRAY engine.
            </p>
          </motion.div>
        </section>

        {/* PIPELINE SECTION */}
        <section className="max-w-[1200px] mx-auto px-margin relative mt-16 mb-48">

          {/* Vertical Pipeline Line */}
          <div className="absolute left-10 md:left-1/2 top-0 bottom-0 w-[4px] bg-outline-variant border-x border-black -translate-x-1/2 z-0"></div>

          <div className="space-y-24 md:space-y-32 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className={`flex flex-col md:flex-row md:items-center gap-8 md:gap-16 relative ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Content Block */}
                <div className={`w-full md:w-1/2 flex flex-col pl-24 md:pl-0 ${index % 2 === 0 ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} group relative z-10`}>
                  <span className={`font-mono-label text-6xl md:text-[120px] leading-none tracking-tighter opacity-10 font-black mb-2 ${step.textColor} transition-opacity duration-300 group-hover:opacity-30`}>{step.id}</span>
                  <h3 className="font-headline-xl text-3xl md:text-5xl uppercase font-black text-white mb-4">{step.title}</h3>
                  <p className="font-body-md text-on-surface-variant text-lg leading-relaxed max-w-md bg-surface-container border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_#000] group-hover:-translate-y-1 transition-transform">
                    {step.desc}
                  </p>
                </div>

                {/* Center Node */}
                <div className="absolute left-10 md:left-1/2 top-4 md:top-auto -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 rounded-full border-[4px] border-black bg-surface-container flex items-center justify-center z-20 shadow-[4px_4px_0px_0px_#000] group">
                  <div className={`w-full h-full rounded-full ${step.color} opacity-20 absolute inset-0 group-hover:animate-ping`}></div>
                  <span className={`material-symbols-outlined ${step.textColor} text-2xl md:text-3xl relative z-10`}>{step.icon}</span>
                </div>

                {/* Placeholder for empty side */}
                <div className="w-full md:w-1/2 hidden md:block"></div>
              </motion.div>
            ))}
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t-[4px] border-black bg-surface relative z-30 py-12 md:py-16">
        <div className="px-margin max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">

          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <Image
                src="/logo/axray-logo.png"
                alt="AXRAY Logo"
                width={32}
                height={32}
                className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform"
              />
              <span className="font-headline-lg-mobile text-2xl font-black text-white uppercase tracking-tighter">
                AXRAY
              </span>
            </Link>
            <p className="font-mono-label text-xs text-on-surface-variant font-bold uppercase tracking-widest max-w-xs text-center md:text-left">
              © 2026 AXRAY. Built for the machine era by WeMakeDevs Track 01.
            </p>
          </div>

          <div className="flex gap-x-8 gap-y-4 flex-wrap justify-center">
            {['Terms', 'Privacy', 'Security', 'Changelog'].map((link) => (
              <Link key={link} className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em]" href="#">
                {link}
              </Link>
            ))}
            <Link className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em] flex items-center gap-3 bg-surface-container px-3 py-1 border-[2px] border-outline-variant" href="#">
              <div className="w-2 h-2 bg-primary-fixed shadow-[0_0_8px_var(--color-primary-fixed)] animate-pulse"></div>
              All Systems Operational
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
