"use client";

import React from "react";

export interface CodeDiffCardProps {
  diff?: string;
  filesChanged?: string[];
  insertions?: number;
  deletions?: number;
}

export function CodeDiffCard({
  diff,
  filesChanged = [],
  insertions = 0,
  deletions = 0,
}: CodeDiffCardProps) {
  if (!diff && filesChanged.length === 0) {
    return (
      <div className="bg-surface-container border-[3px] border-outline p-6 font-mono-label text-xs text-outline-variant brutalist-shadow">
        # No file modifications recorded in this run.
      </div>
    );
  }

  const lines = diff ? diff.split("\n") : [];

  return (
    <div className="bg-surface-container border-[3px] border-outline brutalist-shadow overflow-hidden">
      {/* Diff Header */}
      <div className="bg-surface text-white p-4 font-mono-label font-bold flex justify-between items-center border-b-[3px] border-outline flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed text-sm">difference</span>
          <span className="uppercase text-xs font-black">
            Git Diff ({filesChanged.length} {filesChanged.length === 1 ? "file" : "files"} changed)
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono-label font-bold">
          <span className="text-emerald-400">+{insertions}</span>
          <span className="text-error">-{deletions}</span>
        </div>
      </div>

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
