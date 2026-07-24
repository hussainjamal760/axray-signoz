"use client";

import React from "react";
import { SessionSummary } from "../types/sessions.types";
import { ContainerStatusBadge } from "./ContainerStatusBadge";
import { WorkspaceStatusBadge } from "./WorkspaceStatusBadge";
import { useCreatePullRequest } from "../hooks/useCreatePullRequest";

export function SessionHeader({ session }: { session: SessionSummary }) {
  const { mutate: handleCreatePR, isPending: isCreatingPR } = useCreatePullRequest(session.id);

  const badgeClass =
    session.status === "active"
      ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
      : "bg-surface-container border-outline text-on-surface-variant";

  const pr = session.pullRequest;

  return (
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
              className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 font-black px-3 py-1 hover:bg-emerald-500/30 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">call_split</span>
              <span>PR #{pr.prNumber} {pr.status.toUpperCase()}</span>
              <span className="material-symbols-outlined text-xs">open_in_new</span>
            </a>

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
                  <span>Update PR #{pr.prNumber}</span>
                </>
              )}
            </button>
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
  );
}
