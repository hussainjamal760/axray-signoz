"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useSession } from "@/features/sessions/hooks";
import { SessionHeader } from "@/features/sessions/components/SessionHeader";
import { AlertTriangle, ExternalLink } from "lucide-react";

export default function SigNozDashboardPage() {
  const params = useParams();
  const sessionId = typeof params?.id === "string" ? params.id : "";
  const { data: session } = useSession(sessionId);

  return (
    <main
      className="flex flex-col flex-1 h-full w-full relative z-10 bg-background"
      data-lenis-prevent="true"
    >
      <div className="flex-1 p-6 md:p-8 flex flex-col gap-6 h-full overflow-hidden">

        {/* Top Info Banner */}
        <div className="bg-primary-fixed/5 border border-primary-fixed/20 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary-fixed">dashboard_customize</span>
              Embedded SigNoz Dashboard
            </h2>
            <p className="text-sm text-on-surface-variant mt-1">
              Live telemetry and custom Query Builder panels from your self-hosted SigNoz instance.
            </p>
          </div>

          <a
            href="http://localhost:8080/dashboards" // Local SigNoz port 8080
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant/30 text-on-surface rounded-xl text-sm font-semibold transition-colors"
          >
            Open in SigNoz
            <ExternalLink className="w-4 h-4 text-primary-fixed" />
          </a>
        </div>

        {/* Embedded Iframe Container */}
        <div className="flex-1 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-3xl overflow-hidden relative shadow-sm group">
          {/* Iframe Overlay (prevents pointer events while scrolling if needed, but here we want interaction) */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-primary-fixed to-cyan-500 opacity-50"></div>

          <iframe
            src="http://localhost:8080/dashboards" // Local SigNoz port 8080
            className="w-full h-full border-0"
            title="SigNoz Dashboard"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          />

          {/* Fallback/Warning if iframe refuses to connect (X-Frame-Options) */}
          <div className="absolute bottom-4 right-4 max-w-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-black/80 backdrop-blur-md border border-white/10 p-3 rounded-xl flex items-start gap-3 shadow-xl">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-xs text-white/80 leading-relaxed">
                If the dashboard doesn't load, ensure your SigNoz instance allows embedding (adjust <code className="text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">X-Frame-Options</code>).
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
