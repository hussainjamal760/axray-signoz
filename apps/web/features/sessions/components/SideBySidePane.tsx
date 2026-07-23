"use client";

import React, { useRef } from "react";
import { DiffHunk, DiffRow } from "../lib/diff-parser";

export interface SideBySidePaneProps {
  hunk: DiffHunk;
}

export function SideBySidePane({ hunk }: SideBySidePaneProps) {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);

  const handleLeftScroll = () => {
    if (leftPaneRef.current && rightPaneRef.current) {
      rightPaneRef.current.scrollTop = leftPaneRef.current.scrollTop;
    }
  };

  const handleRightScroll = () => {
    if (leftPaneRef.current && rightPaneRef.current) {
      leftPaneRef.current.scrollTop = rightPaneRef.current.scrollTop;
    }
  };

  return (
    <div className="border-b border-outline/30 font-mono-label text-xs">
      {/* Hunk Separator Header */}
      <div className="bg-surface-container-high/60 text-outline-variant px-4 py-1.5 text-[11px] font-bold border-y border-outline/30 flex items-center gap-2">
        <span className="material-symbols-outlined text-xs text-primary-fixed">unfold_more</span>
        <span>{hunk.header}</span>
      </div>

      {/* Side-by-side synchronized split panes */}
      <div className="grid grid-cols-2 divide-x divide-outline/40 overflow-hidden bg-background">
        {/* Left Pane (Old Version) */}
        <div
          ref={leftPaneRef}
          onScroll={handleLeftScroll}
          className="overflow-x-auto custom-scrollbar leading-relaxed"
        >
          {hunk.rows.map((row, idx) => (
            <DiffRowLeft key={idx} row={row} />
          ))}
        </div>

        {/* Right Pane (New Version) */}
        <div
          ref={rightPaneRef}
          onScroll={handleRightScroll}
          className="overflow-x-auto custom-scrollbar leading-relaxed"
        >
          {hunk.rows.map((row, idx) => (
            <DiffRowRight key={idx} row={row} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiffRowLeft({ row }: { row: DiffRow }) {
  const isDeletion = row.type === "deletion" || (row.type === "modified" && row.leftContent !== null);
  const isBlank = row.leftContent === null;

  return (
    <div
      className={`grid grid-cols-[48px_1fr] border-b border-outline/10 text-xs min-h-[24px] ${
        isDeletion
          ? "bg-error/15 text-error-container"
          : isBlank
          ? "bg-surface-container-lowest/30"
          : "text-on-surface-variant/80"
      }`}
    >
      <div className="bg-background/40 select-none text-right pr-2 py-0.5 text-outline/50 font-bold border-r border-outline/20">
        {row.oldLineNumber !== null ? row.oldLineNumber : ""}
      </div>
      <div className="px-3 py-0.5 whitespace-pre flex items-center overflow-x-auto">
        {isDeletion && <span className="font-bold mr-2 text-error select-none">-</span>}
        <span>{row.leftContent !== null ? row.leftContent : ""}</span>
      </div>
    </div>
  );
}

function DiffRowRight({ row }: { row: DiffRow }) {
  const isAddition = row.type === "addition" || (row.type === "modified" && row.rightContent !== null);
  const isBlank = row.rightContent === null;

  return (
    <div
      className={`grid grid-cols-[48px_1fr] border-b border-outline/10 text-xs min-h-[24px] ${
        isAddition
          ? "bg-emerald-500/15 text-emerald-300"
          : isBlank
          ? "bg-surface-container-lowest/30"
          : "text-on-surface-variant/80"
      }`}
    >
      <div className="bg-background/40 select-none text-right pr-2 py-0.5 text-outline/50 font-bold border-r border-outline/20">
        {row.newLineNumber !== null ? row.newLineNumber : ""}
      </div>
      <div className="px-3 py-0.5 whitespace-pre flex items-center overflow-x-auto">
        {isAddition && <span className="font-bold mr-2 text-emerald-400 select-none">+</span>}
        <span>{row.rightContent !== null ? row.rightContent : ""}</span>
      </div>
    </div>
  );
}
