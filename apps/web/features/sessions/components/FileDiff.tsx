"use client";

import React, { useState } from "react";
import { ParsedFileDiff } from "../lib/diff-parser";
import { SideBySidePane } from "./SideBySidePane";

export interface FileDiffProps {
  fileDiff: ParsedFileDiff;
}

export function FileDiff({ fileDiff }: FileDiffProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border border-outline bg-surface rounded-none overflow-hidden mb-4 brutalist-shadow-sm">
      {/* File Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-surface-container text-white px-4 py-3 font-mono-label font-bold flex justify-between items-center border-b border-outline hover:bg-surface-container-high transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-sm text-outline transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
            chevron_right
          </span>
          <span className="material-symbols-outlined text-sm text-primary-fixed">description</span>
          <span className="font-bold text-xs uppercase text-on-surface">{fileDiff.filename}</span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono-label font-bold">
          {fileDiff.insertions > 0 && (
            <span className="text-emerald-400">+{fileDiff.insertions}</span>
          )}
          {fileDiff.deletions > 0 && (
            <span className="text-error">-{fileDiff.deletions}</span>
          )}
        </div>
      </button>

      {/* File Diff Content */}
      {isExpanded && (
        <div>
          {fileDiff.isBinary ? (
            <div className="p-4 bg-background text-outline-variant font-mono-label text-xs italic flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">image</span>
              <span>Binary content changed ({fileDiff.filename}). Diff preview omitted.</span>
            </div>
          ) : fileDiff.hunks.length > 0 ? (
            fileDiff.hunks.map((hunk, idx) => (
              <SideBySidePane key={idx} hunk={hunk} />
            ))
          ) : (
            <div className="p-4 bg-background text-outline-variant font-mono-label text-xs italic">
              No line changes detected for {fileDiff.filename}.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
