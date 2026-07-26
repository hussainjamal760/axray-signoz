"use client";

import { useState, useMemo } from "react";
import { SessionSummary, SessionStatus } from "../types/sessions.types";
import {
  GitBranch,
  Terminal,
  Activity,
  DollarSign,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderGit2,
  Search,
  Plus,
  Layers
} from "lucide-react";

export interface SessionsListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
}

const statusColors: Record<SessionStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  archived: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant/30' }
};

export function SessionsList({ sessions, onSelect }: SessionsListProps) {
  const getFormattedDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateStr;
    }
  };

  // Aggregate stats
  const activeCount = useMemo(() => sessions.filter(s => s.status === 'active').length, [sessions]);
  const totalTokens = useMemo(() => sessions.reduce((acc, s) => acc + (s.metrics?.tokens || 0), 0), [sessions]);
  const totalCost = useMemo(() => sessions.reduce((acc, s) => acc + (Number(s.metrics?.cost) || 0), 0), [sessions]);

  // Sort sessions by last used (most recently updated first)
  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
      return timeB - timeA;
    });
  }, [sessions]);

  return (
    <div className="space-y-8 pb-10">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-outline-variant/20 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_currentColor]"></span>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Monitored Sessions
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant">
              <Activity size={14} className="text-primary-fixed" />
              {sessions.length} Sessions
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              {activeCount} Active
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant">
              <Terminal size={14} className="text-primary-fixed" />
              {totalTokens.toLocaleString()} Tokens
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-container/50 border border-outline-variant/30 text-on-surface-variant">
              <DollarSign size={14} className="text-primary-fixed" />
              ${totalCost.toFixed(4)}
            </span>
          </div>
        </div>

        <button
          onClick={() => onSelect('new')}
          className="bg-primary-fixed hover:bg-primary-fixed/90 text-black font-semibold text-sm px-5 py-3 rounded-2xl shadow-[0_0_20px_rgba(220,238,0,0.3)] hover:shadow-[0_0_25px_rgba(220,238,0,0.5)] transition-all duration-300 flex items-center justify-center gap-2.5 w-full sm:w-auto hover:-translate-y-0.5 active:translate-y-0"
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Session
        </button>
      </div>


      {/* Glassmorphic Workspace List */}
      <div className="space-y-4">
        {sortedSessions.map((session) => {
          const agentStatus = session.agentStatus || 'idle';
          const cost = session.metrics?.cost ? Number(session.metrics.cost).toFixed(4) : '$0.0000';
          const tokens = session.metrics?.tokens || 0;
          const colors = statusColors[session.status] || statusColors.active;

          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-primary-fixed/40 hover:shadow-[0_12px_40px_rgba(0,0,0,0.25)] overflow-hidden"
            >
              {/* Subtle background glow */}
              <div className="absolute w-48 h-48 rounded-full blur-3xl -top-10 -right-10 pointer-events-none transition-all duration-500 bg-primary-fixed/0 group-hover:bg-primary-fixed/5"></div>

              {/* Left: Repo & Branch */}
              <div className="flex items-center gap-4 lg:w-[32%]">
                <div className="p-3.5 rounded-2xl border border-outline-variant/20 bg-surface-container-high/60 group-hover:bg-primary-fixed/10 group-hover:border-primary-fixed/30 group-hover:scale-105 transition-all duration-300">
                  <FolderGit2 size={22} className="text-primary-fixed transition-colors" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-base truncate group-hover:text-primary-fixed transition-colors">
                    {session.repositoryFullName}
                  </h3>
                  <div className="flex items-center gap-2 text-on-surface-variant/80 text-xs mt-1 font-medium">
                    <GitBranch size={13} className="text-primary-fixed/70" />
                    <span className="truncate">{session.branch}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Status Badges */}
              <div className="flex items-center gap-3 lg:w-[24%]">
                <div className={`px-3 py-1.5 rounded-full border text-[11px] font-semibold capitalize tracking-wide ${colors.bg} ${colors.text} ${colors.border} shadow-sm`}>
                  {session.status}
                </div>

                {/* Agent State */}
                <div className={`flex items-center gap-2 rounded-full border px-3 py-1.5 shadow-sm ${agentStatus === 'running' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                  agentStatus === 'failed' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-surface-container/40 border-outline-variant/20 text-on-surface-variant'
                  }`}>
                  {agentStatus === 'running' && <Loader2 size={13} className="animate-spin" />}
                  {agentStatus === 'failed' && <AlertCircle size={13} />}
                  {agentStatus !== 'running' && agentStatus !== 'failed' && <CheckCircle2 size={13} />}
                  <span className="text-[11px] font-semibold capitalize">
                    {agentStatus === 'running' ? 'Running' : agentStatus === 'failed' ? 'Failed' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Right: Metrics */}
              <div className="flex items-center gap-8 lg:w-[24%] lg:justify-end">
                <div className="flex flex-col items-start lg:items-end">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/70">Tokens</span>
                  <span className="font-semibold text-white text-sm font-mono mt-0.5 flex items-center gap-1.5">
                    <Terminal size={13} className="text-primary-fixed/60" />
                    {tokens.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-start lg:items-end">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/70">Cost</span>
                  <span className="font-semibold text-white text-sm font-mono mt-0.5 flex items-center gap-1.5">
                    <DollarSign size={13} className="text-emerald-400/80" />
                    {cost}
                  </span>
                </div>
              </div>

              {/* Far Right: Arrow & Time */}
              <div className="flex items-center gap-4 lg:w-[20%] justify-end">
                <div className="text-right hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-on-surface-variant/70">Updated</span>
                  <span className="text-xs font-medium text-on-surface-variant mt-0.5 whitespace-nowrap">{getFormattedDate(session.updatedAt)}</span>
                </div>
                <div className="w-10 h-10 rounded-2xl border border-outline-variant/30 bg-surface-container-high/60 group-hover:bg-primary-fixed group-hover:border-primary-fixed text-on-surface-variant group-hover:text-black flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(220,238,0,0.4)]">
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="p-12 bg-surface-container-lowest/50 backdrop-blur-xl rounded-3xl border border-outline-variant/30 text-center">
            <Layers className="mx-auto h-10 w-10 text-on-surface-variant/40 mb-3" />
            <p className="text-on-surface-variant font-medium text-sm">
              No sessions found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
