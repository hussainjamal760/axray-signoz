"use client";

import { CreateSessionWizard } from "@/features/sessions/components";
import Link from "next/link";

export default function NewSessionPage() {
  return (
    <div className="relative min-h-full flex flex-col bg-background bg-dot-pattern">
      {/* Subtle overlay gradient to blend the dots */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/90 pointer-events-none" />

      {/* Content Area */}
      <div className="relative z-10 flex-1 overflow-y-auto min-h-0 p-6 md:p-12 custom-scrollbar w-full" data-lenis-prevent="true">
        <div className="w-full">
          <CreateSessionWizard />
        </div>
      </div>
    </div>
  );
}
