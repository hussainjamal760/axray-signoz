"use client";

import React, { useState, useEffect } from "react";
import { SessionSummary } from "../types/sessions.types";
import { ContainerStatusBadge } from "./ContainerStatusBadge";
import { WorkspaceStatusBadge } from "./WorkspaceStatusBadge";
import { useCreatePullRequest } from "../hooks/useCreatePullRequest";

export function SessionHeader({ session }: { session: SessionSummary }) {
  const { mutate: handleCreatePR, isPending: isCreatingPR, error: prError, reset: resetPRState } = useCreatePullRequest(session.id);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (prError) {
      setToastMessage(prError.message || "No code changes detected in workspace.");
      const timer = setTimeout(() => {
        setToastMessage(null);
        resetPRState();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [prError, resetPRState]);

  const badgeClass =
    session.status === "active"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
      : "bg-surface-container border-outline text-on-surface-variant";

  const pr = session.pullRequest;

  const getPrBadgeStyle = (status: string) => {
    switch (status) {
      case "merged":
        return "bg-purple-500/20 border-purple-500/50 text-purple-300 hover:bg-purple-500/30";
      case "closed":
        return "bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30";
      default:
        return "bg-emerald-500/20 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/30";
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* Toast Notification Banner for Validation Errors */}
      {toastMessage && (
        <div className="bg-amber-500/20 border-b-2 border-amber-500/50 px-6 py-2.5 font-mono-label text-xs font-bold text-amber-300 flex items-center justify-between animate-fadeIn shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-base text-amber-400">info</span>
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-amber-400 hover:text-white font-black uppercase text-[10px]"
          >
            DISMISS
          </button>
        </div>
      )}

      <section className="p-gutter border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
        <div className="flex flex-wrap gap-4 items-center">
          {/* 1. Repository */}
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder</span>
            <span className="font-bold text-white">{session.repositoryFullName}</span>
          </div>

          {/* 2. Branch */}
          <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-mono-label text-on-surface">
            <span className="material-symbols-outlined text-[14px] text-on-surface-variant">commit</span>
            <span className="font-bold text-white">{session.branch}</span>
          </div>

          {/* 3. Session Status */}
          <div className={`flex items-center gap-2 border px-3 py-1 font-mono-label text-xs font-bold ${badgeClass}`}>
            <span className="material-symbols-outlined text-[14px]">
              {session.status === "active" ? "check_circle" : "archive"}
            </span>
            {session.status === "active" ? "Active" : "Archived"}
          </div>

          {/* 4. Container Status */}
          <ContainerStatusBadge status={session.containerStatus} />

          {/* 5. Workspace Status */}
          <WorkspaceStatusBadge isInitialized={session.workspaceInitialized} />
        </div>

        {/* 6. Pull Request Action & Live Status Badge */}
        <div className="flex items-center gap-3">
          {pr ? (
            <div className="flex items-center gap-3 font-mono-label text-xs">
              <a
                href={pr.prUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-1.5 border font-black px-3 py-1 transition-colors ${getPrBadgeStyle(
                  pr.status
                )}`}
              >
                <span className="material-symbols-outlined text-sm">call_split</span>
                <span>
                  PR #{pr.prNumber || pr.number} {pr.status.toUpperCase()}
                </span>
                <span className="material-symbols-outlined text-xs">open_in_new</span>
              </a>

              {pr.status === "open" && (
                <button
                  type="button"
                  onClick={() => handleCreatePR(undefined)}
                  disabled={isCreatingPR}
                  className="flex items-center gap-1.5 bg-primary-fixed text-on-primary-fixed font-black uppercase border border-outline px-3 py-1 hover:bg-surface-variant transition-colors disabled:opacity-50 brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
                >
                  {isCreatingPR ? (
                    <>
                      <span className="material-symbols-outlined text-xs animate-spin">sync</span>
                      <span>Pushing Changes...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-xs">upload</span>
                      <span>Push New Changes</span>
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleCreatePR(undefined)}
              disabled={isCreatingPR}
              className="flex items-center gap-2 bg-primary-fixed text-on-primary-fixed font-black uppercase text-xs border-2 border-outline px-4 py-1.5 hover:bg-surface-variant transition-colors disabled:opacity-50 brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              {isCreatingPR ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                  <span>Creating Pull Request...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">call_split</span>
                  <span>Create Pull Request</span>
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
