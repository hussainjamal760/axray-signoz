import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRepositories, useBranches, useCreateBranch } from "@/features/repositories/hooks";
import { useCreateSession } from "../hooks/useCreateSession";

export function CreateSessionWizard() {
  const router = useRouter();

  // Queries
  const {
    data: repositories = [],
    isLoading: repositoriesLoading,
    isError: isReposError,
  } = useRepositories();

  const [selectedRepoId, setSelectedRepoId] = useState<number | "">("");

  const selectedRepoObj = repositories.find((r) => r.id === selectedRepoId);
  const owner = selectedRepoObj?.owner;
  const repoName = selectedRepoObj?.name;

  const {
    data: branches = [],
    isLoading: branchesLoading,
    isError: isBranchesError,
    refetch: refetchBranches,
  } = useBranches(owner, repoName);

  const [selectedBranch, setSelectedBranch] = useState("");

  // Branch Creation inline state
  const [isCreatingBranchPanelOpen, setIsCreatingBranchPanelOpen] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newSourceBranch, setNewSourceBranch] = useState("");

  // Config states
  const [opMode, setOpMode] = useState<"creative" | "strict">("creative");
  const [allowExternalApi, setAllowExternalApi] = useState(false);
  const [writeRestricted, setWriteRestricted] = useState(true);
  const [autoWipe, setAutoWipe] = useState(true);

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

  const handleConfirmCreateBranch = async (e: React.MouseEvent) => {
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

  const handleSessionSubmit = () => {
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
            // Redirect to the specific Session Dashboard command center
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
    <div className="w-full flex-1">
      {/* Toast Feedback Notification Banner */}
      {toast && (
        <div className={`mb-8 p-4 border-2 flex items-center justify-between font-mono-label text-xs font-bold ${toast.type === 'success' ? 'bg-green-500/10 border-green-600 text-green-600' : 'bg-error-container border-error text-error'
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

      {/* Page Title Section */}
      <div className="mb-6">
        <h1 className="font-headline-xl text-[40px] md:text-[48px] font-black italic tracking-tighter leading-tight flex items-center gap-4">
          <span className="bg-primary-fixed text-black px-2 not-italic">NEW</span>
          SESSION_INITIALIZATION
        </h1>
        <div className="h-1 bg-on-surface mt-2 w-32"></div>
      </div>

      {/* Form Container */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column: Source Configuration */}
        <div className="col-span-12 lg:col-span-7 space-y-6">
          {/* Repository Selection */}
          <section className="border-[3px] border-on-surface bg-surface-container p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 bg-on-surface text-surface text-[10px] font-mono-label font-bold uppercase">Source Control</div>
            <label className="block font-mono-label text-xs uppercase text-on-surface-variant mb-4 font-bold tracking-widest">Select Repository</label>
            <div className="relative group">
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(Number(e.target.value))}
                disabled={isRepoDisabled}
                className="w-full bg-surface-container-lowest border-2 border-on-surface p-4 font-mono-label text-sm appearance-none focus:border-primary-fixed focus:ring-0 transition-colors uppercase disabled:opacity-50"
              >
                {repositoriesLoading ? (
                  <option value="">Loading repositories...</option>
                ) : repositories.length === 0 ? (
                  <option value="">No repositories found</option>
                ) : (
                  repositories.map((repo) => (
                    <option key={repo.id} value={repo.id}>{repo.fullName}</option>
                  ))
                )}
              </select>
              <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">expand_more</span>
            </div>
          </section>

          {/* Branch Selection */}
          <section className="border-[3px] border-on-surface bg-surface-container p-6 relative">
            <label className="block font-mono-label text-xs uppercase text-on-surface-variant mb-4 font-bold tracking-widest">Active Branch</label>

            {!isCreatingBranchPanelOpen ? (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1 group">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    disabled={isBranchDisabled}
                    className="w-full bg-surface-container-lowest border-2 border-on-surface p-4 font-mono-label text-sm appearance-none focus:border-primary-fixed focus:ring-0 transition-colors uppercase disabled:opacity-50"
                  >
                    {branchesLoading ? (
                      <option value="">Loading branches...</option>
                    ) : branches.length === 0 ? (
                      <option value="">No branches found</option>
                    ) : (
                      branches.map((b) => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))
                    )}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">fork_right</span>
                </div>
                <button
                  onClick={handleOpenBranchPanel}
                  disabled={isBranchDisabled}
                  className="whitespace-nowrap px-6 py-4 bg-surface-container-highest border-2 border-on-surface font-mono-label font-black text-sm uppercase hover:bg-secondary-container transition-all active:translate-x-1 active:translate-y-1 disabled:opacity-50"
                >
                  + CREATE_BRANCH
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 border-2 border-primary-fixed/50 p-4 bg-background/50">
                <div className="space-y-1">
                  <label className="font-mono-label text-[10px] uppercase text-primary-fixed font-bold">New Branch Name</label>
                  <input
                    type="text"
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    placeholder="feature/auth"
                    disabled={isBranchMutationPending}
                    className="w-full bg-surface-container-lowest border-2 border-on-surface p-3 font-mono-label text-sm focus:border-primary-fixed outline-none transition-all uppercase"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-mono-label text-[10px] uppercase text-primary-fixed font-bold">Source Branch</label>
                  <select
                    value={newSourceBranch}
                    onChange={(e) => setNewSourceBranch(e.target.value)}
                    disabled={isBranchMutationPending || branches.length === 0}
                    className="w-full bg-surface-container-lowest border-2 border-on-surface p-3 font-mono-label text-sm focus:border-primary-fixed outline-none transition-all uppercase"
                  >
                    {branches.map((b) => (
                      <option key={b.name} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button
                    onClick={handleCancelCreateBranch}
                    disabled={isBranchMutationPending}
                    className="px-4 py-2 font-mono-label text-xs font-bold uppercase hover:bg-surface-container transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmCreateBranch}
                    disabled={isBranchMutationPending || !newBranchName.trim()}
                    className="px-6 py-2 bg-primary-fixed text-black font-mono-label font-black text-xs uppercase border-2 border-black active:translate-x-1 active:translate-y-1 transition-transform disabled:opacity-50"
                  >
                    {isBranchMutationPending ? "Creating..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Launch Action Section */}
          <div className="pt-6 mt-2 border-t-[3px] border-on-surface flex flex-col gap-6">
            <button
              onClick={handleSessionSubmit}
              disabled={isCreatingSession || !selectedRepoObj || !selectedBranch || isBranchMutationPending}
              className="w-full group relative px-8 py-8 bg-primary-fixed text-black font-headline-lg text-[24px] sm:text-[32px] font-black uppercase tracking-tighter transition-all duration-300 ease-out border-[3px] border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[10px_10px_0px_0px_#000] active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:translate-x-0 disabled:hover:shadow-[4px_4px_0px_0px_#000] text-center"
            >
              {isCreatingSession ? "INITIALIZING..." : "LAUNCH_SESSION_EXECUTION"}
              <div className="absolute -top-4 -right-4 w-12 h-12 bg-black border-2 border-primary-fixed flex items-center justify-center -rotate-12 group-hover:rotate-[20deg] group-hover:-translate-y-2 group-hover:translate-x-2 group-hover:scale-125 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                <span className="material-symbols-outlined text-primary-fixed">rocket_launch</span>
              </div>
            </button>
          </div>
        </div>

        {/* Right Column: Hackathon & Sponsor Info */}
        <div className="col-span-12 lg:col-span-5 space-y-4 flex flex-col">
          {/* WeMakeDevs Hackathon Info */}
          <div className="border-[3px] border-on-surface bg-surface-container relative flex-1 flex flex-col">
            <div className="p-3 border-b-2 border-on-surface bg-surface-container-high flex justify-between items-center">
              <h3 className="font-mono-label font-black text-[11px] uppercase tracking-widest text-primary-fixed">WeMakeDevs Hackathon</h3>
              <span className="material-symbols-outlined text-sm text-primary-fixed">emoji_events</span>
            </div>
            <div className="p-5 flex flex-col gap-4 flex-1 justify-center">
              <div className="flex items-center justify-center">
                <div className="p-1.5 border-[3px] border-on-surface bg-white shadow-[3px_3px_0px_0px_#000]">
                  <img src="/logo/wemakedev.jpg" alt="WeMakeDevs" className="h-12 object-contain mix-blend-multiply" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h4 className="font-headline-lg text-xl font-black text-white uppercase tracking-tighter">Built for the Community</h4>
                <p className="font-mono-label text-[10px] text-on-surface-variant leading-relaxed">
                  This project is proudly built for the WeMakeDevs Hackathon. AXRAY serves as a black-box flight recorder for AI Agents, providing total observability and debugging superpowers for modern AI workflows.
                </p>
              </div>
            </div>
          </div>

          {/* SigNoz Power Info */}
          <div className="border-[3px] border-on-surface bg-surface-container relative flex-1 flex flex-col">
            <div className="p-3 border-b-2 border-on-surface bg-surface-container-high flex justify-between items-center">
              <h3 className="font-mono-label font-black text-[11px] uppercase tracking-widest text-primary-fixed">Powered By SigNoz</h3>
              <span className="material-symbols-outlined text-sm text-primary-fixed">monitoring</span>
            </div>
            <div className="p-5 flex flex-col gap-3 flex-1 justify-center">
              <div className="flex items-center justify-center">
                <div className="p-1.5 border-[3px] border-on-surface bg-white shadow-[3px_3px_0px_0px_#000]">
                  <img src="/logo/signoz.jpg" alt="SigNoz" className="h-8 object-contain mix-blend-multiply" />
                </div>
              </div>
              <p className="font-mono-label text-[10px] text-on-surface-variant leading-relaxed text-center">
                SigNoz is the open-source observability engine that powers AXRAY's deep telemetry.
                It helps us seamlessly track agent traces, compute metrics, and analyze LLM spans with zero vendor lock-in!
              </p>

              <div className="grid grid-cols-2 gap-2 mt-1">
                <div className="bg-surface-container-lowest border-2 border-on-surface p-1.5 text-center shadow-[2px_2px_0px_0px_theme(colors.on-surface)]">
                  <span className="font-mono-label text-[9px] uppercase font-bold text-primary-fixed">Traces</span>
                </div>
                <div className="bg-surface-container-lowest border-2 border-on-surface p-1.5 text-center shadow-[2px_2px_0px_0px_theme(colors.on-surface)]">
                  <span className="font-mono-label text-[9px] uppercase font-bold text-primary-fixed">Metrics</span>
                </div>
                <div className="bg-surface-container-lowest border-2 border-on-surface p-1.5 text-center shadow-[2px_2px_0px_0px_theme(colors.on-surface)]">
                  <span className="font-mono-label text-[9px] uppercase font-bold text-primary-fixed">Logs</span>
                </div>
                <div className="bg-surface-container-lowest border-2 border-on-surface p-1.5 text-center shadow-[2px_2px_0px_0px_theme(colors.on-surface)]">
                  <span className="font-mono-label text-[9px] uppercase font-bold text-primary-fixed">Exceptions</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
