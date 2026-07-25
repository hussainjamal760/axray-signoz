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
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden font-mono-label">
      {/* 1. Context Header & Observer-style Dropdown */}
      <section className="p-4 md:p-6 border-b-[3px] border-primary-fixed bg-surface-container flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shrink-0 z-20">
        <div className="space-y-2 max-w-3xl">
          <div className="flex items-center gap-2 font-mono-label text-xs text-on-surface-variant">
            <Link href={backToSessionLink} className="hover:text-primary-fixed cursor-pointer flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              SESSION #{id ? id.slice(-4).toUpperCase() : "1042"}
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-primary-fixed font-bold">
              {activeRun ? `RUN #${activeRun.id.slice(-6).toUpperCase()}` : "TRACES"}
            </span>
          </div>

          <h1 className="font-headline-lg text-2xl md:text-3xl text-primary-fixed uppercase font-black truncate">
            {activeRun?.prompt || session?.repositoryFullName || "OpenTelemetry Trace Explorer"}
          </h1>

          <div className="flex flex-wrap gap-4 items-center">
            {session?.repositoryFullName && (
              <div className="flex items-center gap-2 bg-surface-container-highest border border-outline px-3 py-1 font-mono-label text-xs font-bold">
                <span className="material-symbols-outlined text-sm text-on-surface-variant">folder</span>
                {session.repositoryFullName} ({session.branch || "main"})
              </div>
            )}

            {activeRun && (
              <div className="flex items-center gap-2">
                <RunStatusBadge status={activeRun.status} />
              </div>
            )}

            {/* Run Selection Dropdown (Observer Page Matching UI) */}
            {runs.length > 0 && (
              <div className="flex items-center gap-2 bg-black border-2 border-outline px-3 py-1 font-mono-label text-xs font-bold text-primary-fixed brutalist-shadow-sm">
                <span className="material-symbols-outlined text-sm">history</span>
                <select
                  value={activeRun?.id || ""}
                  onChange={(e) => handleSelectRunChange(e.target.value)}
                  className="bg-transparent text-primary-fixed font-mono-label text-xs font-black outline-none cursor-pointer max-w-[280px] truncate"
                >
                  {runs.map((r, index) => (
                    <option key={r.id} value={r.id} className="bg-black text-on-surface">
                      Run #{runs.length - index} — {r.prompt ? (r.prompt.length > 25 ? `${r.prompt.slice(0, 25)}...` : r.prompt) : r.id.slice(-6)} ({r.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Search & Filter Bar */}
      <div className="px-6 py-3 bg-surface border-b-2 border-outline flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <span className="material-symbols-outlined text-outline text-xl">search</span>
          <input
            type="text"
            placeholder="Search spans, attributes, tools, errors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-white placeholder-outline focus:outline-none w-full font-mono-label font-bold"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white uppercase border-2 border-outline px-3 py-1 bg-black brutalist-shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(251,191,36,0.2)] hover:border-yellow-400/50">
            <input 
              type="checkbox" 
              checked={showHallucinations} 
              onChange={(e) => setShowHallucinations(e.target.checked)}
              className="accent-yellow-400 w-3 h-3"
            />
            <span className={showHallucinations ? "text-yellow-400" : "text-on-surface-variant"}>
              ⚠️ Show Hallucinations
            </span>
          </label>
          <div className="flex items-center gap-2">
          {(["ALL", "LLM", "TOOL", "WORKSPACE", "ERROR"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={`px-2.5 py-1 text-[10px] font-black uppercase border transition-all ${
                kindFilter === k
                  ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed brutalist-shadow-sm"
                  : "border-outline text-on-surface-variant hover:text-white"
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
          className="flex-1 overflow-auto p-8 relative bg-surface-dim custom-scrollbar h-full"
          style={{ backgroundImage: "radial-gradient(var(--color-surface-container-high) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
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
          <div className="w-full lg:w-[420px] border-t-4 lg:border-t-0 lg:border-l-[3px] border-outline bg-surface-container p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6 z-30 shadow-2xl h-full shrink-0" data-lenis-prevent="true">
            <div className="flex justify-between items-start border-b-2 border-outline pb-4">
              <div>
                <span className="text-[10px] bg-primary-fixed text-on-primary-fixed px-2 py-0.5 font-black uppercase">
                  {selectedSpan.kind} SPAN
                </span>
                <h3 className="text-xl font-black text-white mt-2 break-all">{selectedSpan.name}</h3>
              </div>
              <button
                onClick={() => setSelectedSpan(null)}
                className="text-on-surface-variant hover:text-white font-black text-sm border border-outline px-2 py-0.5"
              >
                ✕
              </button>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-3 bg-surface p-4 border-2 border-outline">
              <div>
                <span className="text-[9px] text-on-surface-variant font-bold uppercase block">Duration</span>
                <span className="text-lg font-black text-white">{selectedSpan.durationMs}ms</span>
              </div>
              <div>
                <span className="text-[9px] text-on-surface-variant font-bold uppercase block">Status</span>
                <span className={`text-lg font-black ${selectedSpan.status === "ERROR" ? "text-error" : "text-emerald-400"}`}>
                  {selectedSpan.status}
                </span>
              </div>
              {selectedSpan.tokens?.total !== undefined && (
                <div>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase block">Tokens</span>
                  <span className="text-lg font-black text-primary-fixed">{selectedSpan.tokens.total}</span>
                </div>
              )}
              {selectedSpan.model && (
                <div>
                  <span className="text-[9px] text-on-surface-variant font-bold uppercase block">Model</span>
                  <span className="text-xs font-black text-white">{selectedSpan.model}</span>
                </div>
              )}
            </div>

            {/* Tabs Navigation */}
            <div className="flex items-center gap-4 border-b-2 border-outline pb-2 mt-2">
              <button
                onClick={() => setActiveTab("attributes")}
                className={`text-xs font-black uppercase pb-1 border-b-4 transition-all ${
                  activeTab === "attributes"
                    ? "border-primary-fixed text-primary-fixed"
                    : "border-transparent text-on-surface-variant hover:text-white"
                }`}
              >
                Attributes
              </button>
              <button
                onClick={() => setActiveTab("logs")}
                className={`text-xs font-black uppercase pb-1 border-b-4 transition-all flex items-center gap-2 ${
                  activeTab === "logs"
                    ? "border-emerald-400 text-emerald-400"
                    : "border-transparent text-on-surface-variant hover:text-white"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                Terminal Logs
              </button>
            </div>

            {activeTab === "attributes" ? (
              <>
                {/* Attributes Table */}
                <div>
                  <h4 className="text-xs font-black uppercase text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary-fixed">key</span>
                    Span Attributes
                  </h4>
                  <div className="bg-[#050503] border-2 border-outline p-3 space-y-2 text-xs overflow-x-auto max-h-[300px] custom-scrollbar" data-lenis-prevent="true">
                    {Object.entries(selectedSpan.attributes).map(([k, v]) => (
                      <div key={k} className="flex flex-col border-b border-outline/30 pb-1.5 last:border-none">
                        <span className="text-[10px] text-primary-fixed font-bold">{k}</span>
                        <span className="text-white font-mono break-all text-[11px]">
                          {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Raw JSON */}
                <div>
                  <h4 className="text-xs font-black uppercase text-white mb-2">OTEL Raw Payload</h4>
                  <pre className="bg-[#050503] border-2 border-outline p-3 text-[10px] text-emerald-400 font-mono overflow-x-auto max-h-[200px] custom-scrollbar" data-lenis-prevent="true">
                    {JSON.stringify(selectedSpan, null, 2)}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="bg-[#050503] border-2 border-outline p-4 flex-1 overflow-y-auto custom-scrollbar font-mono text-[11px]" data-lenis-prevent="true">
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
    ? "border-white"
    : isFailed
    ? "border-error"
    : isLLM
    ? "border-cyan-400"
    : isTool
    ? "border-yellow-400"
    : "border-primary-fixed";

  const textColor = isFailed ? "text-error" : isLLM ? "text-cyan-400" : isTool ? "text-yellow-400" : "text-primary-fixed";
  const lineColor = isFailed ? "bg-error" : isLLM ? "bg-cyan-400" : isTool ? "bg-yellow-400" : "bg-primary-fixed";

  const cardBase = `bg-background border-[3px] p-4 w-[380px] hover:-translate-x-1 hover:-translate-y-1 transition-all cursor-pointer relative z-10 font-mono-label ${!matchesExactly ? 'opacity-40' : 'opacity-100'}`;

  if (!isVisible) return null;

  return (
    <div className="relative">
      {/* Node Card */}
      <div
        onClick={() => onSelectSpan(node)}
        className={`${cardBase} ${borderColor} ${
          isSelected
            ? "bg-surface-container-high shadow-[6px_6px_0px_0px_rgba(255,255,255,0.8)]"
            : isRoot
            ? "w-[420px] bg-surface-container-high brutalist-shadow"
            : "hover:brutalist-shadow"
        }`}
      >
        <div className="flex justify-between items-start mb-3">
          <span className={`font-mono-label font-bold text-base flex items-center gap-2 ${textColor}`}>
            <span className="material-symbols-outlined text-[20px]">
              {isRoot ? "rocket_launch" : isLLM ? "psychology" : isTool ? "build" : "hub"}
            </span>
            {node.name}
          </span>
          <div className="flex items-center gap-2">
            {hasChildren && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                className={`text-xs font-black px-1.5 py-0.5 border border-current hover:bg-surface-variant transition-colors ${textColor}`}
              >
                {isExpanded ? "[-]" : "[+]"}
              </button>
            )}
            <span
              className={`text-[9px] font-bold px-2 py-0.5 uppercase border ${
                isFailed
                  ? "border-error text-error bg-error/10"
                  : isRoot
                  ? "bg-primary-fixed text-on-primary-fixed border-primary-fixed font-black"
                  : "border-emerald-400 text-emerald-400"
              }`}
            >
              {node.status}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center font-mono-label text-[11px] text-on-surface-variant border-t border-outline/40 pt-2.5">
          {node.durationMs !== undefined && <span>DUR: <span className="text-white font-bold">{node.durationMs}ms</span></span>}
          {node.tokens?.total !== undefined && <span>TOKENS: <span className="text-white font-bold">{node.tokens.total}</span></span>}
          {node.model && <span>MODEL: <span className="text-white font-bold">{node.model}</span></span>}
        </div>
      </div>

      {/* Connected Flow Line Tree */}
      {hasChildren && isExpanded && (
        <div className="pl-12 flex flex-col gap-8 relative mt-8">
          {/* Vertical flow line connecting parent node to children */}
          <div className="absolute left-6 -top-8 bottom-6 w-1 bg-outline-variant">
            <div className={`absolute inset-0 ${lineColor}`} />
          </div>

          {node.children.map((child) => {
            const childLineColor = child.status === "ERROR" ? "bg-error" : child.kind === "LLM" ? "bg-cyan-400" : child.kind === "TOOL" ? "bg-yellow-400" : "bg-primary-fixed";

            return (
              <div key={child.id} className="relative pl-10">
                {/* Horizontal flow line connecting main line to child node */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-1 flex items-center bg-outline-variant">
                  <div className={`absolute inset-0 ${childLineColor}`} />
                  {/* Joint Connection Dots */}
                  <div className={`absolute -left-1.5 w-3 h-3 rounded-full border-[3px] border-background z-20 ${childLineColor}`} />
                  <div className={`absolute -right-1.5 w-3 h-3 rounded-full border-[3px] border-background z-20 ${childLineColor}`} />
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
