import { AnalysisHeader } from "@/components/analysis/AnalysisHeader";
import { RootCauseCard } from "@/components/analysis/RootCauseCard";
import { CodeDiffCard } from "@/components/analysis/CodeDiffCard";
import { SuggestedFixCard } from "@/components/analysis/SuggestedFixCard";
import { FailureVisualization } from "@/components/analysis/FailureVisualization";
import { EvidenceTimeline } from "@/components/analysis/EvidenceTimeline";
import { StatsModule } from "@/components/analysis/StatsModule";

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
