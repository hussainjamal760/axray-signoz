"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { AuthGuard } from "@/features/auth/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AppLayout>{children}</AppLayout>
    </AuthGuard>
  );
}
