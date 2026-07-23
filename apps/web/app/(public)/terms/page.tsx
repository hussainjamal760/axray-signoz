"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-fixed selection:text-black overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-background)_0%,_transparent_100%)] z-0"></div>

      {/* NotchNavBar */}
      <Navbar activePath="/terms" />

      <main className="relative z-10 pt-48 pb-24 px-margin max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
          <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
          Legal Information
        </div>
        <h1 className="font-headline-xl text-5xl md:text-7xl uppercase text-white font-black mb-12 tracking-tighter">
          Terms <span className="text-primary-fixed">Of Service</span>
        </h1>
        <div className="bg-surface-container border-[4px] border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
          <div className="prose prose-invert prose-lg max-w-none font-body-md text-on-surface-variant">
            <p className="font-bold text-white mb-6">Last updated: July 22, 2026</p>
            
            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">1. Acceptance of Terms</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">By accessing or using the AXRAY platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the platform or use any services. We reserve the right to modify these terms at any time.</p>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">2. Use License</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">Permission is granted to temporarily download one copy of the materials on AXRAY's website for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title. Under this license you may not:</p>
            <ul className="list-none space-y-4 mb-8">
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 bg-primary-fixed mt-2.5 shrink-0 border border-black shadow-[2px_2px_0px_0px_#000]"></span>
                <span className="font-medium text-lg text-white">Modify or copy the materials.</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 bg-primary-fixed mt-2.5 shrink-0 border border-black shadow-[2px_2px_0px_0px_#000]"></span>
                <span className="font-medium text-lg text-white">Use the materials for any commercial purpose, or for any public display (commercial or non-commercial).</span>
              </li>
              <li className="flex items-start gap-4">
                <span className="w-2 h-2 bg-primary-fixed mt-2.5 shrink-0 border border-black shadow-[2px_2px_0px_0px_#000]"></span>
                <span className="font-medium text-lg text-white">Attempt to decompile or reverse engineer any software contained on AXRAY's website.</span>
              </li>
            </ul>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">3. Telemetry and Data</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">You retain all rights to the telemetry data you send to AXRAY. By using the platform, you grant us a license to process, store, and display this data solely for the purpose of providing the service to you. We take security seriously and enforce strict isolation protocols.</p>

            <div className="h-[3px] w-full bg-outline-variant/30 my-10"></div>

            <h2 className="text-primary-fixed font-black uppercase tracking-widest text-xl mt-8 mb-4 border-b-[3px] border-black pb-2 inline-block bg-black px-4 pt-2 shadow-[4px_4px_0px_0px_theme(colors.primary-fixed)]">4. Limitation of Liability</h2>
            <p className="mt-6 mb-8 text-lg font-medium leading-relaxed">In no event shall AXRAY or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on the platform, even if AXRAY or an authorized representative has been notified orally or in writing of the possibility of such damage.</p>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
