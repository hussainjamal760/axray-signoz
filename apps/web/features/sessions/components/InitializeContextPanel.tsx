import React, { useState } from "react";

export function InitializeContextPanel() {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      console.log("Running agent with prompt:", prompt);
      setPrompt("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border-[3px] border-outline p-8 flex flex-col gap-8 brutalist-shadow h-full">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-black uppercase flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-fixed !text-3xl">rocket_launch</span>
          Initialize Context
        </h3>
        <span className="font-mono-label text-xs font-bold bg-primary-fixed text-on-primary-fixed px-2 py-1">GPU_ACCELERATED</span>
      </div>

      <div className="space-y-2 flex-1">
        <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Task Objective</label>
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-full min-h-[120px] bg-background border-[2px] border-outline p-4 text-on-surface font-mono-label text-sm focus:border-primary-fixed ring-0 outline-none resize-none" 
          placeholder="DESCRIBE_TASK_HERE..."
        ></textarea>
      </div>

      <div className="flex justify-between items-center pt-6 border-t-2 border-outline-variant">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 font-mono-label text-xs font-bold uppercase">
            <span className="material-symbols-outlined text-primary-fixed">bolt</span>
            Low_Latency
          </div>
          <div className="flex items-center gap-2 font-mono-label text-xs font-bold uppercase">
            <span className="material-symbols-outlined text-primary-fixed">visibility</span>
            Full_Trace
          </div>
        </div>

        <button
          type="submit"
          disabled={!prompt.trim()}
          className="px-10 py-4 bg-primary-fixed text-on-primary-fixed font-black uppercase text-lg border-[3px] border-on-background brutalist-shadow-sm flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Run Agent
          <span className="material-symbols-outlined font-black">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
