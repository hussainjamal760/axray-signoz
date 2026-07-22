"use client";

import Link from "next/link";
import Image from "next/image";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export default function ChangelogPage() {
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

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-fixed selection:text-black overflow-hidden">
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
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="/how-it-works">How it Works</Link>
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

      <main className="relative z-10 pt-48 pb-24 px-margin max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
          <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
          Release Notes
        </div>
        <h1 className="font-headline-xl text-5xl md:text-7xl uppercase text-white font-black mb-12 tracking-tighter">
          Change<span className="text-primary-fixed">log</span>
        </h1>
        <div className="bg-surface-container border-[4px] border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
          <div className="prose prose-invert prose-lg max-w-none font-body-md text-on-surface-variant">
            
            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-4 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">v1.0.0 — Initial Release</h2>
            <div className="flex items-center gap-3 mb-6 mt-4">
              <span className="bg-primary-fixed text-black font-mono-label text-[10px] font-black uppercase tracking-widest px-2 py-1">July 22, 2026</span>
              <span className="text-white font-bold text-sm bg-black px-2 py-1 border border-primary-fixed">MAJOR</span>
            </div>
            <ul className="list-none space-y-4 mb-8">
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-fixed mt-1">add_box</span>
                <span className="font-medium text-lg text-white">Launched the AXRAY platform for WeMakeDevs Track 01.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-fixed mt-1">add_box</span>
                <span className="font-medium text-lg text-white">Full integration with SigNoz Cloud and OpenTelemetry.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-fixed mt-1">add_box</span>
                <span className="font-medium text-lg text-white">Introduced frame-by-frame Agent Replay interface.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary-fixed mt-1">add_box</span>
                <span className="font-medium text-lg text-white">Native GitHub authentication and session tracking.</span>
              </li>
            </ul>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-outline-variant font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.outline-variant)]">v0.9.0 — Beta</h2>
            <div className="flex items-center gap-3 mb-6 mt-4">
              <span className="bg-outline-variant text-black font-mono-label text-[10px] font-black uppercase tracking-widest px-2 py-1">July 10, 2026</span>
              <span className="text-white font-bold text-sm bg-black px-2 py-1 border border-outline-variant">MINOR</span>
            </div>
            <ul className="list-none space-y-4 mb-8">
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 bg-outline-variant mt-2.5 shrink-0 border border-black"></span>
                <span className="font-medium text-lg">Initial backend schema setup in ClickHouse.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 bg-outline-variant mt-2.5 shrink-0 border border-black"></span>
                <span className="font-medium text-lg">Implemented the brutalist UI design system.</span>
              </li>
            </ul>

          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="border-t-[4px] border-black bg-surface relative z-30 py-12 md:py-16 mt-24">
        <div className="px-margin max-w-[1600px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="flex items-center gap-3 shrink-0 group">
              <Image src="/logo/axray-logo.png" alt="AXRAY Logo" width={32} height={32} className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform" />
              <span className="font-headline-lg-mobile text-2xl font-black text-white uppercase tracking-tighter">AXRAY</span>
            </Link>
            <p className="font-mono-label text-xs text-on-surface-variant font-bold uppercase tracking-widest max-w-xs text-center md:text-left">
              © 2026 AXRAY. Built for the machine era by WeMakeDevs Track 01.
            </p>
          </div>

          <div className="flex gap-x-8 gap-y-4 flex-wrap justify-center">
            {['Terms', 'Privacy', 'Security', 'Changelog'].map((link) => (
              <Link key={link} className="text-on-surface font-mono-label text-xs font-black hover:text-primary-fixed transition-colors uppercase tracking-[0.2em]" href={`/${link.toLowerCase()}`}>
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
