"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export default function ChangelogPage() {
  const updates = [
    {
      version: "v1.2.0",
      date: "July 22, 2026",
      tag: "Major Release",
      tagColor: "bg-primary-fixed text-black",
      items: [
        "Added real-time agent execution timeline simulator",
        "Integrated SigNoz OpenTelemetry ClickHouse query engine",
        "Implemented flight recorder scrubbing controls for LLM tool call spans",
        "Updated Brutalist Neobrutalism design system tokens"
      ]
    },
    {
      version: "v1.1.0",
      date: "July 15, 2026",
      tag: "Feature Update",
      tagColor: "bg-secondary-fixed text-black",
      items: [
        "GitHub OAuth2 single sign-on authentication flow",
        "Added live session search & status filtering (Active, Failed, Completed)",
        "Improved token cost and latency aggregation graphs"
      ]
    },
    {
      version: "v1.0.0",
      date: "July 01, 2026",
      tag: "Initial Launch",
      tagColor: "bg-surface-container text-white border-[2px] border-outline-variant",
      items: [
        "Initial release for WeMakeDevs Track 01 Hackathon",
        "Basic span ingestion pipeline via OTel Collector",
        "Session detail view with tree & list trace visualization"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary-fixed selection:text-black overflow-hidden">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0" style={{ backgroundImage: "linear-gradient(var(--color-primary-fixed) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary-fixed) 1px, transparent 1px)", backgroundSize: "64px 64px" }}></div>
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--color-background)_0%,_transparent_100%)] z-0"></div>

      {/* NotchNavBar */}
      <Navbar activePath="/changelog" />

      <main className="relative z-10 pt-48 pb-24 px-margin max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-3 font-mono-label text-primary-fixed text-xs font-black uppercase tracking-[0.3em] mb-6 border-[2px] border-primary-fixed px-3 py-1 bg-primary-fixed/10">
          <div className="w-1.5 h-1.5 bg-primary-fixed animate-ping"></div>
          Release Notes
        </div>
        <h1 className="font-headline-xl text-5xl md:text-7xl uppercase text-white font-black mb-12 tracking-tighter">
          Platform <span className="text-primary-fixed">Changelog</span>
        </h1>

        <div className="space-y-12">
          {updates.map((update, idx) => (
            <div key={idx} className="bg-surface-container border-[4px] border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_#000]">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b-[3px] border-black">
                <div className="flex items-center gap-4">
                  <span className="font-headline-lg text-3xl font-black text-white">{update.version}</span>
                  <span className={`px-3 py-1 text-xs font-mono-label font-black uppercase tracking-widest ${update.tagColor}`}>
                    {update.tag}
                  </span>
                </div>
                <span className="font-mono-label text-xs text-on-surface-variant font-bold uppercase tracking-widest">
                  {update.date}
                </span>
              </div>

              <ul className="space-y-4">
                {update.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-4">
                    <span className="w-2 h-2 bg-primary-fixed mt-2.5 shrink-0 border border-black shadow-[2px_2px_0px_0px_#000]"></span>
                    <span className="font-body-md text-lg font-medium text-on-surface">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
