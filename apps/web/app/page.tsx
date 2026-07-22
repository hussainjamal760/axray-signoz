"use client";

import Image from "next/image";
import Link from "next/link";
import HeroSimulator from "@/features/marketing/components/HeroSimulator";
import AgentBentoGrid from "@/features/marketing/components/AgentBentoGrid";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

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
    <div className="relative inline-block group">
      <div className="absolute inset-0 translate-x-2 translate-y-2 border-[3px] border-primary-fixed bg-transparent transition-transform group-hover:translate-x-3 group-hover:translate-y-3 group-active:translate-x-0 group-active:translate-y-0"></div>
      <Link
        href={isAuthenticated ? "/sessions" : "/auth"}
        className="relative flex h-14 md:h-16 items-center justify-center border-[3px] border-primary-fixed bg-background px-6 md:px-8 font-cta-label text-sm md:text-lg uppercase text-primary-fixed transition-all group-hover:-translate-x-1 group-hover:-translate-y-1 group-active:translate-x-0 group-active:translate-y-0 overflow-hidden"
      >
        <span className="absolute inset-0 -translate-y-full bg-primary-fixed transition-transform duration-300 ease-[cubic-bezier(0.87,0,0.13,1)] group-hover:translate-y-0"></span>
        <span className="relative z-10 flex items-center gap-3 font-black tracking-widest transition-colors duration-300 group-hover:text-black">
          {isAuthenticated ? "Access Sessions" : "Initialize Protocol"}
          <span className="material-symbols-outlined text-[20px] md:text-[24px] group-hover:rotate-90 group-hover:scale-110 transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]">
            rocket_launch
          </span>
        </span>
      </Link>
    </div>
  );

  return (
    <>
      {/* NotchNavBar */}
      <header className="sticky top-0 z-50 h-16 flex w-full pointer-events-none">
        
        {/* Left Side Bar - Flexible width */}
        <div className="flex-1 max-w-[20px] md:max-w-[120px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto">
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary-fixed" />
        </div>

        {/* Responsive Notch Container */}
        <div className="flex h-16 relative z-10 shrink-0 flex-1 pointer-events-auto">
          
          {/* Left Curve */}
          <div className="w-[30px] h-full relative shrink-0">
            <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V64 C15 64 15 40 0 40 Z')" }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
              <path d="M0 38.5 C15 38.5 15 62.5 30 62.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
            </svg>
          </div>

          {/* Center Content Area */}
          <div className="flex-1 h-full relative min-w-0 bg-background border-b-[3px] border-primary-fixed flex items-end justify-between pb-2.5 px-4 md:px-8">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <Image src="/logo/axray-logo.png" alt="AXRAY Logo" width={28} height={28} className="object-contain w-auto h-auto group-hover:rotate-12 transition-transform" />
              <span className="font-headline-lg text-lg font-black tracking-tighter text-white uppercase hidden sm:inline-block">AXRAY</span>
            </Link>

            {/* Links */}
            <div className="hidden lg:flex gap-6 items-center shrink-0">
              <Link className="text-primary-fixed font-cta-label underline decoration-3 underline-offset-8 transition-transform active:translate-x-[2px] active:translate-y-[2px]" href="#">Product</Link>
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="#">Features</Link>
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="#">How it Works</Link>
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="#">GitHub Integration</Link>
              <Link className="text-on-surface font-cta-label hover:text-primary-fixed transition-colors" href="#">Docs</Link>
            </div>

            {/* CTA */}
            <div className="shrink-0 flex items-center mb-1">
              {navCta}
            </div>
            
          </div>

          {/* Right Curve */}
          <div className="w-[30px] h-full relative shrink-0">
            <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V40 C15 40 15 64 0 64 Z')" }} />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
              <path d="M0 62.5 C15 62.5 15 38.5 30 38.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
            </svg>
          </div>
        </div>

        {/* Right Side Bar - Empty space */}
        <div className="flex-1 max-w-[20px] md:max-w-[120px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto">
          <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary-fixed" />
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="grid grid-cols-1 md:grid-cols-12 px-margin py-20 gap-gutter items-center">
          <div className="md:col-span-6 space-y-8">
            <div className="inline-block px-3 py-1 bg-secondary-container border-2 border-on-background">
              <span className="font-mono-label text-mono-label text-on-secondary-container uppercase tracking-widest">
                v2.0.0 - Live Observability
              </span>
            </div>
            <h1 className="font-headline-xl text-headline-xl md:text-[64px] md:leading-[68px] text-on-background">
              AI agents can write code. <br />
              <span className="text-primary-fixed">But who watches them fail?</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
              The Flight Recorder for AI Coding Agents. Record every decision, tool call, and trace. Bridge the gap between autonomous execution and human oversight.
            </p>
            <div className="flex flex-wrap gap-6 pt-4">
              {heroCta}
              <button className="bg-surface text-on-surface px-8 py-4 border-[3px] border-on-background font-cta-label text-lg uppercase hover:bg-surface-container-high transition-all">
                Watch Demo
              </button>
            </div>
          </div>
          <div className="md:col-span-6 relative">
            <div className="border-[3px] border-on-background bg-surface-container shadow-block relative aspect-video overflow-hidden flex flex-col">
              <HeroSimulator />
            </div>
            {/* Floating Card */}
            <div className="absolute -bottom-6 -left-6 border-[3px] border-on-background bg-surface-bright p-4 max-w-xs shadow-block hidden lg:block z-20">
              <p className="font-mono-label text-xs text-on-surface uppercase mb-2">Active Agent: CodeGen-X4</p>
              <div className="flex items-center gap-2 text-primary-fixed">
                <span className="material-symbols-outlined text-sm">terminal</span>
                <span className="font-mono-label text-xs">Writing: src/api/router.ts</span>
              </div>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="border-y-[3px] border-on-background bg-surface-container py-24">
          <div className="px-margin max-w-4xl mx-auto text-center space-y-8">
            <h2 className="font-headline-lg text-headline-lg uppercase text-on-background">The Black Box Problem</h2>
            <div className="w-24 h-1 bg-primary-fixed mx-auto"></div>
            <p className="font-body-md text-xl text-on-surface leading-relaxed">
              While AI agents are powerful enough to build entire features, their failures remain{" "}
              <span className="bg-primary-fixed text-on-primary px-1">opaque, frustrating, and expensive</span>. Without deep observability, a failed PR from an agent is just a wall of logs. We give you the &quot;flight recorder&quot; to see exactly where the logic drifted.
            </p>
          </div>
        </section>

        {/* Workflow Section */}
        <AgentBentoGrid />

        {/* Product Demo */}
        <section className="bg-surface-container-lowest border-y-[3px] border-on-background">
          <div className="px-margin py-24 max-w-7xl mx-auto">
            <div className="mb-12 space-y-4">
              <h2 className="font-headline-xl text-headline-xl uppercase">Full Replay Workspace</h2>
              <p className="font-body-md text-on-surface-variant max-w-2xl">
                High-fidelity replay of every shell command, file read, and thought process. Scrub through time to see how the agent evolved the codebase.
              </p>
            </div>
            <div className="border-[3px] border-on-background bg-background p-2 shadow-block overflow-hidden group">
              <div className="bg-surface-container-high border-b-2 border-on-background p-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <div className="w-3 h-3 bg-error"></div>
                  <div className="w-3 h-3 bg-primary-fixed"></div>
                  <div className="w-3 h-3 bg-secondary"></div>
                </div>
                <div className="font-mono-label text-xs uppercase opacity-60">replay_session_772.abb</div>
              </div>
              <div
                className="aspect-video w-full bg-cover bg-center grayscale group-hover:grayscale-0 transition-all duration-700"
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCBgA7rSbLBqrsEzRQ4QQmOq8_vYe9vHgXoa4Br_ugULZwYrwMGw-yo5IEYGIJ3lNJjfH-f-8WGtWhfQ8gdlAVC2HeHsfWUXj9XeDvvt-YhvPU21FqxskI3a9tBUlfhU84dxvzx38m4KHESZqS3bsur_76jJxCHZ46wa72WISmutUcknKePpM-6Zpkmuq4mom6U6VzMSJFn8fjewAyRsxBlt5pY_w0k747mIXjxXNRd58IM6AJyhMeyU5FvuWurxCYc0sqG8UJX3AQH')" }}
              ></div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="px-margin py-24 max-w-7xl mx-auto">
          <h2 className="font-headline-lg text-headline-lg uppercase mb-12">Engineered for Reliability</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            {/* Card 1 */}
            <div className="border-2 border-on-background p-8 bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-fixed group-hover:scale-110 transition-transform">replay</span>
                <span className="font-mono-label text-xs border-2 border-on-background px-2 py-1 bg-background">OBS-01</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-4">Agent Replay</h3>
              <p className="font-body-md text-on-surface-variant">See every action your coding agent took in a frame-by-frame scrubbing interface. No more guessing what the agent did while you were away.</p>
            </div>
            {/* Card 2 */}
            <div className="border-2 border-on-background p-8 bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-fixed group-hover:scale-110 transition-transform">insights</span>
                <span className="font-mono-label text-xs border-2 border-on-background px-2 py-1 bg-background">OBS-02</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-4">Trace Intelligence</h3>
              <p className="font-body-md text-on-surface-variant">Deep observability for LLM workflows using OpenTelemetry standards. Map LLM calls to their resulting file system changes automatically.</p>
            </div>
            {/* Card 3 */}
            <div className="border-2 border-on-background p-8 bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-fixed group-hover:scale-110 transition-transform">search</span>
                <span className="font-mono-label text-xs border-2 border-on-background px-2 py-1 bg-background">OBS-03</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-4">Failure Analysis</h3>
              <p className="font-body-md text-on-surface-variant">Automatic root cause identification. We pinpoint whether a failure was due to context limits, tool timeout, or logic loops.</p>
            </div>
            {/* Card 4 */}
            <div className="border-2 border-on-background p-8 bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-fixed group-hover:scale-110 transition-transform">difference</span>
                <span className="font-mono-label text-xs border-2 border-on-background px-2 py-1 bg-background">OBS-04</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-4">Code Diff History</h3>
              <p className="font-body-md text-on-surface-variant">Crisp, side-by-side verification. Inspect code generation history as a series of incremental diffs rather than massive PR dumps.</p>
            </div>
            {/* Card 5 */}
            <div className="border-2 border-on-background p-8 bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-fixed group-hover:scale-110 transition-transform">payments</span>
                <span className="font-mono-label text-xs border-2 border-on-background px-2 py-1 bg-background">OBS-05</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-4">Cost Monitoring</h3>
              <p className="font-body-md text-on-surface-variant">Track token usage per agent turn. See the real-time ROI and dollar cost of every autonomous coding session.</p>
            </div>
            {/* Card 6 */}
            <div className="border-2 border-on-background p-8 bg-surface-container hover:bg-surface-container-high transition-colors group cursor-pointer">
              <div className="flex items-start justify-between mb-6">
                <span className="material-symbols-outlined text-4xl text-primary-fixed group-hover:scale-110 transition-transform">hub</span>
                <span className="font-mono-label text-xs border-2 border-on-background px-2 py-1 bg-background">OBS-06</span>
              </div>
              <h3 className="font-headline-lg-mobile text-headline-lg-mobile uppercase mb-4">GitHub Integration</h3>
              <p className="font-body-md text-on-surface-variant">Native PR workflows. Review agent traces directly from the GitHub interface without ever leaving your development flow.</p>
            </div>
          </div>
        </section>

        {/* GitHub Workflow */}
        <section className="bg-primary-fixed text-on-primary border-t-[3px] border-on-background py-24 overflow-hidden relative">
          <div className="absolute right-0 top-0 opacity-10 select-none pointer-events-none">
            <span className="font-headline-xl text-[150px] leading-none uppercase block animate-float-bg">
              SIGNOZ<br />WE_MAKE_DEVS
            </span>
          </div>
          <div className="px-margin relative z-10 max-w-7xl mx-auto">
            <h2 className="font-headline-xl text-headline-xl uppercase mb-16 max-w-2xl">The Automated Review Cycle</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
              <div className="space-y-4">
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile border-b-2 border-on-primary pb-2">01. Connect</h4>
                <p className="font-body-md font-bold">Connect your repository and define agent scopes.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile border-b-2 border-on-primary pb-2">02. Execute</h4>
                <p className="font-body-md font-bold">Agent identifies issues and begins coding session.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile border-b-2 border-on-primary pb-2">03. Trace</h4>
                <p className="font-body-md font-bold">AXRAY captures every turn and tool call in detail.</p>
              </div>
              <div className="space-y-4">
                <h4 className="font-headline-lg-mobile text-headline-lg-mobile border-b-2 border-on-primary pb-2">04. Review</h4>
                <p className="font-body-md font-bold">Review code diffs alongside full logical traces.</p>
              </div>
            </div>
            <div className="mt-16">
              <button className="bg-background text-primary-fixed border-[3px] border-on-background px-10 py-6 font-cta-label text-xl uppercase shadow-block shadow-block-hover transition-all">
                Get Started for Free
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-surface-container dark:bg-surface-container border-t-[3px] border-on-background">
        <div className="flex flex-col md:flex-row justify-between items-center w-full px-margin py-8 gap-gutter max-w-full mx-auto">
          <div className="flex flex-col gap-4 items-center md:items-start">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo/axray-logo.png"
                alt="AXRAY Logo"
                width={24}
                height={24}
                className="object-contain w-auto h-auto"
              />
              <span className="font-headline-lg-mobile text-headline-lg-mobile font-black text-on-surface uppercase">
                AXRAY
              </span>
            </Link>
            <p className="font-mono-label text-mono-label text-on-surface-variant">
              © 2026 AXRAY. Built for the machine era.
            </p>
          </div>
          <div className="flex gap-8 flex-wrap justify-center">
            <Link className="text-on-surface-variant font-mono-label text-mono-label hover:underline hover:text-primary-fixed transition-all uppercase" href="#">
              Terms
            </Link>
            <Link className="text-on-surface-variant font-mono-label text-mono-label hover:underline hover:text-primary-fixed transition-all uppercase" href="#">
              Privacy
            </Link>
            <Link className="text-on-surface-variant font-mono-label text-mono-label hover:underline hover:text-primary-fixed transition-all uppercase" href="#">
              Security
            </Link>
            <Link className="text-on-surface-variant font-mono-label text-mono-label hover:underline hover:text-primary-fixed transition-all uppercase" href="#">
              Changelog
            </Link>
            <Link className="text-on-surface-variant font-mono-label text-mono-label hover:underline hover:text-primary-fixed transition-all uppercase flex items-center gap-2" href="#">
              <div className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></div> Status
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
