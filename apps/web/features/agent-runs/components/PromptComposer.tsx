import { useState } from 'react';

export interface PromptComposerProps {
  onSubmit: (prompt: string) => void;
  loading: boolean;
  disabled?: boolean;
}

export function PromptComposer({ onSubmit, loading, disabled }: PromptComposerProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading || disabled) return;
    onSubmit(prompt.trim());
    setPrompt('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface border-[3px] border-outline p-6 brutalist-shadow space-y-4">
      <div className="space-y-2">
        <label className="font-mono-label text-xs font-black uppercase text-primary-fixed">Agent Objective</label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={loading || disabled}
          className="w-full bg-background border-2 border-outline p-4 text-on-surface font-mono-label text-sm focus:border-primary-fixed ring-0 outline-none resize-none disabled:opacity-50"
          placeholder="Describe what you want the agent to do..."
          rows={3}
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading || disabled || !prompt.trim()}
          className="px-8 py-3 bg-primary-fixed text-on-primary-fixed font-black uppercase text-sm border-[3px] border-background brutalist-shadow-sm flex items-center gap-3 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Launching...' : 'Run Agent'}
          <span className="material-symbols-outlined font-black">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
