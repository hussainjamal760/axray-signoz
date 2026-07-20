import { AnalyticsHeader } from "@/features/sessions/components/AnalyticsHeader";
import { MetricsRow } from "@/features/sessions/components/MetricsRow";
import { SuccessRateChart } from "@/features/sessions/components/SuccessRateChart";
import { FailureCategoriesChart } from "@/features/sessions/components/FailureCategoriesChart";
import { CostOverTimeChart } from "@/features/sessions/components/CostOverTimeChart";
import { ToolsUsageChart } from "@/features/sessions/components/ToolsUsageChart";
import { AnalyticsInsightCards } from "@/features/sessions/components/AnalyticsInsightCards";

export default function AnalyticsDashboardPage() {
  return (
    <main className="flex-1 overflow-y-auto min-h-0 w-full relative z-10 custom-scrollbar p-6 md:p-8" data-lenis-prevent="true">
      <AnalyticsHeader />
      <MetricsRow />
      
      <div className="grid grid-cols-12 gap-6 mb-8 w-full">
        <SuccessRateChart />
        <FailureCategoriesChart />
      </div>
      
      <div className="grid grid-cols-12 gap-6 w-full">
        <CostOverTimeChart />
        <ToolsUsageChart />
      </div>
      
      <AnalyticsInsightCards />
    </main>
  );
}
