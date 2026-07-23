"use client";

import React from "react";

export interface HunkHeaderProps {
  header: string;
}

export function HunkHeader({ header }: HunkHeaderProps) {
  return (
    <div className="bg-surface-container-high/70 text-outline-variant px-4 py-1.5 font-mono-label font-bold text-[11px] border-y border-outline/30 flex items-center gap-2 select-none">
      <span className="material-symbols-outlined text-xs text-primary-fixed">unfold_more</span>
      <span>{header}</span>
    </div>
  );
}
