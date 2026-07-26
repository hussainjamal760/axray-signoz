"use client";

import React from "react";
import { AgentRunSummary } from "@/features/agent-runs/types";
import { CodeDiffCard } from "./CodeDiffCard";

export interface CodeViewerPanelProps {
  activeRun?: AgentRunSummary | null;
  isLoading?: boolean;
}

export function CodeViewerPanel({ activeRun, isLoading = false }: CodeViewerPanelProps) {
  return (
    <div className="flex-1 flex flex-col border-r border-outline-variant/10 bg-surface-container-lowest overflow-y-auto custom-scrollbar" data-lenis-prevent="true">
      <CodeDiffCard
        diff={activeRun?.diff}
        filesChanged={activeRun?.filesChanged}
        insertions={activeRun?.insertions}
        deletions={activeRun?.deletions}
        diffTruncated={activeRun?.diffTruncated}
        diffSize={activeRun?.diffSize}
        changeSummary={activeRun?.changeSummary}
        isLoading={isLoading}
        isError={false}
        runStatus={activeRun?.status}
        runErrorMessage={activeRun?.errorMessage}
      />
    </div>
  );
}
