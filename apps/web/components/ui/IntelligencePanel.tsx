import React from 'react';
import { Cpu } from "@phosphor-icons/react/dist/ssr";

export function IntelligencePanel() {
  return (
    <div className="w-96 flex-col bg-surface shrink-0 hidden xl:flex">
      <div className="p-4 border-b-[3px] border-outline-variant bg-surface-container-high shrink-0">
        <span className="font-mono-label text-mono-label font-black text-on-surface">AGENT INTELLIGENCE</span>
      </div>
      
      <div className="p-gutter border-b-2 border-outline-variant shrink-0">
        <h3 className="font-mono-label text-mono-label uppercase opacity-60 mb-2">Current Decision</h3>
        <p className="font-body-md text-body-md font-bold text-primary-fixed">
          "Modify authentication middleware to handle invalid user contexts and return standardized JSON errors for better test compatibility."
        </p>
      </div>
      
      <div className="grid grid-cols-3 border-b-2 border-outline-variant shrink-0">
        <div className="p-4 border-r-2 border-outline-variant flex flex-col items-center">
          <span className="font-mono-label text-[10px] opacity-60">TOKENS</span>
          <span className="font-mono-label text-mono-label font-black text-primary-fixed">2.4k</span>
        </div>
        <div className="p-4 border-r-2 border-outline-variant flex flex-col items-center">
          <span className="font-mono-label text-[10px] opacity-60">COST</span>
          <span className="font-mono-label text-mono-label font-black text-primary-fixed">$0.03</span>
        </div>
        <div className="p-4 flex flex-col items-center">
          <span className="font-mono-label text-[10px] opacity-60">LATENCY</span>
          <span className="font-mono-label text-mono-label font-black text-primary-fixed">2.4s</span>
        </div>
      </div>
      
      <div className="flex-1 relative flex flex-col overflow-hidden">
        <div className="p-4 flex justify-between items-center shrink-0">
          <span className="font-mono-label text-mono-label font-black">LOGIC TRACE TREE</span>
          <span className="material-symbols-outlined text-primary-fixed cursor-pointer">open_in_full</span>
        </div>
        
        <div className="flex-1 relative overflow-hidden bg-surface-container-lowest m-4 mt-0 border-2 border-outline-variant flex items-center justify-center flex-col group">
          {/* Grid Pattern Background */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: "radial-gradient(#e5e3cf 1px, transparent 1px)", backgroundSize: "16px 16px" }}></div>
          
          <Cpu weight="fill" className="text-primary-fixed/20 w-24 h-24 mb-4 group-hover:scale-110 transition-transform duration-700" />
          <span className="font-mono-label text-xs text-on-surface-variant uppercase tracking-widest opacity-50">
            Node Visualization Offline
          </span>

          {/* Overlay for stylistic purposes */}
          <div className="absolute top-2 left-2 flex gap-1 z-10">
            <div className="w-1.5 h-1.5 bg-primary-fixed pulse-neon"></div>
            <div className="w-1.5 h-1.5 bg-primary-fixed pulse-neon delay-75"></div>
            <div className="w-1.5 h-1.5 bg-primary-fixed pulse-neon delay-150"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
