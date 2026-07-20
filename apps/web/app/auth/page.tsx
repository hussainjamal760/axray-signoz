import { AuthCard } from "@/features/auth/components/AuthCard";

export const metadata = {
  title: "Sign In — AXRAY",
  description: "Connect your GitHub account to get started with AXRAY.",
};

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <AuthCard />
    </div>
  );
}
