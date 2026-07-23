"use client";

import React from "react";

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
  if (!diff && filesChanged.length === 0) {
    return (
      <div className="bg-surface-container border-[3px] border-outline p-6 font-mono-label text-xs text-outline-variant brutalist-shadow">
        # No file modifications recorded in this run.
      </div>
    );
  }

  const lines = diff ? diff.split("\n") : [];
  let isInsideBinaryPatch = false;

  return (
    <div className="bg-surface-container border-[3px] border-outline brutalist-shadow overflow-hidden">
      {/* Diff Header */}
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
            Large diff detected ({diffSize ? `${(diffSize / 1024).toFixed(1)} KB` : 'Over size limit'}). Displaying truncated 50KB preview.
          </span>
        </div>
      )}

      {/* Files List Summary */}
      {filesChanged.length > 0 && (
        <div className="bg-background/40 p-3 border-b border-outline/50 flex flex-wrap gap-2 font-mono-label text-[11px]">
          <span className="text-outline uppercase font-bold">Modified:</span>
          {filesChanged.map((file, idx) => (
            <span key={idx} className="bg-surface border border-outline/40 px-2 py-0.5 text-on-surface font-bold">
              {file}
            </span>
          ))}
        </div>
      )}

      {/* Unified Diff Output */}
      <div className="font-mono-label text-xs leading-relaxed max-h-[350px] overflow-y-auto custom-scrollbar bg-background p-2">
        {lines.length > 0 ? (
          lines.map((line, index) => {
            // Handle binary file diff notices (e.g. "Binary files a/img.png and b/img.png differ")
            if (line.startsWith("Binary files")) {
              isInsideBinaryPatch = false;
              return (
                <div key={index} className="bg-surface p-2 text-outline-variant italic font-bold my-1 border border-outline/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">image</span>
                  <span>{line} (Binary content omitted)</span>
                </div>
              );
            }

            // Handle GIT binary patch headers
            if (line.startsWith("GIT binary patch")) {
              isInsideBinaryPatch = true;
              return (
                <div key={index} className="bg-surface p-2 text-outline-variant italic font-bold my-1 border border-outline/50 flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">view_in_ar</span>
                  <span>GIT binary patch data omitted</span>
                </div>
              );
            }

            if (isInsideBinaryPatch) {
              // End binary patch when a new file section starts
              if (line.startsWith("diff --git") || line.startsWith("@@")) {
                isInsideBinaryPatch = false;
              } else {
                return null; // Skip binary patch raw payload lines
              }
            }

            if (line.startsWith("diff --git")) {
              const fileName = line.replace("diff --git a/", "a/").trim();
              return (
                <div key={index} className="bg-surface-container-high text-primary-fixed p-2 font-bold my-1 border border-outline">
                  {fileName}
                </div>
              );
            }
            if (line.startsWith("@@")) {
              return (
                <div key={index} className="bg-outline/20 text-outline-variant py-1 px-3 font-bold my-1 border-l-2 border-primary-fixed">
                  {line}
                </div>
              );
            }
            if (line.startsWith("+") && !line.startsWith("+++")) {
              return (
                <div key={index} className="bg-emerald-500/15 text-emerald-300 py-1 px-3 border-l-4 border-emerald-500 flex items-center gap-2">
                  <span className="font-bold select-none">+</span>
                  <span className="whitespace-pre-wrap">{line.substring(1)}</span>
                </div>
              );
            }
            if (line.startsWith("-") && !line.startsWith("---")) {
              return (
                <div key={index} className="bg-error/15 text-error py-1 px-3 border-l-4 border-error flex items-center gap-2">
                  <span className="font-bold select-none">-</span>
                  <span className="whitespace-pre-wrap">{line.substring(1)}</span>
                </div>
              );
            }
            return (
              <div key={index} className="py-0.5 px-3 text-on-surface-variant/70 flex items-center gap-2">
                <span className="w-2 select-none opacity-30"> </span>
                <span className="whitespace-pre-wrap">{line}</span>
              </div>
            );
          })
        ) : (
          <div className="p-4 text-outline-variant italic">
            Modified files: {filesChanged.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
