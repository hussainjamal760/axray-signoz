"use client";

import { AppLayout } from "@/components/layout/AppLayout";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout showSidebar={true}>{children}</AppLayout>;
}
