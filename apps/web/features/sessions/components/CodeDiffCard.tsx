"use client";

import React, { useMemo, useState } from "react";
import { parseUnifiedDiff } from "../lib/diff-parser";
import { FileDiffCard } from "./FileDiffCard";

export interface CodeDiffCardProps {
  diff?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  diffSize?: number;
  changeSummary?: string;
  isLoading?: boolean;
}

export function CodeDiffCard({
  diff,
  filesChanged = [],
  insertions = 0,
  deletions = 0,
  diffTruncated = false,
  diffSize,
  changeSummary,
  isLoading = false,
}: CodeDiffCardProps) {
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);

  const parsedFiles = useMemo(() => {
    if (!diff) return [];
    return parseUnifiedDiff(diff);
  }, [diff]);

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-surface border-[3px] border-outline p-8 brutalist-shadow text-center font-mono-label">
        <div className="flex items-center justify-center gap-3 text-primary-fixed font-black text-sm uppercase animate-pulse">
          <span className="material-symbols-outlined animate-spin text-lg">sync</span>
          Waiting for code changes...
        </div>
        <p className="text-outline-variant text-xs mt-2">
          Git diff will be captured and generated automatically after agent completion.
        </p>
      </div>
    );
  }

  // Empty State (no diff & no files changed)
  if (!diff && filesChanged.length === 0) {
    return (
      <div className="bg-surface border-[3px] border-outline p-8 brutalist-shadow text-center font-mono-label">
        <div className="flex items-center justify-center gap-3 text-outline text-sm font-black uppercase mb-1">
          <span className="material-symbols-outlined text-lg">check_circle</span>
          No code changes were produced during this run.
        </div>
        <p className="text-outline-variant text-xs">
          The agent completed without modifying any files in the workspace repository.
        </p>
      </div>
    );
  }

  const filesToDisplay = activeFileIndex !== null && parsedFiles[activeFileIndex]
    ? [parsedFiles[activeFileIndex]]
    : parsedFiles;

  return (
    <div className="bg-surface border-[3px] border-outline brutalist-shadow overflow-hidden w-full">
      {/* Header Bar */}
      <div className="bg-surface-container-high border-b-[3px] border-outline p-5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-xl">schema</span>
          <h3 className="text-lg font-black uppercase text-on-surface">Git Diff</h3>
          {diffTruncated && (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-0.5 font-mono-label text-[11px] font-bold uppercase flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              Preview truncated
            </span>
          )}
        </div>

        {/* Summary Statistics */}
        <div className="flex items-center gap-6 font-mono-label text-xs font-bold">
          <div className="flex items-center gap-2 text-on-surface bg-background px-3 py-1 border border-outline">
            <span className="material-symbols-outlined text-sm text-outline">folder</span>
            <span>{filesChanged.length || parsedFiles.length} {filesChanged.length === 1 ? "File" : "Files"} Changed</span>
          </div>

          <div className="flex items-center gap-3 bg-background px-3 py-1 border border-outline">
            <span className="text-emerald-400 font-black">+{insertions}</span>
            <span className="text-error font-black">-{deletions}</span>
          </div>
        </div>
      </div>

      {/* Truncation Detail Notice */}
      {diffTruncated && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 text-amber-300 font-mono-label text-xs flex items-center justify-between">
          <span>
            Large git diff payload ({diffSize ? `${(diffSize / 1024).toFixed(1)} KB` : 'Over size limit'}). Displaying 500KB preview.
          </span>
          {changeSummary && <span className="font-bold text-outline">{changeSummary}</span>}
        </div>
      )}

      {/* Multiple Files Tab Selector (if > 1 file) */}
      {parsedFiles.length > 1 && (
        <div className="bg-surface-container/60 border-b border-outline p-3 flex flex-wrap gap-2 font-mono-label text-xs">
          <button
            type="button"
            onClick={() => setActiveFileIndex(null)}
            className={`px-3 py-1 font-bold border uppercase transition-colors ${
              activeFileIndex === null
                ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
                : "bg-surface text-on-surface-variant border-outline hover:bg-surface-container-high"
            }`}
          >
            All Files ({parsedFiles.length})
          </button>
          {parsedFiles.map((file, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveFileIndex(idx)}
              className={`px-3 py-1 font-bold border transition-colors flex items-center gap-2 ${
                activeFileIndex === idx
                  ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
                  : "bg-surface text-on-surface-variant border-outline hover:bg-surface-container-high"
              }`}
            >
              <span>{file.filename}</span>
              <span className="text-[10px] opacity-75">
                (+{file.insertions}/-{file.deletions})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Body: GitHub-Style Unified File Diffs */}
      <div className="p-6 bg-background max-h-[650px] overflow-y-auto custom-scrollbar space-y-6">
        {filesToDisplay.length > 0 ? (
          filesToDisplay.map((fileDiff, idx) => (
            <FileDiffCard key={idx} fileDiff={fileDiff} />
          ))
        ) : (
          <div className="bg-surface border border-outline p-6 font-mono-label text-xs text-on-surface flex items-center justify-between">
            <span className="font-bold">Modified Files: {filesChanged.join(", ")}</span>
            <span className="text-outline-variant italic">Full unified diff payload pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
