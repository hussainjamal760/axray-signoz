"use client";

import { useEffect, useState } from "react";
import { RepositoryDropdown, BranchDropdown } from "@/features/repositories/components";
import { useRepositories, useBranches } from "@/features/repositories/hooks";

export function InitializePanel() {
  const {
    data: repositories = [],
    isLoading: repositoriesLoading,
    isError: isReposError,
    error: reposError,
  } = useRepositories();

  const [selectedRepoId, setSelectedRepoId] = useState<number | "">("");

  const selectedRepoObj = repositories.find((r) => r.id === selectedRepoId);
  const owner = selectedRepoObj?.owner;
  const repoName = selectedRepoObj?.name;

  const {
    data: branches = [],
    isLoading: branchesLoading,
    isError: isBranchesError,
    error: branchesError,
  } = useBranches(owner, repoName);

  const [selectedBranch, setSelectedBranch] = useState("");

  // Log error exceptions
  useEffect(() => {
    if (isReposError) {
      console.error("Failed to fetch repositories:", reposError);
    }
  }, [isReposError, reposError]);

  useEffect(() => {
    if (isBranchesError) {
      console.error("Failed to fetch branches:", branchesError);
    }
  }, [isBranchesError, branchesError]);

  // Handle repository selection logic
  useEffect(() => {
    if (repositories.length > 0) {
      const hasSelected = repositories.some((r) => r.id === selectedRepoId);
      if (!hasSelected) {
        setSelectedRepoId(repositories[0].id);
      }
    } else {
      setSelectedRepoId("");
    }
  }, [repositories]);

  // Handle branch selection logic
  useEffect(() => {
    if (branches.length > 0) {
      const hasSelected = branches.some((b) => b.name === selectedBranch);
      if (!hasSelected) {
        setSelectedBranch(branches[0].name);
      }
    } else {
      setSelectedBranch("");
    }
  }, [branches]);

  const isRepoDisabled = repositoriesLoading || isReposError || repositories.length === 0;
  const isBranchDisabled = branchesLoading || isBranchesError || isReposError || branches.length === 0;

  return (
    <section className="col-span-12 lg:col-span-7 bg-surface border-[3px] border-outline p-8 flex flex-col gap-8 brutalist-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-black uppercase flex items-center gap-3 text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed !text-3xl">rocket_launch</span>
          Initialize Context
        </h3>
        <span className="font-mono-label text-xs font-bold bg-primary-fixed text-on-primary-fixed px-2 py-1">GPU_ACCELERATED</span>
      </div>
      
      <div className="grid grid-cols-2 gap-6">
        <RepositoryDropdown
          repositories={repositories}
          value={selectedRepoId}
          onChange={(id) => setSelectedRepoId(Number(id))}
          disabled={isRepoDisabled}
        />
        <BranchDropdown
          branches={branches}
          value={selectedBranch}
          onChange={setSelectedBranch}
          disabled={isBranchDisabled}
        />
      </div>
      
      <div className="space-y-2">
        <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Task Objective</label>
        <textarea 
          className="w-full bg-background border-2 border-outline p-4 text-on-surface font-mono-label text-sm focus:border-primary-fixed ring-0 outline-none resize-none" 
          placeholder="DESCRIBE_TASK_HERE..." 
          rows={4}
        />
      </div>
      
      <div className="flex justify-between items-center pt-6 border-t-2 border-outline-variant">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 font-mono-label text-xs font-bold uppercase text-on-surface">
            <span className="material-symbols-outlined text-primary-fixed">bolt</span>
            Low_Latency
          </div>
          <div className="flex items-center gap-2 font-mono-label text-xs font-bold uppercase text-on-surface">
            <span className="material-symbols-outlined text-primary-fixed">visibility</span>
            Full_Trace
          </div>
        </div>
        
        <button className="px-10 py-4 bg-primary-fixed text-on-primary-fixed font-black uppercase text-lg border-[3px] border-background brutalist-shadow-sm flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none">
          Run Agent
          <span className="material-symbols-outlined font-black">arrow_forward</span>
        </button>
      </div>
    </section>
  );
}
