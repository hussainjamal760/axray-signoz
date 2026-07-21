import { RepoListPanel } from "@/features/repositories/components/RepoListPanel";
import { RepoDetailsPanel } from "@/features/repositories/components/RepoDetailsPanel";

export default function RepositoriesPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full relative z-10">
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 relative">
        <RepoListPanel />
        <RepoDetailsPanel />
      </div>
    </div>
  );
}
