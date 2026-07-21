"use client";

import { AppLayout } from "@/components/layout/AppLayout";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout showSidebar={false}>{children}</AppLayout>;
}
