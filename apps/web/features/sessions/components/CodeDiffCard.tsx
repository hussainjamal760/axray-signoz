"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CodeDiffCard() {
  return (
    <div className="bg-surface-container border-[3px] border-background brutalist-shadow overflow-hidden reveal-text" style={{ animationDelay: '0.2s' }}>
      <div className="bg-background text-white p-4 font-mono-label font-bold flex justify-between items-center border-b-[3px] border-background">
        <span className="uppercase text-sm">Diff: src/middleware/auth.js</span>
        <span className="text-on-surface-variant text-xs">L14 - L18</span>
      </div>
      <div className="font-mono-label text-sm leading-relaxed">
        
        <div className="grid grid-cols-[48px_1fr] bg-error-container text-on-error-container border-b border-background group cursor-default transition-transform duration-200 hover:translate-x-1">
          <div className="bg-background/20 text-center py-2 border-r border-background/10 font-bold">14</div>
          <div className="py-2 px-4 flex items-center">
            <span className="mr-2 opacity-50 font-black">-</span>
            <span>authenticate(user)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-[48px_1fr] bg-primary-container text-on-primary-container animate-pulse-soft group cursor-default transition-transform duration-200 hover:translate-x-1">
          <div className="bg-background/20 text-center py-2 border-r border-background/10 font-bold">14</div>
          <div className="py-2 px-4 flex items-center font-bold">
            <span className="mr-2 opacity-50 font-black">+</span>
            <span>authenticateUser(user)</span>
          </div>
        </div>
        
        <div className="grid grid-cols-[48px_1fr] text-on-surface-variant/50 group cursor-default transition-transform duration-200 hover:translate-x-1">
          <div className="bg-background/20 text-center py-2 border-r border-background/10 font-bold">15</div>
          <div className="py-2 px-4">...remaining logic</div>
        </div>
        
      </div>
    </div>
  );
}
