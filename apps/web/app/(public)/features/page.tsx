"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function FeaturesPage() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-fixed selection:text-black overflow-hidden" ref={containerRef}>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-background)_0%,_transparent_100%)] z-0"></div>

      {/* NotchNavBar */}
      <Navbar activePath="/features" />

      <main className="relative z-10 pt-32 pb-24">
        {/* HERO SECTION */}
        <section className="px-margin max-w-[1600px] mx-auto min-h-[70vh] flex flex-col justify-center relative">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-5xl relative z-10"
          >
            <div className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
              <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
              Arsenal of Observability
            </div>

            <h1 className="font-headline-xl text-6xl md:text-[120px] leading-[0.85] text-white uppercase tracking-tighter font-black mb-8 relative">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-fixed to-secondary-fixed filter drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] stroke-black" style={{ WebkitTextStroke: "2px black" }}>Weapons-Grade</span>
              <span className="block mt-2">Telemetry.</span>
            </h1>

            <p className="font-body-md text-xl md:text-2xl text-on-surface-variant font-medium leading-relaxed max-w-3xl border-l-[4px] border-primary-fixed pl-6">
              AXRAY is not a dashboard. It is a flight recorder that intercepts, traces, and visualizes every autonomous decision your agents make in real-time.
            </p>
          </motion.div>

          {/* Massive background typography */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-5 select-none pointer-events-none hidden lg:block overflow-hidden">
            <h2 className="font-headline-xl text-[400px] leading-none tracking-tighter text-white whitespace-nowrap">
              FEATURES
            </h2>
          </div>
        </section>

        {/* SCROLLING MARQUEE */}
        <div className="w-full bg-primary-fixed border-y-[4px] border-black py-4 overflow-hidden relative z-20 my-24 rotate-[-1deg] scale-105 shadow-[0px_8px_0px_0px_#000]">
          <div className="animate-marquee whitespace-nowrap flex text-4xl font-headline-xl font-black text-black uppercase tracking-tighter">
            <span>FULL TRACE VISIBILITY • OPEN TELEMETRY NATIVE • FRAME-BY-FRAME REPLAY • LOGIC LOOP DETECTION • MCP INTERCEPTION • ZERO BLIND SPOTS • </span>
            <span>FULL TRACE VISIBILITY • OPEN TELEMETRY NATIVE • FRAME-BY-FRAME REPLAY • LOGIC LOOP DETECTION • MCP INTERCEPTION • ZERO BLIND SPOTS • </span>
          </div>
        </div>

        {/* FEATURES SHOWCASE */}
        <section className="px-margin max-w-[1400px] mx-auto space-y-40">

          {/* Feature 1 */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
            <div className="lg:w-1/2 space-y-6">
              <span className="font-mono-label text-4xl text-outline-variant font-black tracking-tighter block mb-2">01</span>
              <h2 className="font-headline-xl text-5xl md:text-7xl uppercase text-white tracking-tighter leading-[0.9] font-black">
                OpenTelemetry <br /><span className="text-secondary-fixed">Backbone</span>
              </h2>
              <p className="font-body-md text-on-surface-variant text-xl leading-relaxed">
                We don't reinvent the wheel. AXRAY binds directly into the OpenTelemetry ecosystem. Every tool invocation, LLM response, and memory lookup is emitted as a standard span, completely decoupling observability from your core logic.
              </p>
              <ul className="space-y-4 font-mono-label text-sm uppercase tracking-widest text-white/80 mt-8 border-t-[3px] border-outline-variant pt-8">
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary-fixed">check_box</span> Language Agnostic</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary-fixed">check_box</span> Zero Proprietary Lock-in</li>
                <li className="flex items-center gap-3"><span className="material-symbols-outlined text-secondary-fixed">check_box</span> Granular Span Attributes</li>
              </ul>
            </div>
            <motion.div style={{ y: y1 }} className="lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-secondary-fixed translate-x-4 translate-y-4 border-[3px] border-black transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
              <div className="relative bg-surface-container-high border-[3px] border-black p-8 aspect-square flex flex-col justify-center">
                <div className="font-mono text-sm text-secondary-fixed whitespace-pre overflow-x-auto">
                  {`{
  "trace_id": "8f4a2b9e1...",
  "span_id": "c73d9...",
  "name": "agent.tool.execute",
  "attributes": {
    "tool.name": "write_file",
    "tool.args": {
      "path": "/src/main.rs"
    },
    "llm.token_cost": 0.04
  }
}`}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 2 (Reversed) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-24 relative">
            <div className="lg:w-1/2 space-y-6">
              <span className="font-mono-label text-4xl text-outline-variant font-black tracking-tighter block mb-2 text-right">02</span>
              <h2 className="font-headline-xl text-5xl md:text-7xl uppercase text-white tracking-tighter leading-[0.9] font-black lg:text-right">
                SigNoz MCP <br /><span className="text-primary-fixed">Interception</span>
              </h2>
              <p className="font-body-md text-on-surface-variant text-xl leading-relaxed lg:text-right">
                Give your agents the power of sight. By exposing telemetry data back to the agent via the Model Context Protocol (MCP), AXRAY enables agents to detect when they are stuck in logic loops and dynamically correct their course mid-flight.
              </p>
            </div>
            <motion.div style={{ y: y2 }} className="lg:w-1/2 relative group">
              <div className="absolute inset-0 bg-primary-fixed -translate-x-4 translate-y-4 border-[3px] border-black transition-transform group-hover:-translate-x-6 group-hover:translate-y-6"></div>
              <div className="relative bg-black border-[3px] border-primary-fixed p-8 aspect-square flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,theme(colors.primary-fixed/5),theme(colors.primary-fixed/5)_10px,transparent_10px,transparent_20px)]"></div>
                <div className="relative z-10 w-48 h-48 border-[4px] border-primary-fixed rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite] shadow-[0px_0px_60px_rgba(220,238,0,0.2)]">
                  <span className="material-symbols-outlined text-[80px] text-primary-fixed animate-pulse">radar</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative">
            <div className="lg:w-1/2 space-y-6">
              <span className="font-mono-label text-4xl text-outline-variant font-black tracking-tighter block mb-2">03</span>
              <h2 className="font-headline-xl text-5xl md:text-7xl uppercase text-white tracking-tighter leading-[0.9] font-black">
                Frame-by-Frame <br /><span className="text-error">Replay</span>
              </h2>
              <p className="font-body-md text-on-surface-variant text-xl leading-relaxed">
                Debugging LLM behavior is fundamentally different from traditional software. AXRAY captures the exact prompt, response, memory context, and tool output at every step. Scrub through an agent's session exactly like a video player.
              </p>
            </div>
            <div className="lg:w-1/2 relative group w-full">
              <div className="absolute inset-0 bg-error translate-x-4 translate-y-4 border-[3px] border-black transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
              <div className="relative bg-surface-container-lowest border-[3px] border-black overflow-hidden flex flex-col h-80">
                {/* Fake UI Header */}
                <div className="h-10 bg-black border-b-[3px] border-black flex items-center px-4 gap-2">
                  <div className="w-3 h-3 rounded-full bg-error"></div>
                  <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
                  <div className="w-3 h-3 rounded-full bg-surface-variant"></div>
                  <div className="mx-auto font-mono-label text-[10px] text-error font-black uppercase tracking-widest">Session.Replay</div>
                </div>
                {/* Fake UI Body */}
                <div className="flex-1 p-6 flex flex-col justify-center items-center relative">
                  <div className="w-full max-w-sm border-[3px] border-black bg-surface p-4 relative shadow-[4px_4px_0px_0px_#000]">
                    <div className="h-2 w-3/4 bg-error mb-2"></div>
                    <div className="h-2 w-1/2 bg-outline-variant"></div>
                    <div className="absolute -right-6 -top-6 w-12 h-12 bg-primary-fixed border-[3px] border-black rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-black">play_arrow</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="px-margin max-w-[1200px] mx-auto mt-48 text-center relative z-20">
          <div className="bg-primary-fixed border-[4px] border-black p-12 md:p-24 shadow-[16px_16px_0px_0px_#000] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_100%)] opacity-0 group-hover:opacity-30 transition-opacity duration-700"></div>

            <h2 className="font-headline-xl text-5xl md:text-8xl uppercase text-black tracking-tighter leading-[0.9] font-black mb-8 relative z-10">
              Stop Guessing.<br />Start Tracing.
            </h2>

            <Link href="/sessions" className="inline-block relative z-10 bg-black text-primary-fixed border-[3px] border-black px-10 py-5 font-cta-label uppercase font-black text-lg tracking-widest transition-transform hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] active:translate-y-1 active:shadow-none">
              Initialize Dashboard
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
