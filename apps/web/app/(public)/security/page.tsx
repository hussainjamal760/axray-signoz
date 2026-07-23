"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-fixed selection:text-black overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-background)_0%,_transparent_100%)] z-0"></div>

      {/* NotchNavBar */}
      <Navbar activePath="/security" />

      <main className="relative z-10 pt-48 pb-24 px-margin max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
          <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
          Trust & Protection
        </div>
        <h1 className="font-headline-xl text-5xl md:text-7xl uppercase text-white font-black mb-12 tracking-tighter">
          Security <span className="text-primary-fixed">Architecture</span>
        </h1>
        <div className="bg-surface-container border-[4px] border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
          <div className="prose prose-invert prose-lg max-w-none font-body-md text-on-surface-variant">
            <p className="font-bold text-white mb-6">Built for zero-trust enterprise agent telemetry.</p>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">1. End-to-End Encryption</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">All telemetry spans, traces, and metrics transmitted to AXRAY are encrypted in transit using TLS 1.3. Data at rest in ClickHouse and SigNoz stores is protected with AES-256 encryption.</p>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">2. Strict Tenant Isolation</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">Each user workspace is logically separated at the database query layer. API keys generated for OpenTelemetry collectors are cryptographically signed and scoped strictly to your account workspace.</p>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">3. OAuth2 & Identity Security</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">We delegate user identity directly to GitHub OAuth2. We never store raw passwords or sensitive credentials on our servers, minimizing attack vectors.</p>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">4. Responsible Disclosure</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">If you discover a potential security vulnerability in AXRAY, please notify our team immediately at security@axray.dev. We investigate all legitimate reports promptly.</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
