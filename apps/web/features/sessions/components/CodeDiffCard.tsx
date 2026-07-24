"use client";

import React, { useMemo, useState } from "react";
import { parseUnifiedDiff } from "../lib/diff-parser";
import { FileDiffCard } from "./FileDiffCard";
import { PullRequestSummary } from "../types/sessions.types";
import { useCreatePullRequest } from "../hooks/useCreatePullRequest";

export interface CodeDiffCardProps {
  sessionId?: string;
  pullRequest?: PullRequestSummary;
  diff?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
  diffTruncated?: boolean;
  diffSize?: number;
  changeSummary?: string;
  isLoading?: boolean;
  isError?: boolean;
}

export function CodeDiffCard({
  sessionId,
  pullRequest,
  diff,
  filesChanged = [],
  insertions = 0,
  deletions = 0,
  diffTruncated = false,
  diffSize,
  changeSummary,
  isLoading = false,
  isError = false,
}: CodeDiffCardProps) {
  const [activeFileIndex, setActiveFileIndex] = useState<number | null>(null);

  const { mutate: handleCreatePR, isPending: isCreatingPR } = useCreatePullRequest(sessionId || "");

  const parsedFiles = useMemo(() => {
    if (!diff) return [];
    return parseUnifiedDiff(diff);
  }, [diff]);

  // Loading State
  if (isLoading) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm text-center font-sans">
        <div className="flex items-center justify-center gap-3 text-primary-fixed font-semibold text-sm animate-pulse">
          <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
          Generating Git Diff...
        </div>
        <p className="text-on-surface-variant text-xs mt-2 font-light">
          Inspecting workspace repository changes for current run...
        </p>
      </div>
    );
  }

  // Error State
  if (isError) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm text-center font-sans">
        <div className="flex items-center justify-center gap-2 text-rose-400 text-sm font-semibold mb-1">
          <span className="material-symbols-outlined text-lg">error</span>
          Unable to generate Git diff.
        </div>
        <p className="text-on-surface-variant text-xs font-light">
          An error occurred while inspecting repository changes for this run.
        </p>
      </div>
    );
  }

  // Empty State (no diff & no files changed)
  if (!diff && filesChanged.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-8 shadow-sm text-center font-sans">
        <div className="flex items-center justify-center gap-2 text-on-surface-variant text-sm font-medium mb-1">
          <span className="material-symbols-outlined text-lg text-emerald-400">check_circle</span>
          No code changes were made during this run.
        </div>
        <p className="text-on-surface-variant text-xs font-light mt-1">
          The agent completed without modifying any files in the workspace repository.
        </p>
      </div>
    );
  }

  const filesToDisplay = activeFileIndex !== null && parsedFiles[activeFileIndex]
    ? [parsedFiles[activeFileIndex]]
    : parsedFiles;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl shadow-sm overflow-hidden w-full transition-all hover:border-primary-fixed/30">
      {/* Header Bar */}
      <div className="bg-surface-container-lowest/50 border-b border-outline-variant/30 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-xl">schema</span>
          <h3 className="text-base font-semibold text-on-surface">Git Diff</h3>
          {diffTruncated && (
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-xs">warning</span>
              Preview truncated
            </span>
          )}
        </div>

        {/* Summary Statistics & PR Action */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2 text-on-surface bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-1.5 font-medium">
            <span className="material-symbols-outlined text-sm text-on-surface-variant">folder</span>
            <span>{filesChanged.length || parsedFiles.length} {filesChanged.length === 1 ? "File" : "Files"} Changed</span>
          </div>

          <div className="flex items-center gap-2 bg-surface-container border border-outline-variant/20 rounded-xl px-3 py-1.5 font-mono text-xs">
            <span className="text-emerald-400 font-semibold">+{insertions}</span>
            <span className="text-rose-400 font-semibold">-{deletions}</span>
          </div>

          {sessionId && (
            pullRequest ? (
              <a
                href={pullRequest.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3.5 py-1.5 rounded-xl hover:bg-emerald-500/20 transition-all font-medium text-xs"
              >
                <span>View PR</span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => handleCreatePR(undefined)}
                disabled={isCreatingPR}
                className="flex items-center gap-2 bg-primary-fixed text-black font-semibold px-4 py-1.5 rounded-xl hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 text-xs"
              >
                {isCreatingPR ? (
                  <>
                    <span className="material-symbols-outlined text-xs animate-spin">progress_activity</span>
                    <span>Creating PR...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-xs">call_split</span>
                    <span>Create PR</span>
                  </>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Truncation Detail Notice */}
      {diffTruncated && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2 text-amber-200 text-xs flex items-center justify-between font-sans">
          <span>
            Large git diff payload ({diffSize ? `${(diffSize / 1024).toFixed(1)} KB` : 'Over size limit'}). Displaying 500KB preview.
          </span>
          {changeSummary && <span className="font-medium text-on-surface-variant">{changeSummary}</span>}
        </div>
      )}

      {/* Multiple Files Tab Selector */}
      {parsedFiles.length > 1 && (
        <div className="bg-surface-container/30 border-b border-outline-variant/20 p-3 flex flex-wrap gap-2 text-xs font-sans">
          <button
            type="button"
            onClick={() => setActiveFileIndex(null)}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeFileIndex === null
                ? "bg-primary-fixed text-black"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            All Files ({parsedFiles.length})
          </button>
          {parsedFiles.map((file, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveFileIndex(idx)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeFileIndex === idx
                  ? "bg-primary-fixed text-black"
                  : "bg-surface-container text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className="font-mono">{file.filename}</span>
              <span className="text-[10px] opacity-75 font-mono">
                (+{file.insertions}/-{file.deletions})
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Body: GitHub-Style Unified File Diffs */}
      <div className="p-6 bg-surface-container-lowest max-h-[650px] overflow-y-auto custom-scrollbar space-y-6">
        {filesToDisplay.length > 0 ? (
          filesToDisplay.map((fileDiff, idx) => (
            <FileDiffCard key={idx} fileDiff={fileDiff} />
          ))
        ) : (
          <div className="bg-surface-container border border-outline-variant/20 rounded-2xl p-5 text-xs text-on-surface flex items-center justify-between font-sans">
            <span className="font-medium">Modified Files: {filesChanged.join(", ")}</span>
            <span className="text-on-surface-variant italic">Full unified diff payload pending</span>
          </div>
        )}
      </div>
    </div>
  );
}
