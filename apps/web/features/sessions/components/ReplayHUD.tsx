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
    <footer className="bg-surface-container-high border-t-[3px] border-primary-fixed px-6 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-6 shrink-0 relative z-20 font-mono-label">
      {/* 1. Playback Controls */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setIsPlaying(false);
            onStepChange?.(0);
          }}
          disabled={totalSteps === 0}
          className="w-9 h-9 flex items-center justify-center border-2 border-outline text-on-surface hover:bg-surface-variant hover:text-white disabled:opacity-40 transition-all brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
          title="Reset to Step 1"
        >
          <span className="material-symbols-outlined text-sm">restart_alt</span>
        </button>

        <button
          type="button"
          onClick={handlePrevStep}
          disabled={totalSteps === 0 || activeStepIndex === 0}
          className="w-9 h-9 flex items-center justify-center border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed disabled:opacity-40 transition-all brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
          title="Previous Step"
        >
          <span className="material-symbols-outlined text-base">skip_previous</span>
        </button>

        <button
          type="button"
          onClick={handleTogglePlay}
          disabled={totalSteps === 0}
          className="w-10 h-10 flex items-center justify-center border-2 border-primary-fixed bg-primary-fixed text-on-primary-fixed hover:bg-surface-variant hover:text-primary-fixed disabled:opacity-40 transition-all brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
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
          className="w-9 h-9 flex items-center justify-center border-2 border-primary-fixed text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed disabled:opacity-40 transition-all brutalist-shadow-sm active:translate-x-0.5 active:translate-y-0.5"
          title="Next Step"
        >
          <span className="material-symbols-outlined text-base">skip_next</span>
        </button>

        <button
          type="button"
          onClick={handleSpeedToggle}
          className="px-2 py-1 text-[11px] font-black border-2 border-outline text-primary-fixed bg-surface hover:bg-surface-variant transition-colors"
          title="Toggle Playback Speed"
        >
          {playbackSpeed}x
        </button>
      </div>

      {/* 2. Interactive Time-Travel Scrubber */}
      <div className="flex-1 w-full flex flex-col gap-1.5">
        <div className="flex justify-between text-xs font-bold text-on-surface">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm text-primary-fixed">history_toggle_off</span>
            <span className="text-white font-black">
              {currentEvent ? `STEP ${activeStepIndex + 1}/${totalSteps}: ${currentEvent.title}` : activeRun ? `RUN #${activeRun.id.slice(-6).toUpperCase()}` : 'NO RUN SELECTED'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-on-surface-variant font-bold">
            {currentEvent?.durationMs !== undefined && (
              <span>Duration: {currentEvent.durationMs}ms</span>
            )}
            <span className="text-primary-fixed font-black">{progressPercent.toFixed(0)}%</span>
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
            className="w-full accent-primary-fixed bg-background cursor-pointer h-2 border-2 border-outline rounded-none z-20"
          />

          {/* Progress Overlay Track */}
          <div
            className="absolute top-1.5 left-0 h-2 bg-primary-fixed pointer-events-none z-10"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3. Trajectory Step Card */}
      <div className="hidden lg:flex flex-col items-end gap-1 text-right min-w-[200px]">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping" />
          <span>SIGNOZ TRAJECTORY REPLAY</span>
        </div>
        <span className="text-[11px] text-on-surface-variant font-bold truncate max-w-[220px]">
          {currentEvent?.description || currentEvent?.eventType || "Ready for Time-Travel"}
        </span>
      </div>
    </footer>
  );
}
