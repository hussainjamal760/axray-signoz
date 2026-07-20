"use client";

import { useEffect, useState } from "react";

export function RootCauseCard() {
  const [displayText, setDisplayText] = useState("");
  const fullText = "The agent modified authentication middleware incorrectly, causing login validation failures.";

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setDisplayText((prev) => prev + fullText.charAt(i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 15);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-surface-container border-[3px] border-background brutalist-shadow p-6 reveal-text" style={{ animationDelay: '0.1s' }}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-3xl font-black uppercase mb-2 text-on-surface">Root Cause Detected</h2>
          <p className="text-on-surface-variant max-w-2xl min-h-[48px]">
            {displayText}
            <span className="inline-block w-2 h-4 bg-primary-fixed animate-pulse ml-1 align-middle"></span>
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono-label text-xs font-bold text-on-surface-variant uppercase mb-1">Confidence</div>
          <div className="text-4xl font-black text-primary-fixed">96%</div>
        </div>
      </div>
      <div className="flex items-center gap-4 bg-background p-4 border-2 border-background">
        <span className="material-symbols-outlined text-primary-fixed">history</span>
        <span className="font-mono-label text-sm font-bold uppercase text-on-surface">Failure started at: Turn 3</span>
      </div>
    </div>
  );
}
