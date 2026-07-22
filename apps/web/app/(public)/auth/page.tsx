import { AuthPageClient } from "@/features/auth/components/AuthPageClient";

export const metadata = {
  title: "Sign In — AXRAY",
  description: "Connect your GitHub account to get started with AXRAY.",
};

export default function AuthPage() {
  return <AuthPageClient />;
}
