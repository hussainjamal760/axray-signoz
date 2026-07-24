"use client";

import { DashboardContent } from "@/features/sessions/components";

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col h-full min-w-0 bg-background overflow-hidden">
      <div 
        className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8 space-y-8 custom-scrollbar animate-fade-in" 
        style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        data-lenis-prevent="true"
      >
        <DashboardContent />
      </div>
    </div>
  );
}
