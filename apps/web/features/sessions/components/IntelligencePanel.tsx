import React from 'react';
import { Cpu } from "@phosphor-icons/react/dist/ssr";
import { AgentRunSummary, TimelineEvent } from "@/features/agent-runs/types";
import dynamic from "next/dynamic";

const ContextGraph = dynamic(() => import("./ContextGraph"), { ssr: false });

export interface IntelligencePanelProps {
  activeRun?: AgentRunSummary | null;
  events?: TimelineEvent[];
}

export function IntelligencePanel({ activeRun, events = [] }: IntelligencePanelProps) {
  const durationStr = activeRun?.durationMs ? `${(activeRun.durationMs / 1000).toFixed(1)}s` : '-';
  const tokensStr = activeRun?.tokensUsed ? `${activeRun.tokensUsed.toLocaleString()}` : '-';
  const modelStr = activeRun?.modelName || 'openai/gpt-oss-20b';

  return (
    <div className="w-96 flex-col h-full bg-surface-container-lowest/30 backdrop-blur-xl shrink-0 hidden xl:flex overflow-y-auto custom-scrollbar border-l border-outline-variant/10" data-lenis-prevent="true">
      <div className="p-4 border-b border-outline-variant/10 bg-surface-container-lowest/60 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-fixed text-base">psychology</span>
          <span className="text-xs font-bold text-on-surface tracking-wider">AGENT INTELLIGENCE</span>
        </div>
        <span className="bg-primary-fixed/10 border border-primary-fixed/20 text-primary-fixed text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full">
          SigNoz OTEL
        </span>
      </div>

      <div className="p-5 border-b border-outline-variant/10 shrink-0 bg-surface-container-lowest/20">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60 mb-1.5">Target Objective</h3>
        <p className="text-xs font-semibold text-primary-fixed leading-relaxed">
          "{activeRun?.prompt || 'No active prompt objective selected.'}"
        </p>
      </div>

      <div className="grid grid-cols-3 border-b border-outline-variant/10 shrink-0 bg-surface-container-lowest/40">
        <div className="p-3.5 border-r border-outline-variant/10 flex flex-col items-center text-center">
          <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/60 uppercase">TOKENS</span>
          <span className="font-mono text-xs font-bold text-primary-fixed mt-0.5">{tokensStr}</span>
        </div>
        <div className="p-3.5 border-r border-outline-variant/10 flex flex-col items-center text-center">
          <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/60 uppercase">MODEL</span>
          <span className="font-mono text-xs font-bold text-primary-fixed truncate max-w-[80px] mt-0.5" title={modelStr}>
            {modelStr.split('/')[1] || modelStr}
          </span>
        </div>
        <div className="p-3.5 flex flex-col items-center text-center">
          <span className="text-[9px] font-bold tracking-widest text-on-surface-variant/60 uppercase">LATENCY</span>
          <span className="font-mono text-xs font-bold text-primary-fixed mt-0.5">{durationStr}</span>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col overflow-hidden p-4">
        <div className="flex justify-between items-center shrink-0 mb-3">
          <span className="text-xs font-bold text-on-surface tracking-wider">CONTEXT GRAPH</span>
          <span className="material-symbols-outlined text-primary-fixed text-sm cursor-pointer hover:scale-110 transition-transform">open_in_full</span>
        </div>

        <div className="flex-1 relative overflow-hidden bg-surface-container-lowest/50 backdrop-blur-md rounded-2xl border border-white/5 flex items-center justify-center flex-col group p-0">
          <ContextGraph activeRun={activeRun} events={events} />
        </div>
      </div>
    </div>
  );
}
