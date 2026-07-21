import { SessionSummary, SessionStatus } from '../types/sessions.types';
import { 
  GitBranch, 
  Clock, 
  Terminal, 
  Activity, 
  DollarSign, 
  Cpu, 
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FolderGit2,
  Search
} from "lucide-react";
import { useState } from 'react';
import { SessionSearchModal } from './SessionSearchModal';

export interface SessionsListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
}

const statusColors: Record<SessionStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  archived: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline/50' }
};

export function SessionsList({ sessions, onSelect }: SessionsListProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  const getAgentStatusUI = (status: string) => {
    switch(status) {
      case 'running':
        return <div className="flex items-center gap-1.5 text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20"><Loader2 size={14} className="animate-spin" /><span className="text-xs font-semibold tracking-wide">Running</span></div>;
      case 'failed':
        return <div className="flex items-center gap-1.5 text-red-400 bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20"><AlertCircle size={14} /><span className="text-xs font-semibold tracking-wide">Failed</span></div>;
      default:
        return <div className="flex items-center gap-1.5 text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-md border border-outline/50"><CheckCircle2 size={14} /><span className="text-xs font-semibold tracking-wide">Idle</span></div>;
    }
  };

  const mockStatuses = ['running', 'idle', 'failed', 'idle'];

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">AI Agent Sessions</h2>
          <p className="text-sm text-primary-fixed mt-2 flex items-center gap-2">
            <Activity size={16} /> Active Workspaces & Tasks
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full sm:w-64 bg-surface-container-highest border-2 border-outline-variant text-on-surface-variant font-medium px-4 py-3 rounded-xl hover:border-primary-fixed/50 transition-all flex items-center justify-between group shadow-sm"
          >
            <div className="flex items-center gap-3">
              <Search size={18} className="text-on-surface-variant group-hover:text-primary-fixed transition-colors" />
              <span className="text-sm">Search sessions...</span>
            </div>
            <kbd className="hidden sm:flex items-center gap-1 rounded-md border border-outline-variant bg-surface-container px-1.5 py-0.5 font-sans text-xs font-bold text-on-surface-variant shadow-sm">
              <span>⌘</span>K
            </kbd>
          </button>
          <button
            onClick={() => onSelect('new')}
            className="bg-primary-fixed text-on-primary font-bold px-6 py-3 rounded-xl shadow-[0_4px_14px_rgba(var(--color-primary-fixed),0.4)] hover:shadow-[0_6px_20px_rgba(var(--color-primary-fixed),0.6)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span className="material-symbols-outlined font-bold">add</span>
            Initialize New Session
          </button>
        </div>
      </div>

      <SessionSearchModal
        sessions={sessions}
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        onSelectResult={(result) => {
          if (result.originalSession) {
            onSelect(result.originalSession.id);
          }
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sessions.map((session, index) => {
          // Generate deterministic mock data based on index
          const agentStatus = session.agentStatus || mockStatuses[index % mockStatuses.length];
          const cost = session.metrics?.cost || ((index + 1) * 0.14).toFixed(4);
          const tokens = session.metrics?.tokens || ((index + 1) * 1420);
          const colors = statusColors[session.status] || statusColors.active;

          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="group bg-surface-container border-2 border-outline-variant hover:border-primary-fixed transition-all duration-300 ease-out cursor-pointer rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl hover:shadow-[0_8px_30px_rgba(var(--color-primary-fixed),0.15)] hover:-translate-y-1.5"
            >
              {/* Header */}
              <div className="p-5 border-b-2 border-outline-variant group-hover:bg-primary-fixed/5 group-hover:border-primary-fixed/30 transition-colors bg-surface-container-highest flex justify-between items-start gap-4">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-primary-fixed/10 text-primary-fixed rounded-xl shrink-0">
                    <FolderGit2 size={24} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-white text-lg truncate" title={session.repositoryFullName}>
                      {session.repositoryFullName}
                    </h3>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm mt-1">
                      <GitBranch size={14} />
                      <span className="truncate">{session.branch}</span>
                    </div>
                  </div>
                </div>
                <div className={`shrink-0 px-3 py-1.5 rounded-lg border-2 text-xs font-bold capitalize ${colors.bg} ${colors.text} ${colors.border}`}>
                  {session.status}
                </div>
              </div>

              {/* Agent Status */}
              <div className="p-5 flex-1 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cpu size={20} className="text-primary-fixed" />
                    <span className="font-bold text-base text-white">AXRAY agent</span>
                  </div>
                  {getAgentStatusUI(agentStatus)}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="bg-background border-2 border-outline-variant rounded-xl p-4 flex flex-col gap-1.5 shadow-inner">
                    <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                      <Terminal size={14} /> Tokens Used
                    </span>
                    <span className="font-bold text-white text-xl">{tokens.toLocaleString()}</span>
                  </div>
                  <div className="bg-background border-2 border-outline-variant rounded-xl p-4 flex flex-col gap-1.5 shadow-inner">
                    <span className="text-xs font-semibold text-on-surface-variant flex items-center gap-1.5">
                      <DollarSign size={14} /> Est. Cost
                    </span>
                    <span className="font-bold text-white text-xl">${cost}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t-2 border-outline-variant bg-surface-container-highest flex items-center justify-between text-on-surface-variant text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  <span>Updated {getFormattedDate(session.updatedAt)}</span>
                </div>
                <ArrowRight size={18} className="group-hover:text-primary-fixed group-hover:translate-x-1.5 transition-all" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
