"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useCurrentUser } from "../hooks/useCurrentUser";

const AuthLoading = () => (
  <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-primary-fixed border-t-transparent animate-spin" />
      <span className="font-mono-label text-xs uppercase tracking-widest text-on-surface-variant">
        Verifying session...
      </span>
    </div>
  </div>
);

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  // Invalidate on mount to pick up a fresh session after OAuth redirect
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["auth"] });
  }, [queryClient]);

  useEffect(() => {
    if (!isLoading && !data?.authenticated) {
      router.push("/auth");
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!data?.authenticated) {
    return null;
  }

  return <>{children}</>;
};
