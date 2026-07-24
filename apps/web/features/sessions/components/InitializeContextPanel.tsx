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
    <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-outline-variant/30 rounded-3xl p-6 flex flex-col gap-4 shadow-sm h-[220px] transition-all hover:border-primary-fixed/30">
      <div className="flex-1 relative h-full">
        <textarea
          value={prompt}
          disabled={isActive || disabled}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full h-full min-h-[56px] bg-surface-container-highest border border-outline-variant/30 rounded-2xl p-4 text-on-surface text-sm focus:border-primary-fixed ring-0 outline-none resize-none disabled:opacity-50 transition-colors"
          placeholder={isActive ? liveStatusText || "Agent execution in progress..." : "Describe task here (e.g. 'Fix the failing test in auth module')..."}
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={(!prompt.trim() && !isActive) || (disabled && !isActive)}
        className={`w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shrink-0 ${
          isActive
            ? "bg-rose-500 text-white animate-pulse"
            : "bg-primary-fixed text-black hover:brightness-110 shadow-[0_4px_20px_rgba(204,255,0,0.15)]"
        }`}
      >
        {isActive ? (
          <div>
            Agent Running - Force Stop
          </div>
        ) : (
          <>
            Run Agent
            <span className="material-symbols-outlined font-bold text-sm">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}
