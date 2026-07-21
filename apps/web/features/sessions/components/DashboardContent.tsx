import { useSessions } from "../hooks/useSessions";
import { OnboardingPanel } from "./OnboardingPanel";
import { SessionsList } from "./SessionsList";
import { useRouter } from "next/navigation";

export function DashboardContent() {
  const router = useRouter();
  const { data: sessions = [], isLoading, isError } = useSessions();

  if (isLoading) {
    return (
      <div className="col-span-12 flex justify-center py-20">
        <div className="font-mono-label text-sm uppercase animate-pulse text-primary-fixed font-black">
          Loading Sessions...
        </div>
      </div>
    );
  }

  if (isError || sessions.length === 0) {
    return <OnboardingPanel />;
  }

  return (
    <SessionsList
      sessions={sessions}
      onSelect={(id) => {
        if (id === "new") {
          router.push("/session/new");
        } else {
          router.push(`/sessions/${id}`);
        }
      }}
    />
  );
}
