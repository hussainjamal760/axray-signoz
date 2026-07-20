import { TraceHeader } from "@/components/traces/TraceHeader";
import { TraceCanvas } from "@/components/traces/TraceCanvas";
import { TraceSpanDetails } from "@/components/traces/TraceSpanDetails";

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
