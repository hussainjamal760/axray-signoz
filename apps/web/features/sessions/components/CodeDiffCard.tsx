"use client";

import React, { useMemo } from "react";
import { parseUnifiedDiff } from "../lib/diff-parser";
import { FileDiff } from "./FileDiff";

export interface CodeDiffCardProps {
  diff?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  diffSize?: number;
  changeSummary?: string;
}

export function CodeDiffCard({
  diff,
  filesChanged = [],
  insertions = 0,
  deletions = 0,
  diffTruncated = false,
  diffSize,
  changeSummary,
}: CodeDiffCardProps) {
  const parsedFiles = useMemo(() => {
    if (!diff) return [];
    return parseUnifiedDiff(diff);
  }, [diff]);

  if (!diff && filesChanged.length === 0) {
    return (
      <div className="bg-surface border-[3px] border-outline p-6 font-mono-label text-xs text-outline-variant brutalist-shadow">
        # No code changes were made during this run.
      </div>
    );
  }

  return (
    <div className="bg-surface-container border-[3px] border-outline brutalist-shadow overflow-hidden">
      {/* Overview Diff Header */}
      <div className="bg-surface text-white p-4 font-mono-label font-bold flex justify-between items-center border-b-[3px] border-outline flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-sm">difference</span>
          <span className="uppercase text-xs font-black">
            Git Diff ({changeSummary || `${filesChanged.length} ${filesChanged.length === 1 ? "file" : "files"} changed`})
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono-label font-bold">
          <span className="text-emerald-400">+{insertions}</span>
          <span className="text-error">-{deletions}</span>
        </div>
      </div>

      {/* Truncation Warning Banner */}
      {diffTruncated && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 p-2.5 px-4 text-amber-300 font-mono-label text-xs flex items-center gap-2 font-bold">
          <span className="material-symbols-outlined text-sm text-amber-400">warning</span>
          <span>
            Large diff detected ({diffSize ? `${(diffSize / 1024).toFixed(1)} KB` : 'Over size limit'}). Displaying truncated preview.
          </span>
        </div>
      )}

      {/* Side-by-Side File Diffs List */}
      <div className="p-4 bg-background max-h-[550px] overflow-y-auto custom-scrollbar space-y-4">
        {parsedFiles.length > 0 ? (
          parsedFiles.map((fileDiff, idx) => (
            <FileDiff key={idx} fileDiff={fileDiff} />
          ))
        ) : (
          <div className="bg-surface border border-outline p-4 font-mono-label text-xs text-on-surface flex items-center justify-between">
            <span className="font-bold">Modified Files: {filesChanged.join(", ")}</span>
            <span className="text-outline-variant italic">Unified diff payload pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
