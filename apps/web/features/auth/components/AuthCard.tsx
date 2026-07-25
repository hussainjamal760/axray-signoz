"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { GithubLogo } from "@phosphor-icons/react";
import { startGithubAuth } from "../api/auth.api";
import { Navbar } from "@/components/layout/Navbar";
import { Rocket, ShieldCheck, Terminal, Sparkles, Activity, CheckCircle2, Lock, Cpu } from "lucide-react";

export const AuthCard = () => {
  return (
    <div className="min-h-screen w-full bg-background text-on-background font-sans relative overflow-hidden flex flex-col justify-between" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
      
      {/* Top Navbar */}
      <Navbar activePath="/auth" isSticky={true} />

      {/* Background Glows & Mesh */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-fixed/10 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-secondary-fixed/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10 my-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Hero Brand & Info Section */}
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            
            {/* Live Telemetry Badge */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-surface-container-lowest/80 border border-outline-variant/30 rounded-full backdrop-blur-md shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary-fixed">
                AXRAY AUTH PROTOCOL
              </span>
              <span className="text-outline-variant/50">|</span>
              <span className="text-xs font-mono text-on-surface-variant">v1.0.0</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white uppercase leading-[1.08]">
              AUTHENTICATE <br />
              <span className="text-on-surface-variant/60 font-semibold">YOUR FLIGHT</span> <br />
              <span className="inline-block mt-2 px-4 py-1 bg-primary-fixed/15 text-primary-fixed border border-primary-fixed/30 rounded-2xl shadow-[0_0_25px_rgba(220,238,0,0.15)]">
                RECORDER.
              </span>
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-on-surface-variant/90 max-w-xl font-medium leading-relaxed">
              Connect your GitHub workspace to unlock live trace execution, OpenTelemetry streams, and real-time agent debugging with <strong className="text-white">SigNoz</strong> integration.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-lowest/50 border border-outline-variant/20 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-primary-fixed/10 text-primary-fixed mt-0.5">
                  <Terminal size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">Zero-Config Tracing</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Instant OTel instrumentation for LLM call stacks.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-xl bg-surface-container-lowest/50 border border-outline-variant/20 backdrop-blur-sm">
                <div className="p-2 rounded-lg bg-primary-fixed/10 text-primary-fixed mt-0.5">
                  <Cpu size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wide">SigNoz Engine</h4>
                  <p className="text-xs text-on-surface-variant mt-0.5">Deep telemetry, latency breakdowns & root cause metrics.</p>
                </div>
              </div>
            </div>

            {/* Event Sponsor Badges */}
            <div className="pt-6 border-t border-outline-variant/20 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary-fixed animate-pulse" />
                <span className="text-xs font-mono font-bold text-primary-fixed uppercase tracking-widest">
                  OFFICIAL INTEGRATIONS
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* WeMakeDevs Highlighted Badge */}
                <div className="group relative bg-surface-container-lowest border border-primary-fixed/40 hover:border-primary-fixed rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-xl shadow-[0_0_20px_rgba(220,238,0,0.1)] hover:shadow-[0_0_25px_rgba(220,238,0,0.25)] transition-all duration-300">
                  <div className="bg-white p-1 rounded-lg border border-black/10 flex items-center justify-center">
                    <Image src="/logo/wemakedev.jpg" alt="WeMakeDevs" width={90} height={28} className="h-6 w-auto object-contain rounded" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white uppercase tracking-tight">WeMakeDevs</span>
                    <span className="text-[10px] font-mono text-primary-fixed font-semibold">TRACK 01 PARTNER</span>
                  </div>
                </div>

                {/* SigNoz Highlighted Badge */}
                <div className="group relative bg-surface-container-lowest border border-primary-fixed/40 hover:border-primary-fixed rounded-2xl px-4 py-2.5 flex items-center gap-3 backdrop-blur-xl shadow-[0_0_20px_rgba(220,238,0,0.1)] hover:shadow-[0_0_25px_rgba(220,238,0,0.25)] transition-all duration-300">
                  <div className="bg-white p-1 rounded-lg border border-black/10 flex items-center justify-center">
                    <Image src="/logo/signoz.jpg" alt="SigNoz" width={80} height={26} className="h-6 w-auto object-contain rounded" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white uppercase tracking-tight">SigNoz Engine</span>
                    <span className="text-[10px] font-mono text-primary-fixed font-semibold">POWERED BY SIGNOZ</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right Card Glassmorphic Box */}
          <div className="lg:col-span-5 relative">
            <div className="relative bg-surface-container-lowest/70 backdrop-blur-2xl border border-outline-variant/40 rounded-3xl p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden group">
              
              {/* Subtle top border highlight glow */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-primary-fixed/50 to-transparent" />

              <div className="flex flex-col items-center text-center space-y-6">
                
                {/* Icon Header */}
                <div className="w-16 h-16 rounded-2xl bg-primary-fixed/10 border border-primary-fixed/30 flex items-center justify-center text-primary-fixed shadow-[0_0_30px_rgba(220,238,0,0.2)]">
                  <Lock size={32} />
                </div>

                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
                    Developer Portal
                  </h2>
                  <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">
                    SECURE OAUTH 2.0 PROTOCOL
                  </p>
                </div>

                {/* Main Auth Button */}
                <button
                  onClick={startGithubAuth}
                  className="w-full relative group/btn overflow-hidden rounded-2xl bg-primary-fixed hover:bg-primary-fixed/95 text-black font-extrabold py-4 px-6 shadow-[0_0_30px_rgba(220,238,0,0.3)] hover:shadow-[0_0_40px_rgba(220,238,0,0.5)] transition-all duration-300 flex items-center justify-center gap-3 uppercase tracking-wider text-base hover:-translate-y-0.5 active:translate-y-0"
                >
                  <GithubLogo weight="fill" className="w-6 h-6 shrink-0 transition-transform group-hover/btn:scale-110" />
                  <span>Continue with GitHub</span>
                </button>

                {/* Security Trust Badges */}
                <div className="w-full pt-4 space-y-2.5 border-t border-outline-variant/20 text-left">
                  <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                    <CheckCircle2 size={14} className="text-primary-fixed shrink-0" />
                    <span>Read-only repository metadata access</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                    <CheckCircle2 size={14} className="text-primary-fixed shrink-0" />
                    <span>Encrypted OTel session key generation</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant">
                    <ShieldCheck size={14} className="text-primary-fixed shrink-0" />
                    <span>SOC2 & OpenTelemetry compliant</span>
                  </div>
                </div>

                {/* Terms Footer */}
                <p className="text-[11px] font-mono text-on-surface-variant/60 uppercase tracking-wider pt-2">
                  By continuing, you accept our{" "}
                  <Link href="/terms" className="text-primary-fixed hover:underline font-bold">
                    Terms
                  </Link>{" "}
                  &{" "}
                  <Link href="/privacy" className="text-primary-fixed hover:underline font-bold">
                    Privacy
                  </Link>
                </p>

              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Bar */}
      <footer className="relative z-10 border-t border-outline-variant/20 py-4 px-6 bg-surface-container-lowest/40 backdrop-blur-md">
        <div className="max-w-[1500px] mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-mono text-on-surface-variant/60 uppercase tracking-widest">
          <div>© 2026 AXRAY OBSERVABILITY PLATFORM</div>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-primary-fixed transition-colors">Home</Link>
            <Link href="/features" className="hover:text-primary-fixed transition-colors">Features</Link>
            <Link href="/security" className="hover:text-primary-fixed transition-colors">Security</Link>
          </div>
        </div>
      </footer>

    </div>
  );
};

