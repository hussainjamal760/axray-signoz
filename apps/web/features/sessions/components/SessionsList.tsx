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
} from "lucide-react";

export interface SessionsListProps {
  sessions: SessionSummary[];
  onSelect: (id: string) => void;
}

const statusColors: Record<SessionStatus, { bg: string; text: string; border: string }> = {
  active: { bg: 'bg-green-500/10', text: 'text-green-500', border: 'border-green-500/30' },
  completed: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  archived: { bg: 'bg-surface-container-high', text: 'text-on-surface-variant', border: 'border-outline/50' }
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-[3px] border-black pb-6">
        <div>
          <h2 className="font-headline-xl text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic flex items-center gap-3">
            <span className="bg-primary-fixed text-black px-2 not-italic">LIVE</span>
            SESSIONS
          </h2>
          <p className="font-mono-label text-[10px] text-on-surface-variant mt-2 flex items-center gap-2 uppercase tracking-widest font-bold">
            <Activity size={14} className="text-primary-fixed" /> Total Monitored Workspaces: {sessions.length}
          </p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => onSelect('new')}
            className="bg-primary-fixed text-black font-mono-label font-black text-xs uppercase tracking-wider px-6 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all flex items-center justify-center gap-2 w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-[18px] font-black">add</span>
            INITIALIZE_NEW
          </button>
        </div>
      </div>

      {/* Awwwards-Level Interactive List */}
      <div className="space-y-4 relative">
        {sessions.map((session, index) => {
          const agentStatus = session.agentStatus || mockStatuses[index % mockStatuses.length];
          const cost = session.metrics?.cost || ((index + 1) * 0.14).toFixed(4);
          const tokens = session.metrics?.tokens || ((index + 1) * 1420);
          const colors = statusColors[session.status] || statusColors.active;

          return (
            <div 
              key={session.id}
              onClick={() => onSelect(session.id)}
              className="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-4 px-6 py-5 bg-surface-container-lowest border-[3px] border-black cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0px_0px_theme(colors.primary-fixed)] hover:border-primary-fixed z-10 hover:z-20 overflow-hidden"
            >
              {/* Awwards Slide-up Background Reveal */}
              <div className="absolute inset-0 bg-primary-fixed translate-y-[101%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] -z-10" />

              {/* Left: Repo & Branch */}
              <div className="flex items-center gap-4 lg:w-[30%]">
                <div className="p-2.5 border-[3px] border-black bg-surface-container-highest group-hover:bg-black group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)]">
                  <FolderGit2 size={20} className="text-primary-fixed" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-white group-hover:text-black text-base truncate transition-colors duration-300">
                    {session.repositoryFullName}
                  </h3>
                  <div className="flex items-center gap-2 text-on-surface-variant group-hover:text-black/70 text-xs mt-1 transition-colors duration-300 font-bold">
                    <GitBranch size={14} />
                    <span className="truncate">{session.branch}</span>
                  </div>
                </div>
              </div>

              {/* Middle: Status Badges */}
              <div className="flex items-center gap-4 lg:w-[25%]">
                <div className={`px-3 py-1.5 border-[3px] text-[10px] font-black uppercase tracking-widest ${colors.bg} ${colors.text} ${colors.border} group-hover:bg-black group-hover:text-primary-fixed group-hover:border-black transition-colors duration-300`}>
                  {session.status}
                </div>
                
                {/* Agent State (Dynamic overriding colors for hover) */}
                <div className={`flex items-center gap-2 border-[3px] px-3 py-1.5 transition-colors duration-300 group-hover:bg-black group-hover:border-black ${
                  agentStatus === 'running' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                  agentStatus === 'failed' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-surface-container border-outline-variant text-on-surface-variant'
                }`}>
                  {agentStatus === 'running' && <Loader2 size={14} className="animate-spin group-hover:text-primary-fixed transition-colors" />}
                  {agentStatus === 'failed' && <AlertCircle size={14} className="group-hover:text-primary-fixed transition-colors" />}
                  {agentStatus !== 'running' && agentStatus !== 'failed' && <CheckCircle2 size={14} className="group-hover:text-primary-fixed transition-colors" />}
                  <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-primary-fixed transition-colors duration-300">
                    {agentStatus === 'running' ? 'Running' : agentStatus === 'failed' ? 'Failed' : 'Idle'}
                  </span>
                </div>
              </div>

              {/* Right: Metrics */}
              <div className="flex items-center gap-8 lg:w-[25%] lg:justify-end">
                <div className="flex flex-col items-start lg:items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-black/60 transition-colors duration-300">Tokens</span>
                  <span className="font-black text-white group-hover:text-black text-lg transition-colors duration-300 font-mono-label flex items-center gap-1.5">
                    <Terminal size={14} className="opacity-50" />
                    {tokens.toLocaleString()}
                  </span>
                </div>
                <div className="flex flex-col items-start lg:items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-black/60 transition-colors duration-300">Cost</span>
                  <span className="font-black text-white group-hover:text-black text-lg transition-colors duration-300 font-mono-label flex items-center gap-1.5">
                    <DollarSign size={14} className="opacity-50" />
                    {cost}
                  </span>
                </div>
              </div>

              {/* Far Right: Arrow & Time */}
              <div className="flex items-center gap-4 lg:w-[20%] justify-end">
                <div className="text-right hidden sm:flex flex-col items-end">
                  <span className="text-[9px] font-black uppercase tracking-widest text-on-surface-variant group-hover:text-black/60 transition-colors duration-300">Updated</span>
                  <span className="text-xs font-bold text-white group-hover:text-black transition-colors duration-300 whitespace-nowrap">{getFormattedDate(session.updatedAt)}</span>
                </div>
                <div className="w-12 h-12 shrink-0 border-[3px] border-black bg-surface-container-highest group-hover:bg-black text-white group-hover:text-primary-fixed flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] group-hover:rotate-[-45deg] group-hover:scale-110 shadow-[4px_4px_0px_0px_#000] group-hover:shadow-[0px_0px_0px_0px_#000]">
                  <ArrowRight size={24} className="transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          );
        })}
        
        {sessions.length === 0 && (
          <div className="p-12 border-[3px] border-black bg-surface-container-lowest text-center">
            <span className="text-on-surface-variant font-mono-label text-sm uppercase font-bold tracking-widest">
              No sessions found. Initialize a new session to begin.
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
