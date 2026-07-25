"use client";

import React, { useState, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useRuns, useRunTimeline } from "@/features/agent-runs/hooks";
import { useSession, useSpanLogs } from "@/features/sessions/hooks";
import { TimelineEvent } from "@/features/agent-runs/types";
import { RunStatusBadge } from "@/features/agent-runs/components/RunStatusBadge";

interface TraceSpanNode {
  id: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: "LLM" | "TOOL" | "WORKSPACE" | "AGENT_RUN" | "ERROR";
  status: "OK" | "ERROR" | "RUNNING";
  durationMs?: number;
  startTime: number;
  tokens?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  costUsd?: number;
  model?: string;
  attributes: Record<string, any>;
  children: TraceSpanNode[];
}

export default function TracesExplorerPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = typeof params?.id === "string" ? params.id : "";
  const queryRunId = searchParams?.get("runId") || searchParams?.get("run") || "";

  const { data: session } = useSession(id);
  const { data: runs = [], isLoading: runsLoading } = useRuns(id);

  // Automatically select run matching runId in URL, or default to latest run
  const activeRun = useMemo(() => {
    if (queryRunId && runs.length > 0) {
      const match = runs.find((r) => r.id === queryRunId);
      if (match) return match;
    }
    return runs[0] || null;
  }, [queryRunId, runs]);

  const activeRunId = activeRun?.id || "";

  const [selectedSpan, setSelectedSpan] = useState<TraceSpanNode | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [kindFilter, setKindFilter] = useState<"ALL" | "LLM" | "TOOL" | "WORKSPACE" | "ERROR">("ALL");
  const [showHallucinations, setShowHallucinations] = useState(false);
  const [activeTab, setActiveTab] = useState<"attributes" | "logs">("attributes");

  const { data: timelineData, isLoading: timelineLoading } = useRunTimeline(activeRunId, {
    enabled: Boolean(activeRunId),
  });

  const { data: spanLogs, isLoading: logsLoading } = useSpanLogs(
    activeRunId,
    selectedSpan?.spanId
  );

  const handleSelectRunChange = (newRunId: string) => {
    if (newRunId) {
      setSelectedSpan(null);
      router.push(`/sessions/${id}/traces?runId=${newRunId}`);
    }
  };

  // Transform timeline events into an OpenTelemetry Span Tree
  const traceTree: TraceSpanNode | null = useMemo(() => {
    if (!timelineData?.events || timelineData.events.length === 0) {
      if (!activeRun) return null;
      // Fallback synthetic tree from run metadata
      return {
        id: activeRun.id,
        spanId: `span-root-${activeRun.id.slice(-6)}`,
        name: `agent.run [${activeRun.prompt?.slice(0, 30) || "run"}]`,
        kind: "AGENT_RUN",
        status: activeRun.status === "completed" ? "OK" : activeRun.status === "failed" ? "ERROR" : "RUNNING",
        durationMs: activeRun.durationMs || 0,
        startTime: new Date(activeRun.createdAt).getTime(),
        tokens: { total: activeRun.tokensUsed || 0 },
        costUsd: activeRun.cost || 0,
        attributes: {
          "agent.run_id": activeRun.id,
          "agent.session_id": id,
          "agent.status": activeRun.status,
          "gen_ai.system": "groq/deepseek",
          "telemetry.sdk.language": "typescript",
          "telemetry.sdk.name": "opentelemetry-signoz",
        },
        children: [],
      };
    }

    const events = timelineData.events;
    const rootSpanStartTime = new Date(events[0].timestamp).getTime();
    const lastEvTime = new Date(events[events.length - 1].timestamp).getTime();
    const rootDuration = lastEvTime - rootSpanStartTime;

    const childrenNodes: TraceSpanNode[] = [];

    events.forEach((ev: TimelineEvent, idx: number) => {
      const evTime = new Date(ev.timestamp).getTime();
      let kind: TraceSpanNode["kind"] = "WORKSPACE";
      if (ev.phase === "llm") kind = "LLM";
      else if (ev.phase === "tool") kind = "TOOL";
      else if (ev.status === "failed" || ev.phase === "error") kind = "ERROR";

      const meta = ev.metadata || {};

      const node: TraceSpanNode = {
        id: ev.id || `ev-${idx}`,
        spanId: ev.id || `span-${idx}-${ev.timestamp}`,
        name: ev.title || ev.eventType,
        kind,
        status: ev.status === "failed" ? "ERROR" : "OK",
        durationMs: ev.durationMs || (idx < events.length - 1 ? new Date(events[idx + 1].timestamp).getTime() - evTime : 50),
        startTime: evTime,
        tokens: typeof meta.tokensUsed === "number" ? { total: meta.tokensUsed } : undefined,
        costUsd: typeof meta.costUsd === "number" ? meta.costUsd : undefined,
        model: typeof meta.model === "string" ? meta.model : undefined,
        attributes: {
          "event.type": ev.eventType,
          "event.phase": ev.phase,
          "event.description": ev.description || "",
          ...meta,
        },
        children: [],
      };
      childrenNodes.push(node);
    });

    const rootNode: TraceSpanNode = {
      id: activeRun?.id || "root",
      spanId: `span-root-${(activeRun?.id || "0").slice(-6)}`,
      name: `agent.run: ${activeRun?.prompt?.slice(0, 45) || "Session Execution"}`,
      kind: "AGENT_RUN",
      status: activeRun?.status === "completed" ? "OK" : activeRun?.status === "failed" ? "ERROR" : "RUNNING",
      durationMs: activeRun?.durationMs || rootDuration,
      startTime: rootSpanStartTime,
      tokens: { total: activeRun?.tokensUsed || 0 },
      costUsd: activeRun?.cost || 0,
      attributes: {
        "service.name": "axray-agent-service",
        "service.namespace": "axray-signoz",
        "agent.session_id": id,
        "agent.run_id": activeRun?.id,
        "otel.status_code": activeRun?.status === "completed" ? "UNSET" : "ERROR",
      },
      children: childrenNodes,
    };

    return rootNode;
  }, [timelineData, activeRun, id]);

  // Auto-select the root span when trace tree is loaded and nothing is selected yet
  React.useEffect(() => {
    if (traceTree && !selectedSpan) {
      setSelectedSpan(traceTree);
    }
  }, [traceTree]);

  const filterNode = (node: TraceSpanNode): boolean => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(node.attributes).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesKind = kindFilter === "ALL" || node.kind === kindFilter;
    const matchesHallucination = !showHallucinations || node.attributes.hallucination === true || node.attributes["llm.hallucination"] === true;
    return matchesSearch && matchesKind && matchesHallucination;
  };

  const backToSessionLink = id ? `/sessions/${id}` : "/sessions";

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-sans">
      {/* 1. Simplified Context Header (Only Run Selection Dropdown & Back Button) */}
      <section className="px-4 md:px-6 py-3 border-b border-outline-variant/20 bg-surface-container-lowest/60 backdrop-blur-md flex items-center justify-between gap-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link
            href={backToSessionLink}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant hover:text-white hover:border-primary-fixed/50 font-mono text-xs font-semibold transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Back to Workspace</span>
          </Link>
          
          <div className="h-5 w-px bg-outline-variant/30 hidden sm:block" />

          <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold hidden md:inline-block">
            Trace Explorer
          </span>
        </div>

        {/* Run Selection Dropdown */}
        {runs.length > 0 && (
          <div className="flex items-center gap-2.5 bg-surface-container-high/80 border border-primary-fixed/40 px-4 py-2 rounded-2xl font-mono text-xs font-bold text-primary-fixed shadow-[0_0_15px_rgba(220,238,0,0.15)]">
            <span className="material-symbols-outlined text-[16px] text-primary-fixed">history</span>
            <select
              value={activeRun?.id || ""}
              onChange={(e) => handleSelectRunChange(e.target.value)}
              className="bg-transparent text-primary-fixed font-mono text-xs font-extrabold outline-none cursor-pointer max-w-[280px] sm:max-w-[360px] truncate appearance-none"
            >
              {runs.map((r, index) => (
                <option key={r.id} value={r.id} className="bg-surface-container-lowest text-white">
                  Run #{runs.length - index} — {r.prompt ? (r.prompt.length > 30 ? `${r.prompt.slice(0, 30)}...` : r.prompt) : r.id.slice(-6)} ({r.status.toUpperCase()})
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined text-[16px] pointer-events-none text-primary-fixed">expand_more</span>
          </div>
        )}
      </section>

      {/* 2. Search & Filter Bar */}
      <div className="px-6 py-4 bg-surface-container-lowest/20 backdrop-blur-sm border-b border-outline-variant/10 flex flex-wrap items-center justify-between gap-4 shrink-0 z-10">
        <div className="flex items-center gap-3 flex-1 min-w-[240px] bg-surface-container/30 border border-outline-variant/20 rounded-full px-4 py-2">
          <span className="material-symbols-outlined text-outline text-lg">search</span>
          <input
            type="text"
            placeholder="Search spans, attributes, tools, errors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-[13px] text-white placeholder-outline focus:outline-none w-full font-medium"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white uppercase border border-outline-variant/20 rounded-full px-4 py-2 bg-surface-container/30 transition-all hover:bg-surface-container/50 hover:border-yellow-400/30">
            <input 
              type="checkbox" 
              checked={showHallucinations} 
              onChange={(e) => setShowHallucinations(e.target.checked)}
              className="accent-yellow-400 w-3.5 h-3.5 rounded-full"
            />
            <span className={showHallucinations ? "text-yellow-400" : "text-on-surface-variant"}>
              <span className="text-[10px] mr-1">⚠️</span>Show Hallucinations
            </span>
          </label>
          <div className="flex items-center gap-2">
          {(["ALL", "LLM", "TOOL", "WORKSPACE", "ERROR"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                kindFilter === k
                  ? "bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/30 shadow-[0_0_12px_rgba(var(--color-primary-fixed),0.3)]"
                  : "bg-surface-container/30 border border-outline-variant/20 text-on-surface-variant hover:text-white hover:bg-surface-container/50"
              }`}
            >
              {k}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* 3. Main Scrollable Workspace Canvas & Details Drawer */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden relative">
        {/* Connected Trace Canvas (Fully Scrollable) */}
        <div
          className="flex-1 overflow-auto p-8 relative bg-transparent custom-scrollbar h-full"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
          data-lenis-prevent="true"
        >
          {runsLoading || timelineLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-primary-fixed border-t-transparent animate-spin" />
              <span className="text-xs text-outline font-bold uppercase animate-pulse">Loading OpenTelemetry Connected Spans...</span>
            </div>
          ) : !traceTree ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3">
              <span className="material-symbols-outlined text-4xl text-outline">analytics</span>
              <span className="text-xs text-outline font-bold uppercase">No traces recorded yet</span>
            </div>
          ) : (
            <div className="flex flex-col relative min-w-[850px] pb-24">
              <ConnectedSpanNodeRenderer
                node={traceTree}
                isRoot={true}
                selectedSpanId={selectedSpan?.spanId}
                onSelectSpan={setSelectedSpan}
                filterFunc={filterNode}
              />
            </div>
          )}
        </div>

        {/* Span Details Side Panel */}
        {selectedSpan && (
          <div className="w-full lg:w-[420px] border-l border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-3xl p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-30 shadow-[-8px_0_30px_rgba(0,0,0,0.2)] h-full shrink-0" data-lenis-prevent="true">
            <div className="flex justify-between items-start border-b border-outline-variant/20 pb-4">
              <div>
                <span className="text-[10px] bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded-full px-2.5 py-1 font-bold uppercase tracking-wider">
                  {selectedSpan.kind} SPAN
                </span>
                <h3 className="text-xl font-bold text-white mt-3 break-all">{selectedSpan.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpan(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant hover:text-white hover:bg-surface-container transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 bg-surface-container/30 rounded-2xl p-4 border border-outline-variant/20 shadow-inner">
              <div>
                <span className="text-[9px] text-on-surface-variant font-bold uppercase block tracking-wider">Duration</span>
                <span className="text-lg font-mono text-white">{selectedSpan.durationMs}ms</span>
              </div>
              <div>
                <span className="text-[9px] text-on-surface-variant font-bold uppercase block tracking-wider">Status</span>
                <span className={`text-lg font-mono font-bold ${selectedSpan.status === "ERROR" ? "text-rose-400" : "text-emerald-400"}`}>
                  {selectedSpan.status}
                </span>
              </div>
              {selectedSpan.tokens?.total !== undefined && (
                <div>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase block tracking-wider">Tokens</span>
                  <span className="text-lg font-mono text-primary-fixed">{selectedSpan.tokens.total}</span>
                </div>
              )}
              {selectedSpan.model && (
                <div>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase block tracking-wider">Model</span>
                  <span className="text-xs font-mono text-white">{selectedSpan.model}</span>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-6 border-b border-outline-variant/20 pb-1 mt-2">
              <button
                onClick={() => setActiveTab("attributes")}
                className={`text-[11px] font-bold uppercase pb-2 border-b-[3px] transition-all ${
                  activeTab === "attributes"
                    ? "border-primary-fixed text-primary-fixed"
                    : "border-transparent text-on-surface-variant hover:text-white"
                }`}
              >
                Attributes
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`text-[11px] font-bold uppercase pb-2 border-b-[3px] transition-all flex items-center gap-1.5 ${
                  activeTab === "logs"
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-on-surface-variant hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                Logs
              </button>
            </div>

            {activeTab === "attributes" ? (
              <>
                {/* Attributes Table */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-white mb-3 flex items-center gap-2 tracking-widest">
                    <span className="material-symbols-outlined text-[14px] text-primary-fixed">key</span>
                    Span Attributes
                  </h4>
                  <div className="bg-[#050503]/50 rounded-xl border border-outline-variant/10 p-4 space-y-3 text-xs overflow-x-auto max-h-[300px] custom-scrollbar shadow-inner" data-lenis-prevent="true">
                    {Object.entries(selectedSpan.attributes).map(([k, v]) => (
                      <div key={k} className="flex flex-col border-b border-outline-variant/5 pb-2 last:border-none last:pb-0">
                        <span className="text-[10px] text-primary-fixed/80 font-mono font-medium uppercase">{k}</span>
                        <span className="text-on-surface-variant/90 font-mono break-all text-[11px] mt-0.5">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw JSON */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-white mb-2 tracking-widest">OTEL Raw Payload</h4>
                  <pre className="bg-[#050503]/50 rounded-xl border border-outline-variant/10 p-4 text-[10px] text-emerald-400/80 font-mono overflow-x-auto max-h-[200px] custom-scrollbar shadow-inner" data-lenis-prevent="true">
                    {JSON.stringify(selectedSpan, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="bg-[#050503]/50 rounded-xl border border-outline-variant/10 p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px] shadow-inner" data-lenis-prevent="true">
                  {logsLoading ? (
                    <div className="h-full flex flex-col items-center justify-center text-outline animate-pulse">
                      <span className="material-symbols-outlined mb-2 text-2xl">sync</span>
                      Fetching correlated logs...
                    </div>
                  ) : !spanLogs || spanLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-outline">
                      <span className="material-symbols-outlined mb-2 text-2xl">visibility_off</span>
                      No container logs found for this span window.
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {spanLogs.map((log, idx) => (
                        <div key={idx} className="flex items-start gap-3">
                          <span className="text-on-surface-variant/50 select-none whitespace-nowrap">
                            {new Date(log.timestamp).toISOString().substring(11, 23)}
                          </span>
                          <span
                            className={`flex-1 break-all whitespace-pre-wrap ${
                              log.severity === 'ERROR'
                                ? 'text-error font-bold'
                                : log.severity === 'WARN'
                                ? 'text-yellow-400'
                                : 'text-emerald-400'
                            }`}
                          >
                            {log.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Connected Visual Tree Node Component (Always Open & Fully Connected Flow)
function ConnectedSpanNodeRenderer({
  node,
  isRoot = false,
  selectedSpanId,
  onSelectSpan,
  filterFunc,
}: {
  node: TraceSpanNode;
  isRoot?: boolean;
  selectedSpanId?: string;
  onSelectSpan: (span: TraceSpanNode) => void;
  filterFunc: (node: TraceSpanNode) => boolean;
}) {
  // Always open as requested ("WORKSPACE SPAN / Agent Started ye wala section always open rahy")
  const [isExpanded, setIsExpanded] = useState(true);
  
  // A node should be visible if it matches, OR if any of its descendants match
  const checkMatchesRecursively = (n: TraceSpanNode): boolean => {
    if (filterFunc(n)) return true;
    return n.children.some(checkMatchesRecursively);
  };
  
  const isVisible = checkMatchesRecursively(node);
  const matchesExactly = filterFunc(node);

  const hasChildren = node.children && node.children.length > 0;
  const isLLM = node.kind === "LLM";
  const isTool = node.kind === "TOOL";
  const isFailed = node.status === "ERROR";
  const isSelected = selectedSpanId === node.spanId;

  const borderColor = isSelected
    ? "border-white shadow-[0_0_20px_rgba(255,255,255,0.15)]"
    : isFailed
    ? "border-rose-500/30 hover:border-rose-500/60"
    : isLLM
    ? "border-cyan-400/30 hover:border-cyan-400/60"
    : isTool
    ? "border-yellow-400/30 hover:border-yellow-400/60"
    : "border-primary-fixed/30 hover:border-primary-fixed/60";

  const textColor = isFailed ? "text-rose-400" : isLLM ? "text-cyan-400" : isTool ? "text-yellow-400" : "text-primary-fixed";
  const lineColor = isFailed ? "bg-rose-500/80" : isLLM ? "bg-cyan-400/80" : isTool ? "bg-yellow-400/80" : "bg-primary-fixed/80";
  const glowColor = isFailed ? "bg-rose-500/5" : isLLM ? "bg-cyan-400/5" : isTool ? "bg-yellow-400/5" : "bg-primary-fixed/5";

  const cardBase = `bg-surface-container-lowest/50 backdrop-blur-xl border rounded-2xl p-4 w-[380px] transition-all duration-300 hover:-translate-y-1 cursor-pointer relative z-10 font-sans shadow-sm hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden group ${!matchesExactly ? 'opacity-40' : 'opacity-100'}`;

  if (!isVisible) return null;

  return (
    <div className="relative">
      {/* Node Card */}
      <div
        onClick={() => onSelectSpan(node)}
        className={`${cardBase} ${borderColor} ${
          isSelected
            ? "bg-surface-container/60 shadow-[0_0_24px_rgba(255,255,255,0.1)] border-white/50"
            : ""
        }`}
      >
        {/* Subtle background glow type */}
        <div className={`absolute w-32 h-32 rounded-full blur-3xl -top-10 -right-10 pointer-events-none transition-all duration-700 ${glowColor} group-hover:scale-150 group-hover:opacity-100 opacity-50`}></div>

        <div className="flex justify-between items-start mb-4 relative z-10">
          <span className={`font-semibold text-[15px] flex items-center gap-2.5 ${textColor}`}>
            <span className={`material-symbols-outlined text-[18px] drop-shadow-[0_0_8px_currentColor]`}>
              {isRoot ? "rocket_launch" : isLLM ? "psychology" : isTool ? "build" : "hub"}
            </span>
            {node.name}
          </span>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors bg-white/5 hover:bg-white/10 ${textColor}`}
              >
                {isExpanded ? "Collapse" : "Expand"}
              </button>
            )}
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                isFailed
                  ? "border-rose-500/30 text-rose-400 bg-rose-500/10"
                  : isRoot
                  ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed"
                  : "border-emerald-400/30 text-emerald-400 bg-emerald-400/10"
              }`}
            >
              {node.status}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center font-mono text-[10px] text-on-surface-variant border-t border-outline-variant/10 pt-3 relative z-10">
          {node.durationMs !== undefined && <span>DUR: <span className="text-white font-medium">{node.durationMs}ms</span></span>}
          {node.tokens?.total !== undefined && <span>TOKENS: <span className="text-white font-medium">{node.tokens.total}</span></span>}
          {node.model && <span>MODEL: <span className="text-white font-medium">{node.model}</span></span>}
        </div>
      </div>

      {/* Connected Flow Line Tree */}
      {hasChildren && isExpanded && (
        <div className="pl-12 flex flex-col gap-8 relative mt-8">
          {/* Vertical flow line connecting parent node to children */}
          <div className="absolute left-6 -top-8 bottom-6 w-[1.5px] bg-gradient-to-b from-outline-variant/30 to-outline-variant/5">
            <div className={`absolute inset-0 ${lineColor} blur-[1px] opacity-30`} />
            <div className={`absolute inset-0 ${lineColor}`} />
          </div>

          {node.children.map((child) => {
            const childLineColor = child.status === "ERROR" ? "bg-rose-500" : child.kind === "LLM" ? "bg-cyan-400" : child.kind === "TOOL" ? "bg-yellow-400" : "bg-primary-fixed";

            return (
              <div key={child.id} className="relative pl-10">
                {/* Horizontal flow line connecting main line to child node */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-[1.5px] flex items-center bg-outline-variant/30">
                  <div className={`absolute inset-0 ${childLineColor} blur-[1px] opacity-30`} />
                  <div className={`absolute inset-0 ${childLineColor}`} />
                  
                  {/* Joint Connection Dots (Glowing Points) */}
                  <div className={`absolute -left-[3px] w-1.5 h-1.5 rounded-full z-20 ${childLineColor} shadow-[0_0_8px_currentColor]`} />
                  <div className={`absolute -right-[3px] w-1.5 h-1.5 rounded-full z-20 ${childLineColor} shadow-[0_0_8px_currentColor]`} />
                </div>

                <ConnectedSpanNodeRenderer
                  node={child}
                  selectedSpanId={selectedSpanId}
                  onSelectSpan={onSelectSpan}
                  filterFunc={filterFunc}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
