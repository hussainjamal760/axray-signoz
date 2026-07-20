import { AnalyticsHeader } from "@/components/analytics/AnalyticsHeader";
import { MetricsRow } from "@/components/analytics/MetricsRow";
import { SuccessRateChart } from "@/components/analytics/SuccessRateChart";
import { FailureCategoriesChart } from "@/components/analytics/FailureCategoriesChart";
import { CostOverTimeChart } from "@/components/analytics/CostOverTimeChart";
import { ToolsUsageChart } from "@/components/analytics/ToolsUsageChart";
import { AnalyticsInsightCards } from "@/components/analytics/AnalyticsInsightCards";

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
