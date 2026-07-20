"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !data?.authenticated) {
      router.push("/auth");
    }
  }, [isLoading, data, router]);

  if (isLoading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  if (!data?.authenticated) {
    return null;
  }

  return <>{children}</>;
};
