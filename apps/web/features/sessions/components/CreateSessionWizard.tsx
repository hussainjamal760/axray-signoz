import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RepositoryDropdown, BranchDropdown } from "@/features/repositories/components";
import { useRepositories, useBranches, useCreateBranch } from "@/features/repositories/hooks";
import { useCreateSession } from "../hooks/useCreateSession";

export function CreateSessionWizard() {
  const router = useRouter();

  // Queries
  const {
    data: repositories = [],
    isLoading: repositoriesLoading,
    isError: isReposError,
    error: reposError,
  } = useRepositories();

  const [selectedRepoId, setSelectedRepoId] = useState<number | "">("");

  const selectedRepoObj = repositories.find((r) => r.id === selectedRepoId);
  const owner = selectedRepoObj?.owner;
  const repoName = selectedRepoObj?.name;

  const {
    data: branches = [],
    isLoading: branchesLoading,
    isError: isBranchesError,
    error: branchesError,
    refetch: refetchBranches,
  } = useBranches(owner, repoName);

  const [selectedBranch, setSelectedBranch] = useState("");

  // Branch Creation inline state
  const [isCreatingBranchPanelOpen, setIsCreatingBranchPanelOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newSourceBranch, setNewSourceBranch] = useState("");

  // Feedback Toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Mutations
  const { mutateAsync: createBranchMutate, isPending: isBranchMutationPending } = useCreateBranch(owner, repoName);
  const { mutate: runSession, isPending: isCreatingSession } = useCreateSession();

  // Handle repository selection logic
  useEffect(() => {
    if (repositories.length > 0) {
      const hasSelected = repositories.some((r) => r.id === selectedRepoId);
      if (!hasSelected) {
        setSelectedRepoId(repositories[0].id);
      }
    } else {
      setSelectedRepoId("");
    }
  }, [repositories]);

  // Handle branch selection logic
  useEffect(() => {
    if (branches.length > 0) {
      const hasSelected = branches.some((b) => b.name === selectedBranch);
      if (!hasSelected) {
        setSelectedBranch(branches[0].name);
      }
    } else {
      setSelectedBranch("");
    }
  }, [branches]);

  // Synchronize newSourceBranch when opening panel or branch changes
  useEffect(() => {
    if (branches.length > 0 && !newSourceBranch) {
      setNewSourceBranch(selectedBranch || branches[0].name);
    }
  }, [branches, selectedBranch, newSourceBranch]);

  const handleOpenBranchPanel = () => {
    setIsCreatingBranchPanelOpen(true);
    setNewBranchName("");
    setNewSourceBranch(selectedBranch || branches[0]?.name || "");
    setToast(null);
  };

  const handleCancelCreateBranch = () => {
    setIsCreatingBranchPanelOpen(false);
    setNewBranchName("");
  };

  const handleConfirmCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchName.trim() || !owner || !repoName || isBranchMutationPending) return;

    setToast(null);

    try {
      const res = await createBranchMutate({
        branchName: newBranchName.trim(),
        sourceBranch: newSourceBranch || selectedBranch || branches[0]?.name,
      });

      const createdName = res.data.name;

      // Refetch branches list
      const refetched = await refetchBranches();
      const updatedList = refetched.data || [];

      // Find created branch from refetched list
      const found = updatedList.find((b) => b.name === createdName);
      if (found) {
        setSelectedBranch(found.name);
      } else {
        setSelectedBranch(createdName);
      }

      // Success toast notification
      setToast({
        type: "success",
        message: `✓ Branch "${createdName}" created`,
      });

      // Reset inline form state
      setNewBranchName("");
      setIsCreatingBranchPanelOpen(false);
    } catch (err: any) {
      console.error("Failed to create branch:", err);
      setToast({
        type: "error",
        message: err?.message || err?.error || "Failed to create branch",
      });
    }
  };

  const handleSessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoObj || !selectedBranch || isCreatingSession || isBranchMutationPending) {
      return;
    }

    runSession(
      {
        repositoryId: selectedRepoObj.id,
        repositoryFullName: selectedRepoObj.fullName,
        branch: selectedBranch,
      },
      {
        onSuccess: (data) => {
          if (data?.id) {
            router.push(`/sessions/${data.id}`);
          } else {
            console.error("Created session response missing id:", data);
            alert("Error: Session was created but response is missing an ID.");
          }
        },
      }
    );
  };

  const isRepoDisabled = repositoriesLoading || isReposError || repositories.length === 0 || isCreatingSession || isBranchMutationPending;
  const isBranchDisabled = branchesLoading || isBranchesError || isReposError || branches.length === 0 || isCreatingSession || isBranchMutationPending;

  return (
    <form onSubmit={handleSessionSubmit} className="col-span-12 lg:col-span-8 bg-surface border-[3px] border-outline p-8 flex flex-col gap-8 brutalist-shadow">
      <div className="flex justify-between items-start">
        <h3 className="text-2xl font-black uppercase flex items-center gap-3 text-on-surface">
          <span className="material-symbols-outlined text-primary-fixed !text-3xl">rocket_launch</span>
          Create Workspace Session
        </h3>
        <span className="font-mono-label text-xs font-bold bg-primary-fixed text-on-primary-fixed px-2 py-1">WORKSPACE_V2</span>
      </div>

      {/* Toast Feedback Notification Banner */}
      {toast && (
        <div className={`p-4 border-2 flex items-center justify-between font-mono-label text-xs font-bold ${
          toast.type === 'success' ? 'bg-green-500/10 border-green-600 text-green-600' : 'bg-error-container border-error text-error'
        }`}>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
          <button type="button" onClick={() => setToast(null)} className="text-sm font-black hover:opacity-75">×</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RepositoryDropdown
          repositories={repositories}
          value={selectedRepoId}
          onChange={(id) => setSelectedRepoId(Number(id))}
          disabled={isRepoDisabled}
        />
        
        <div className="space-y-3">
          <BranchDropdown
            branches={branches}
            value={selectedBranch}
            onChange={setSelectedBranch}
            disabled={isBranchDisabled}
            isLoading={branchesLoading}
          />

          {!isCreatingBranchPanelOpen ? (
            <div>
              <button
                type="button"
                onClick={handleOpenBranchPanel}
                disabled={isBranchDisabled}
                className="text-xs font-black uppercase text-primary-fixed flex items-center gap-1 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Create New Branch
              </button>
              <p className="font-mono-label text-[10px] text-on-surface-variant mt-1">
                Creates the branch immediately on GitHub.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-surface-container border-2 border-outline space-y-4 brutalist-shadow-sm">
              <h4 className="font-mono-label text-xs font-black uppercase text-primary-fixed flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">git_branch</span>
                New Branch Setup
              </h4>

              <div className="space-y-1">
                <label className="font-mono-label text-[10px] uppercase text-on-surface-variant font-bold">Branch Name</label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="feature/auth"
                  disabled={isBranchMutationPending}
                  className="w-full bg-background border-2 border-outline p-2.5 text-on-surface font-mono-label text-xs focus:border-primary-fixed ring-0 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-mono-label text-[10px] uppercase text-on-surface-variant font-bold">Source Branch</label>
                <select
                  value={newSourceBranch}
                  onChange={(e) => setNewSourceBranch(e.target.value)}
                  disabled={isBranchMutationPending || branches.length === 0}
                  className="w-full bg-background border-2 border-outline p-2.5 text-on-surface font-bold text-xs focus:border-primary-fixed ring-0 outline-none disabled:opacity-50"
                >
                  {branches.length === 0 ? (
                    <option value="">No source branches available</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.name} value={b.name}>
                        {b.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCancelCreateBranch}
                  disabled={isBranchMutationPending}
                  className="px-3 py-1.5 bg-surface-container-high border border-outline text-xs font-bold uppercase text-on-surface hover:bg-surface-container-highest transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCreateBranch}
                  disabled={isBranchMutationPending || !newBranchName.trim() || branches.length === 0}
                  className="px-4 py-1.5 bg-primary-fixed text-on-primary-fixed text-xs font-black uppercase border-2 border-background flex items-center gap-2 brutalist-shadow-sm disabled:opacity-50"
                >
                  {isBranchMutationPending ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">sync</span>
                      Creating...
                    </>
                  ) : (
                    'Create'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center pt-6 border-t-2 border-outline-variant">
        <div className="flex gap-6">
          <div className="flex items-center gap-2 font-mono-label text-xs font-bold uppercase text-on-surface">
            <span className="material-symbols-outlined text-primary-fixed">bolt</span>
            Low_Latency
          </div>
          <div className="flex items-center gap-2 font-mono-label text-xs font-bold uppercase text-on-surface">
            <span className="material-symbols-outlined text-primary-fixed">visibility</span>
            Full_Trace
          </div>
        </div>

        <button
          type="submit"
          disabled={isCreatingSession || isBranchMutationPending || !selectedRepoObj || !selectedBranch}
          className="px-10 py-4 bg-primary-fixed text-on-primary-fixed font-black uppercase text-lg border-[3px] border-background brutalist-shadow-sm flex items-center gap-4 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreatingSession ? "Creating..." : "Create Session"}
          <span className="material-symbols-outlined font-black">arrow_forward</span>
        </button>
      </div>
    </form>
  );
}
