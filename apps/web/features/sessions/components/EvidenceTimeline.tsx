import { TimelineEvent } from "@/features/agent-runs/types";

export interface EvidenceTimelineProps {
  events?: TimelineEvent[];
}

export function EvidenceTimeline({ events = [] }: EvidenceTimelineProps) {
  // If no events, show empty state
  if (!events || events.length === 0) {
    return (
      <div className="bg-surface-container-low border-[3px] border-background p-6 reveal-text" style={{ animationDelay: '0.5s' }}>
        <h3 className="font-mono-label font-bold uppercase text-primary-fixed mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">list_alt</span>
          Evidence Timeline
        </h3>
        <div className="text-on-surface-variant font-mono-label text-xs uppercase font-bold text-center py-4">
          No Timeline Events Available
        </div>
      </div>
    );
  }

  // Reverse events to show most recent at bottom if needed, or keep order. We'll keep chronological.
  // Actually usually timelines are top to bottom (start to end).

  return (
    <div className="bg-surface-container-low border-[3px] border-background p-6 reveal-text" style={{ animationDelay: '0.5s' }}>
      <h3 className="font-mono-label font-bold uppercase text-primary-fixed mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-[18px]">list_alt</span>
        Evidence Timeline
      </h3>
      <div className="space-y-0 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-outline-variant max-h-[400px] overflow-y-auto custom-scrollbar pr-4">
        
        {events.map((event, idx) => {
          const isError = event.status === 'failed';
          const isLast = idx === events.length - 1;
          const turnLabel = event.metadata?.turn ? `Turn ${event.metadata.turn}` : `Evt ${idx + 1}`;

          if (isError) {
            return (
              <div key={idx} className={`relative pl-8 ${isLast ? '' : 'pb-8'} group`}>
                <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-error-container border-2 border-background rounded-full z-10 flex items-center justify-center scale-110">
                  <span className="material-symbols-outlined text-[14px] text-on-error-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                </div>
                <div className="font-mono-label font-black uppercase text-[10px] text-error mb-1">{turnLabel} • {event.phase}</div>
                <div className="font-bold text-on-surface group-hover:text-error transition-colors">{event.title}</div>
                {event.description && <div className="text-xs text-on-surface-variant mt-1">{event.description}</div>}
              </div>
            );
          }

          return (
            <div key={idx} className={`relative pl-8 ${isLast ? '' : 'pb-8'} group`}>
              <div className="absolute left-0 top-1 w-[24px] h-[24px] bg-background border-2 border-on-surface-variant rounded-full z-10 flex items-center justify-center">
                <div className="w-2 h-2 bg-on-surface-variant group-hover:bg-primary-fixed transition-colors"></div>
              </div>
              <div className="font-mono-label font-bold uppercase text-[10px] text-on-surface-variant mb-1">{turnLabel} • {event.phase}</div>
              <div className="font-bold text-on-surface group-hover:text-primary-fixed transition-colors">{event.title}</div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
