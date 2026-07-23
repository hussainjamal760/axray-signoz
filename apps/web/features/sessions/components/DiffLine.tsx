"use client";

import React from "react";
import { UnifiedDiffLine } from "../lib/diff-parser";

export interface DiffLineProps {
  line: UnifiedDiffLine;
}

export function DiffLine({ line }: DiffLineProps) {
  const isAdd = line.type === "add";
  const isDelete = line.type === "delete";

  const rowBgClass = isAdd
    ? "bg-emerald-500/15 text-emerald-300 border-l-2 border-emerald-500"
    : isDelete
    ? "bg-error/15 text-error border-l-2 border-error"
    : "text-on-surface-variant/80 hover:bg-surface-container-highest/30";

  const sign = isAdd ? "+" : isDelete ? "-" : " ";

  return (
    <div className={`grid grid-cols-[48px_48px_24px_1fr] font-mono-label text-xs leading-relaxed border-b border-outline/10 select-text ${rowBgClass}`}>
      {/* Old Line Number */}
      <div className="bg-background/40 text-right pr-2 py-0.5 select-none font-bold text-outline/50 border-r border-outline/20">
        {line.oldLineNumber !== null ? line.oldLineNumber : ""}
      </div>

      {/* New Line Number */}
      <div className="bg-background/40 text-right pr-2 py-0.5 select-none font-bold text-outline/50 border-r border-outline/20">
        {line.newLineNumber !== null ? line.newLineNumber : ""}
      </div>

      {/* Sign Symbol (+ / - / blank) */}
      <div className="text-center py-0.5 font-bold select-none opacity-80">
        {sign}
      </div>

      {/* Content */}
      <div className="px-2 py-0.5 whitespace-pre overflow-x-auto custom-scrollbar">
        {line.content}
      </div>
    </div>
  );
}
