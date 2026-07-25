import React, { useState } from "react";

export interface InitializeContextPanelProps {
  onSubmit?: (prompt: string) => void;
  onCancel?: () => void;
  isPending?: boolean;
  isRunning?: boolean;
  disabled?: boolean;
  liveStatusText?: string;
}

export function InitializeContextPanel({
  onSubmit,
  onCancel,
  isPending = false,
  isRunning = false,
  disabled = false,
  liveStatusText,
}: InitializeContextPanelProps) {
  const [prompt, setPrompt] = useState("");

  const isActive = isPending || isRunning;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isActive && onCancel) {
      onCancel();
      return;
    }
    if (prompt.trim() && onSubmit && !isActive && !disabled) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border-[3px] border-outline p-4 flex flex-col gap-4 brutalist-shadow h-[220px]">
      <div className="flex-1 relative h-full">
        <textarea
          value={prompt}
          disabled={isActive || disabled}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-full min-h-[56px] bg-background border-[2px] border-outline p-4 text-on-surface font-mono-label text-sm focus:border-primary-fixed ring-0 outline-none resize-none disabled:opacity-50"
          placeholder={isActive ? liveStatusText || "Agent execution in progress..." : "DESCRIBE_TASK_HERE (e.g. 'Fix the failing test in auth module')..."}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={(!prompt.trim() && !isActive) || (disabled && !isActive)}
        className={`w-full py-3 font-black uppercase text-sm border-[3px] border-on-background brutalist-shadow-sm flex items-center justify-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${isActive
          ? "bg-error text-error-content border-error animate-pulse"
          : "bg-primary-fixed text-on-primary-fixed"
          }`}
      >
        {isActive ? (
          <div className="text-black">
            Agent Running - Force Stop
          </div>
        ) : (
          <>
            Run Agent
            <span className="material-symbols-outlined font-black text-sm">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
