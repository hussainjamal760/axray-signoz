"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { AuthCard } from "./AuthCard";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { isVercelProductionDomain } from "@/lib/utils";

export const AuthPageClient = () => {
  const { data, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (isVercelProductionDomain()) {
      router.replace("/?setup=true");
      return;
    }
    if (!isLoading && data?.authenticated) {
      router.replace("/sessions");
    }
  }, [isLoading, data, router]);

  if (isVercelProductionDomain()) {
    return <LoadingScreen message="Redirecting to Setup Guide..." />;
  }

  if (isLoading) {
    return <LoadingScreen message="Checking session..." />;
  }

  if (data?.authenticated) {
    // Redirect is in-flight — render nothing to avoid flash
    return null;
  }

  return <AuthCard />;
};
