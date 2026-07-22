"use client";

import { useState, useEffect, useRef } from "react";

type LogEntry = {
  id: string;
  text: string;
  type: "system" | "agent" | "axray" | "action" | "warning" | "error";
  code?: string;
};

const SEQUENCE: { delay: number; text: string; type: LogEntry["type"]; code?: string }[] = [
  { delay: 800, text: "Initializing AXRAY Session Recorder v2.0.0", type: "system" },
  { delay: 600, text: "Agent CodeGen-X4 connected. Goal: Fix Issue #42 'Auth token refresh loop'", type: "agent" },
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
  const [status, setStatus] = useState<"idle" | "running" | "analyzing" | "failed">("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startSimulation = () => {
    setStatus("running");
    setLogs([]);
    
    let currentDelay = 0;
    
    SEQUENCE.forEach((step, index) => {
      currentDelay += step.delay;
      setTimeout(() => {
        setLogs(prev => [...prev, { id: index.toString(), text: step.text, type: step.type, code: step.code }]);
        
        if (index === SEQUENCE.length - 1) {
          setStatus("analyzing");
          setTimeout(() => setStatus("failed"), 2500); // Wait for analysis
        }
      }, currentDelay);
    });
  };

  useEffect(() => {
    // Autoplay after 1 second
    const timer = setTimeout(() => {
      if (status === "idle") {
        startSimulation();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (scrollRef.current && (status === "running" || status === "analyzing")) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, status]);

  return (
    <div className="w-full h-full bg-background flex flex-col font-mono-label relative">
      {/* Terminal Header */}
      <div className="bg-surface-container-high border-b-[3px] border-black p-3 flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-error rounded-none border-[1px] border-black shadow-[1px_1px_0px_0px_#000]"></div>
          <div className="w-3 h-3 bg-primary-fixed rounded-none border-[1px] border-black shadow-[1px_1px_0px_0px_#000]"></div>
          <div className="w-3 h-3 bg-secondary rounded-none border-[1px] border-black shadow-[1px_1px_0px_0px_#000]"></div>
        </div>
        <div className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant flex items-center gap-2">
          <span className="w-2 h-2 bg-primary-fixed animate-pulse"></span>
          session_axray_291.log
        </div>
      </div>
      
      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-hide"
      >
        {logs.map((log) => (
          <div key={log.id} className="text-xs sm:text-sm animate-fade-in flex flex-col items-start gap-1">
            <div className="flex items-start gap-3 w-full">
              <span className="text-on-surface-variant opacity-50 shrink-0 select-none font-bold">
                [{new Date().toISOString().split('T')[1].slice(0,8)}]
              </span>
              <span className={`flex-1 font-medium leading-relaxed
                ${log.type === 'error' ? 'text-error bg-error/10 px-2 py-1 font-black border-l-[3px] border-error shadow-[2px_2px_0px_0px_theme(colors.error)] uppercase' : ''}
                ${log.type === 'warning' ? 'text-primary-fixed-dim' : ''}
                ${log.type === 'action' ? 'text-secondary-fixed' : ''}
                ${log.type === 'system' ? 'text-on-surface font-bold uppercase tracking-widest' : ''}
                ${log.type === 'agent' ? 'text-white' : ''}
                ${log.type === 'axray' ? 'text-primary-fixed font-bold' : ''}
              `}>
                {log.text}
              </span>
            </div>
          </div>
        ))}
        
        {(status === "running" || status === "analyzing") && (
          <div className="text-primary-fixed animate-pulse text-sm font-black mt-2">
            {status === "analyzing" ? "[AXRAY] Analyzing traces..." : "_"}
          </div>
        )}
      </div>

      {/* Root Cause Overlay (Shows on failure) */}
      {status === "failed" && (
        <div className="absolute inset-0 z-20 bg-background/95 border-[3px] border-black flex flex-col animate-fade-in m-4 shadow-[8px_8px_0px_0px_#000]">
          <div className="bg-error text-black border-b-[3px] border-black px-4 py-3 font-cta-label uppercase flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3 font-black tracking-widest">
              <span className="material-symbols-outlined text-lg">warning</span>
              Failure Analysis Report
            </div>
            <button 
              onClick={() => setStatus("idle")} 
              className="hover:text-white transition-colors flex items-center gap-2 font-black border-[2px] border-black px-2 py-1 bg-white hover:bg-black text-black text-[10px]"
            >
              <span className="material-symbols-outlined text-sm">replay</span> REPLAY
            </button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center">
            
            <div className="bg-surface-container border-[3px] border-black shadow-[4px_4px_0px_0px_#000] p-5 mb-6">
              <div className="flex items-center gap-2 mb-3 border-b-[2px] border-outline-variant pb-2">
                <span className="material-symbols-outlined text-primary-fixed">troubleshoot</span>
                <span className="font-mono-label text-xs font-black uppercase text-white tracking-widest">SigNoz MCP Diagnosis</span>
              </div>
              <p className="text-on-surface-variant text-sm font-medium leading-relaxed">
                Agent became trapped in a repetitive action loop editing <span className="text-primary-fixed bg-black px-1 font-bold">tests/mocks.ts</span>.
                The underlying failure is a missed export in <span className="text-white font-bold">src/lib/auth.ts</span> that caused the mock imports to fail.
              </p>
            </div>

            <div className="bg-black border-[3px] border-outline-variant p-4 text-xs font-mono-label relative">
              <div className="absolute -top-3 left-4 bg-primary-fixed text-black font-black uppercase px-2 text-[10px] border-[2px] border-black">
                Diff Snapshot (span_id: 8f4a2b)
              </div>
              <div className="text-error bg-error/10 px-2 py-1 mt-2">{"- export const refreshToken = async () => {...}"}</div>
              <div className="text-secondary-fixed bg-secondary-fixed/10 px-2 py-1 mt-1">{"+ const refreshToken = async () => {...} // Export missing"}</div>
            </div>
            
            <div className="mt-6 flex items-center gap-3 text-xs text-primary-fixed font-black uppercase tracking-widest bg-primary-fixed/10 p-3 border-[2px] border-primary-fixed">
              <span className="material-symbols-outlined text-lg animate-pulse">published_with_changes</span>
              Action: Revert diff and append hint to agent prompt.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
