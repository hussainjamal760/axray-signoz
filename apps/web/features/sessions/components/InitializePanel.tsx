"use client";

import { useState } from "react";
import { RepositoryDropdown, BranchDropdown } from "@/features/repositories/components";

export function InitializePanel() {
  const mockRepos = [
    { id: 1, name: "core-engine", owner: "agent-black-box", fullName: "agent-black-box/core-engine", defaultBranch: "main", private: true },
    { id: 2, name: "dashboard-ui", owner: "agent-black-box", fullName: "agent-black-box/dashboard-ui", defaultBranch: "main", private: false }
  ];

  const mockBranches = [
    { name: "main", protected: true },
    { name: "feature/auth-rework", protected: false }
  ];

  const [selectedRepo, setSelectedRepo] = useState("agent-black-box/core-engine");
  const [selectedBranch, setSelectedBranch] = useState("main");

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
          repositories={mockRepos}
          value={selectedRepo}
          onChange={setSelectedRepo}
        />
        <BranchDropdown
          branches={mockBranches}
          value={selectedBranch}
          onChange={setSelectedBranch}
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
