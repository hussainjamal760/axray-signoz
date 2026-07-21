import { TraceHeader } from "@/features/sessions/components/TraceHeader";
import { TraceCanvas } from "@/features/sessions/components/TraceCanvas";
import { TraceSpanDetails } from "@/features/sessions/components/TraceSpanDetails";

export default function TraceExplorerPage() {
  return (
    <>
      <TraceHeader />
      
      {/* Main Content Area */}
      <main className="flex flex-col md:flex-row flex-1 overflow-hidden min-h-0 relative z-10">
        <TraceCanvas />
        <TraceSpanDetails />
      </main>
    </>
  );
}
