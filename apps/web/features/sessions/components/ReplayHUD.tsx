"use client";

import React, { useState, useEffect } from "react";
import { AgentRunSummary, TimelineEvent } from "@/features/agent-runs/types";

export interface ReplayHUDProps {
  activeRun?: AgentRunSummary | null;
  events?: TimelineEvent[];
  activeStepIndex?: number;
  onStepChange?: (index: number) => void;
}

export function ReplayHUD({
  activeRun,
  events = [],
  activeStepIndex = 0,
  onStepChange,
}: ReplayHUDProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 2 | 4>(1);

  const totalSteps = events.length;
  const currentEvent = events[activeStepIndex] || null;

  // Auto-advance playback timer
  useEffect(() => {
    if (!isPlaying || totalSteps === 0) return;

    const intervalMs = Math.round(1500 / playbackSpeed);
    const timer = setInterval(() => {
      if (activeStepIndex < totalSteps - 1) {
        onStepChange?.(activeStepIndex + 1);
      } else {
        setIsPlaying(false);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPlaying, activeStepIndex, totalSteps, playbackSpeed, onStepChange]);

  const handlePrevStep = () => {
    if (activeStepIndex > 0) {
      onStepChange?.(activeStepIndex - 1);
    }
  };

  const handleNextStep = () => {
    if (activeStepIndex < totalSteps - 1) {
      onStepChange?.(activeStepIndex + 1);
    }
  };

  const handleTogglePlay = () => {
    if (totalSteps === 0) return;
    if (activeStepIndex >= totalSteps - 1) {
      onStepChange?.(0);
      setIsPlaying(true);
    } else {
      setIsPlaying((prev) => !prev);
    }
  };

  const handleSpeedToggle = () => {
    setPlaybackSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 4 : 1));
  };

  const progressPercent = totalSteps > 1 ? (activeStepIndex / (totalSteps - 1)) * 100 : totalSteps === 1 ? 100 : 0;

  return (
    <footer className="bg-surface-container-lowest/80 backdrop-blur-2xl border-t border-outline-variant/10 px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 shrink-0 relative z-20 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
      {/* 1. Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            onStepChange?.(0);
          }}
          disabled={totalSteps === 0}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-on-surface-variant hover:text-white disabled:opacity-30 transition-all duration-300 active:scale-95 flex items-center justify-center"
          title="Reset to Step 1"
        >
          <span className="material-symbols-outlined text-base">restart_alt</span>
        </button>

        <button
          type="button"
          onClick={handlePrevStep}
          disabled={totalSteps === 0 || activeStepIndex === 0}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-primary-fixed disabled:opacity-30 transition-all duration-300 active:scale-95 flex items-center justify-center"
          title="Previous Step"
        >
          <span className="material-symbols-outlined text-base">skip_previous</span>
        </button>

        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={totalSteps === 0}
          className="w-10 h-10 rounded-xl bg-primary-fixed text-[#0a0c10] font-bold hover:brightness-110 disabled:opacity-30 transition-all duration-300 active:scale-95 flex items-center justify-center shadow-[0_0_15px_rgba(var(--color-primary-fixed),0.3)]"
          title={isPlaying ? "Pause Playback" : "Play Trajectory Replay"}
        >
          <span className="material-symbols-outlined text-xl">
            {isPlaying ? "pause" : "play_arrow"}
          </span>
        </button>

        <button
          type="button"
          onClick={handleNextStep}
          disabled={totalSteps === 0 || activeStepIndex >= totalSteps - 1}
          className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-primary-fixed disabled:opacity-30 transition-all duration-300 active:scale-95 flex items-center justify-center"
          title="Next Step"
        >
          <span className="material-symbols-outlined text-base">skip_next</span>
        </button>

        <button
          type="button"
          onClick={handleSpeedToggle}
          className="px-3 py-1.5 rounded-xl text-[11px] font-mono font-bold border border-white/10 text-primary-fixed bg-white/5 hover:bg-white/10 transition-colors"
          title="Toggle Playback Speed"
        >
          {playbackSpeed}x
        </button>
      </div>

      {/* 2. Interactive Time-Travel Scrubber */}
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-semibold text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary-fixed">history_toggle_off</span>
            <span className="text-on-surface font-bold tracking-tight">
              {currentEvent ? `STEP ${activeStepIndex + 1}/${totalSteps}: ${currentEvent.title}` : activeRun ? `RUN #${activeRun.id.slice(-6).toUpperCase()}` : 'NO RUN SELECTED'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-medium">
            {currentEvent?.durationMs !== undefined && (
              <span className="font-mono">{currentEvent.durationMs}ms</span>
            )}
            <span className="text-primary-fixed font-mono font-bold">{progressPercent.toFixed(0)}%</span>
          </div>
        </div>

        {/* Scrubber Range Slider Bar */}
        <div className="relative w-full h-5 flex items-center">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={activeStepIndex}
            onChange={(e) => {
              setIsPlaying(false);
              onStepChange?.(Number(e.target.value));
            }}
            disabled={totalSteps === 0}
            className="w-full accent-primary-fixed bg-surface-container-high cursor-pointer h-2 border border-outline-variant/20 rounded-full z-20 opacity-90 hover:opacity-100 transition-opacity"
          />

          {/* Progress Overlay Track */}
          <div
            className="absolute top-[6px] left-0 h-2 bg-gradient-to-r from-primary-fixed to-primary-fixed/80 rounded-full pointer-events-none z-10 shadow-[0_0_10px_rgba(var(--color-primary-fixed),0.5)]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Trajectory Step Card */}
      <div className="hidden lg:flex flex-col items-end gap-1 text-right min-w-[200px]">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full shadow-sm">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span className="tracking-wide">SIGNOZ REPLAY</span>
        </div>
        <span className="text-[11px] text-on-surface-variant font-medium truncate max-w-[220px]">
          {currentEvent?.description || currentEvent?.eventType || "Ready for Time-Travel"}
        </span>
      </div>
    </footer>
  );
}
