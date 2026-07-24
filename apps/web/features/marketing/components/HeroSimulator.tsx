"use client";

import { useState } from "react";
import { Terminal as TerminalIcon, AlertTriangle, RotateCcw, Activity, CheckCircle2, ShieldAlert } from "lucide-react";

type LogEntry = {
  id: string;
  text: string;
  type: "system" | "agent" | "axray" | "action" | "warning" | "error";
  code?: string;
};

const SEQUENCE: { delay: number; text: string; type: LogEntry["type"]; code?: string }[] = [
  { delay: 800, text: "Initializing AXRAY Session Recorder v2.0.0", type: "system" },
  { delay: 600, text: "Agent AXRAY connected. Goal: Fix Issue #42 'Auth token refresh loop'", type: "agent" },
  { delay: 1000, text: "[AXRAY] OpenTelemetry tracing attached to agent workspace.", type: "axray" },
  { delay: 1200, text: "> Tool: read_file('src/lib/auth.ts')", type: "action" },
  { delay: 1500, text: "> Tool: write_file('src/lib/auth.ts')", type: "action" },
  { delay: 500, text: "[AXRAY] Diff snapshot captured (span_id: 8f4a2b).", type: "axray" },
  { delay: 1200, text: "> Tool: run_command('npm run test:auth')", type: "action" },
  { delay: 2000, text: "Command output: 1 failing test. (Timeout 5000ms)", type: "warning" },
  { delay: 1500, text: "Thinking: The test mocks are outdated. I should update 'tests/mocks.ts'.", type: "agent" },
  { delay: 1200, text: "> Tool: write_file('tests/mocks.ts')", type: "action" },
  { delay: 1200, text: "> Tool: run_command('npm run test:auth')", type: "action" },
  { delay: 2000, text: "Command output: 1 failing test. (Timeout 5000ms)", type: "warning" },
  { delay: 1500, text: "Thinking: The test mocks are outdated. I should update 'tests/mocks.ts'.", type: "agent" },
  { delay: 800, text: "[AXRAY] TRACE ALARM: LOGIC_LOOP_DETECTED", type: "error" },
  { delay: 1000, text: "[AXRAY] Halting agent. Querying SigNoz MCP Server for trace analysis...", type: "axray" }
];

export default function HeroSimulator() {
  const [replayKey, setReplayKey] = useState(0);

  const sequenceWithDelays = SEQUENCE.map((step, i, arr) => {
    const cumulativeDelay = arr.slice(0, i + 1).reduce((sum, s) => sum + (s.delay * 0.4), 0);
    return { ...step, cumulativeDelay: cumulativeDelay + 400 };
  });

  const totalDuration = sequenceWithDelays[sequenceWithDelays.length - 1].cumulativeDelay;

  return (
    <div key={replayKey} className="w-full h-full bg-[#0c0d0e] flex flex-col font-mono relative rounded-3xl overflow-hidden border border-outline-variant/30 shadow-2xl">
      {/* Terminal Header */}
      <div className="bg-[#141618] border-b border-outline-variant/20 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex gap-2 items-center">
          <div className="w-3 h-3 bg-red-500/80 rounded-full border border-red-400/40"></div>
          <div className="w-3 h-3 bg-yellow-500/80 rounded-full border border-yellow-400/40"></div>
          <div className="w-3 h-3 bg-emerald-500/80 rounded-full border border-emerald-400/40"></div>
        </div>
        <div className="text-[11px] font-semibold tracking-wider text-on-surface-variant flex items-center gap-2">
          <Activity size={13} className="text-primary-fixed animate-pulse" />
          <span>session_axray_291.log</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 p-5 overflow-y-auto space-y-3 custom-scrollbar flex flex-col justify-end text-xs">
        {sequenceWithDelays.map((log, index) => (
          <div
            key={index}
            className="flex items-start gap-3 opacity-0 font-mono"
            style={{
              animation: `fade-in-up 0.3s ease-out forwards`,
              animationDelay: `${log.cumulativeDelay}ms`
            }}
          >
            <span className="text-on-surface-variant/40 shrink-0 select-none text-[10px]">
              00:{(index * 2).toString().padStart(2, '0')}
            </span>
            <span className={`flex-1 leading-relaxed rounded-md px-2 py-0.5 text-xs ${
              log.type === 'error' ? 'text-red-400 bg-red-500/10 font-bold border border-red-500/20 shadow-[0_0_12px_rgba(239,68,68,0.15)]' :
              log.type === 'warning' ? 'text-amber-300 bg-amber-500/10 border border-amber-500/20' :
              log.type === 'action' ? 'text-cyan-300 font-medium' :
              log.type === 'system' ? 'text-white/90 font-bold tracking-wide uppercase text-[10px] bg-white/5 border border-white/10 w-max px-2' :
              log.type === 'agent' ? 'text-white' :
              'text-primary-fixed font-semibold'
            }`}>
              {log.text}
            </span>
          </div>
        ))}
      </div>

      {/* Fully Opaque Failure Report Overlay (No Overlapping Bleed) */}
      <div
        className="absolute inset-0 z-30 bg-[#0c0d0e] flex flex-col shadow-2xl opacity-0 pointer-events-none overflow-hidden"
        style={{
          animation: `fade-in-scale 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards`,
          animationDelay: `${totalDuration + 600}ms`
        }}
      >
        {/* Modal Header */}
        <div className="bg-[#181a1d] border-b border-red-500/30 px-5 py-3.5 flex justify-between items-center shrink-0 pointer-events-auto">
          <div className="flex items-center gap-2.5 font-bold text-red-400 text-xs tracking-wider uppercase">
            <ShieldAlert size={16} className="text-red-500" />
            <span>Failure Analysis Report</span>
          </div>
          <button
            onClick={() => setReplayKey(k => k + 1)}
            className="hover:bg-primary-fixed hover:text-black text-primary-fixed transition-all duration-200 flex items-center gap-1.5 font-bold border border-primary-fixed/40 rounded-xl px-3 py-1 text-[11px] shadow-sm"
          >
            <RotateCcw size={13} /> Replay Session
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center pointer-events-auto space-y-4">
          <div className="bg-[#141619] border border-outline-variant/30 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2.5 pb-2 border-b border-outline-variant/20">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
              <span className="font-mono text-[11px] font-bold text-primary-fixed uppercase tracking-wider">SigNoz MCP Diagnosis</span>
            </div>
            <p className="text-on-surface-variant text-xs leading-relaxed">
              Agent trapped in repetitive loop editing <span className="text-primary-fixed font-mono bg-primary-fixed/10 px-1.5 py-0.5 rounded border border-primary-fixed/20">tests/mocks.ts</span>.
              Root cause: missing export in <span className="text-white font-semibold font-mono">src/lib/auth.ts</span> causing mock import failure.
            </p>
          </div>

          <div className="bg-[#050606] rounded-2xl border border-outline-variant/20 p-3.5 text-[11px] font-mono space-y-1">
            <div className="text-red-400 bg-red-500/10 px-2.5 py-1 rounded-lg border border-red-500/20">- export const refreshToken = async () =&gt; &#123;...&#125;</div>
            <div className="text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">+ const refreshToken = async () =&gt; &#123;...&#125; // Export missing</div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-primary-fixed font-semibold bg-primary-fixed/10 p-3.5 rounded-2xl border border-primary-fixed/20 shadow-sm">
            <CheckCircle2 size={16} className="text-primary-fixed shrink-0" />
            <span>Automated Action: Reverted diff & appended hint to agent prompt.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
