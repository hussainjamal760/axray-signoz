"use client";

import { useState, useEffect, useRef } from "react";

type LogEntry = {
  id: string;
  text: string;
  type: "info" | "action" | "error" | "warning";
};

const SEQUENCE = [
  { delay: 1000, text: "Cloning repo 'math-lib'...", type: "info" },
  { delay: 800, text: "Agent (CodeGen-X4) executing...", type: "info" },
  { delay: 1200, text: "> Tool: write_file('src/math.ts')", type: "action" },
  { delay: 800, text: "> Run: tests -> FAILED", type: "warning" },
  { delay: 1200, text: "TRACE_ERR: LOGIC_LOOP_DETECTED", type: "error" }
];

export default function HeroSimulator() {
  const [status, setStatus] = useState<"idle" | "running" | "failed">("idle");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const startSimulation = () => {
    setStatus("running");
    setLogs([]);
    
    let currentDelay = 0;
    
    SEQUENCE.forEach((step, index) => {
      currentDelay += step.delay;
      setTimeout(() => {
        setLogs(prev => [...prev, { id: index.toString(), text: step.text, type: step.type as any }]);
        if (index === SEQUENCE.length - 1) {
          setTimeout(() => setStatus("failed"), 1000); // Wait 1 sec before showing error overlay
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
    if (scrollRef.current && status === "running") {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, status]);

  return (
    <div className="w-full h-full bg-background flex flex-col font-mono-label relative">
      {/* Terminal Header */}
      <div className="bg-surface-container-high border-b-2 border-on-background p-3 flex items-center justify-between shrink-0">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-error rounded-full"></div>
          <div className="w-3 h-3 bg-primary-fixed rounded-full"></div>
          <div className="w-3 h-3 bg-secondary rounded-full"></div>
        </div>
        <div className="text-xs uppercase opacity-60">session_axray_291.log</div>
      </div>
      
      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        className="flex-1 p-4 overflow-y-auto space-y-3"
      >
        {logs.map((log) => (
          <div key={log.id} className="text-xs sm:text-sm animate-fade-in flex items-start gap-3">
            <span className="text-on-surface-variant opacity-40 shrink-0 select-none">
              [{new Date().toISOString().split('T')[1].slice(0,8)}]
            </span>
            <span className={`
              ${log.type === 'error' ? 'text-error bg-error/10 px-2 py-1 font-bold border-l-2 border-error' : ''}
              ${log.type === 'warning' ? 'text-primary-fixed-dim' : ''}
              ${log.type === 'action' ? 'text-secondary-fixed' : ''}
              ${log.type === 'info' ? 'text-on-surface' : ''}
            `}>
              {log.text}
            </span>
          </div>
        ))}
        
        {status === "running" && (
          <div className="text-primary-fixed animate-pulse text-sm">_</div>
        )}
      </div>

      {/* Root Cause Overlay (Shows on failure) */}
      {status === "failed" && (
        <div className="absolute inset-0 z-20 bg-background/90 backdrop-blur-md border-t-2 border-on-background flex flex-col animate-fade-in">
          <div className="bg-error text-on-error px-4 py-2 font-cta-label uppercase flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">warning</span>
              Failure Analysis Complete
            </div>
            <button 
              onClick={() => setStatus("idle")} 
              className="hover:text-background transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">replay</span> Replay
            </button>
          </div>
          <div className="flex-1 p-5 overflow-y-auto">
            <p className="text-on-surface text-sm mb-4">
              Agent got stuck in a logical loop trying to fix <span className="text-primary-fixed bg-primary-fixed/10 px-1">src/math.ts</span> because it failed to read the test mock file.
            </p>
            <div className="bg-surface-container border border-on-background p-3 mb-4 text-xs font-mono-label">
              <div className="text-on-surface-variant mb-2">Code Diff Snapshot:</div>
              <div className="text-error bg-error/10 px-1">{"- import { mockData } from \"./test-utils\";"}</div>
              <div className="text-secondary-fixed bg-secondary-fixed/10 px-1">{"+ import { mockData } from \"../test-utils\"; // Incorrect Path"}</div>
            </div>
            <div className="flex items-center gap-2 text-xs text-primary-fixed">
              <span className="material-symbols-outlined text-sm animate-bounce">keyboard_arrow_right</span>
              SigNoz MCP intervened and halted session.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
