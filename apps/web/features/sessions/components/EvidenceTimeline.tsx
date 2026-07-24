import { TimelineEvent } from "@/features/agent-runs/types";

export interface EvidenceTimelineProps {
  events?: TimelineEvent[];
}

export function EvidenceTimeline({ events = [] }: EvidenceTimelineProps) {
  // If no events, show empty state
  if (!events || events.length === 0) {
    return (
      <div className="bg-surface-container-lowest/40 backdrop-blur-md rounded-[24px] border border-outline-variant/20 p-6 reveal-text shadow-sm" style={{ animationDelay: '0.5s' }}>
        <h3 className="text-sm font-bold tracking-tight text-primary-fixed mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">list_alt</span>
          Evidence Timeline
        </h3>
        <div className="text-on-surface-variant font-medium text-xs uppercase text-center py-8 opacity-70">
          No Timeline Events Available
        </div>
      </div>
    );
  }

  // Reverse events to show most recent at bottom if needed, or keep order. We'll keep chronological.
  // Actually usually timelines are top to bottom (start to end).

  return (
    <div className="bg-surface-container-lowest/40 backdrop-blur-md rounded-[24px] border border-outline-variant/20 p-6 reveal-text shadow-[0_8px_30px_rgb(0,0,0,0.12)]" style={{ animationDelay: '0.5s' }}>
      <h3 className="text-sm font-bold tracking-tight text-primary-fixed mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px] drop-shadow-[0_0_8px_rgba(var(--color-primary-fixed),0.5)]">list_alt</span>
        Evidence Timeline
      </h3>
      <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-outline-variant/30 before:to-outline-variant/5 max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
        
        {events.map((event, idx) => {
          const isError = event.status === 'failed';
          const isHallucinated = event.metadata?.hallucination;
          const isLast = idx === events.length - 1;
          const turnLabel = event.metadata?.turn ? `Turn ${event.metadata.turn}` : `Evt ${idx + 1}`;

          if (isError) {
            return (
              <div key={idx} className={`relative pl-8 ${isLast ? '' : 'pb-8'} group`}>
                <div className="absolute left-[5px] top-1 w-3.5 h-3.5 bg-background border-[2px] border-rose-500/50 rounded-full z-10 flex items-center justify-center scale-110 shadow-[0_0_8px_rgba(244,63,94,0.4)]">
                  <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping"></div>
                </div>
                <div className="font-bold uppercase tracking-widest text-[10px] text-rose-400 mb-1 flex items-center gap-2">
                  <span>{turnLabel} • {event.phase}</span>
                  {isHallucinated && <span className="bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-400/30 uppercase tracking-widest text-[8px] flex items-center gap-1"><span className="text-[10px]">⚠️</span>Hallucination</span>}
                </div>
                <div className="font-bold text-on-surface group-hover:text-rose-400 transition-colors">{event.title}</div>
                {event.description && <div className="text-xs text-on-surface-variant/80 mt-1">{event.description}</div>}
                {isHallucinated && event.metadata?.parseError && (
                  <div className="mt-2 bg-surface-container border border-yellow-400/20 p-2.5 rounded-xl text-[10px] text-yellow-400 font-mono break-all custom-scrollbar overflow-x-auto max-h-[100px] shadow-inner">
                    <div className="font-bold mb-1 opacity-75">PARSE ERROR:</div>
                    {String(event.metadata.parseError)}
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={idx} className={`relative pl-8 ${isLast ? '' : 'pb-8'} group`}>
              <div className={`absolute left-[5px] top-1 w-3.5 h-3.5 border-[2px] rounded-full z-10 flex items-center justify-center ${isHallucinated ? 'bg-background border-yellow-400/50' : 'bg-background border-outline-variant/30 group-hover:border-primary-fixed/50 transition-colors'}`}>
                {isHallucinated ? (
                  <span className="text-[8px] absolute">⚠️</span>
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-outline-variant/50 group-hover:bg-primary-fixed transition-colors"></div>
                )}
              </div>
              <div className={`font-bold uppercase tracking-widest text-[10px] mb-1 flex items-center gap-2 ${isHallucinated ? 'text-yellow-400' : 'text-on-surface-variant/70'}`}>
                <span>{turnLabel} • {event.phase}</span>
                {isHallucinated && <span className="bg-yellow-400/10 text-yellow-400 px-1.5 py-0.5 rounded-full border border-yellow-400/30 uppercase tracking-widest text-[8px] flex items-center gap-1"><span className="text-[10px]">⚠️</span>Hallucination</span>}
              </div>
              <div className={`font-bold text-sm transition-colors ${isHallucinated ? 'text-yellow-400' : 'text-on-surface/90 group-hover:text-primary-fixed'}`}>{event.title}</div>
              {isHallucinated && event.metadata?.parseError && (
                <div className="mt-2 bg-surface-container border border-yellow-400/20 p-2.5 rounded-xl text-[10px] text-yellow-400 font-mono break-all custom-scrollbar overflow-x-auto max-h-[100px] shadow-inner">
                  <div className="font-bold mb-1 opacity-75">PARSE ERROR:</div>
                  {String(event.metadata.parseError)}
                </div>
              )}
            </div>
          );
        })}

      </div>
    </div>
  );
}
