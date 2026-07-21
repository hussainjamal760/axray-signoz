import { AnalysisHeader } from "@/features/sessions/components/AnalysisHeader";
import { RootCauseCard } from "@/features/sessions/components/RootCauseCard";
import { CodeDiffCard } from "@/features/sessions/components/CodeDiffCard";
import { SuggestedFixCard } from "@/features/sessions/components/SuggestedFixCard";
import { FailureVisualization } from "@/features/sessions/components/FailureVisualization";
import { EvidenceTimeline } from "@/features/sessions/components/EvidenceTimeline";
import { StatsModule } from "@/features/sessions/components/StatsModule";

export default function FailureAnalysisPage() {
  return (
    <main className="flex-1 overflow-y-auto min-h-0 px-8 py-12 grid grid-cols-12 gap-6 w-full custom-scrollbar" data-lenis-prevent="true">
      <AnalysisHeader />

      {/* Main Content (Left Column) */}
      <section className="col-span-12 lg:col-span-8 space-y-6">
        <RootCauseCard />
        <CodeDiffCard />
        <SuggestedFixCard />
      </section>

      {/* Right Sidebar */}
      <aside className="col-span-12 lg:col-span-4 space-y-6">
        <FailureVisualization />
        <EvidenceTimeline />
        <StatsModule />
      </aside>
    </main>
  );
}
