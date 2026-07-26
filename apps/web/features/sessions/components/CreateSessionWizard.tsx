import { useEffect, useState, useRef, useMemo } from "react";
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

  // Feedback Toast state
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Searchable Repository Dropdown State
  const [isRepoDropdownOpen, setIsRepoDropdownOpen] = useState(false);
  const [repoSearchQuery, setRepoSearchQuery] = useState("");
  const repoDropdownRef = useRef<HTMLDivElement>(null);

  // Close repository dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (repoDropdownRef.current && !repoDropdownRef.current.contains(event.target as Node)) {
        setIsRepoDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered repositories based on search input query
  const filteredRepositories = useMemo(() => {
    if (!repoSearchQuery.trim()) return repositories;
    const q = repoSearchQuery.toLowerCase().trim();
    return repositories.filter(
      (repo) =>
        repo.fullName.toLowerCase().includes(q) ||
        repo.name.toLowerCase().includes(q) ||
        repo.owner.toLowerCase().includes(q)
    );
  }, [repositories, repoSearchQuery]);

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
  }, [repositories, selectedRepoId]);

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
  }, [branches, selectedBranch]);

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

      const found = updatedList.find((b) => b.name === createdName);
      if (found) {
        setSelectedBranch(found.name);
      } else {
        setSelectedBranch(createdName);
      }

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
    <div className="w-full flex-1 max-w-[1600px] mx-auto font-sans px-4 sm:px-8 py-2 fade-in-up">
      {/* Toast Feedback Notification Banner */}
      {toast && (
        <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-4 rounded-full flex items-center justify-between text-sm font-medium shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-top-4 ${
          toast.type === 'success' ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'
        }`}>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            {toast.message}
          </div>
          <button type="button" onClick={() => setToast(null)} className="ml-6 text-sm font-semibold hover:opacity-75 transition-opacity">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
      )}

      {/* Hero Typography */}
      <div className="mb-10 text-center lg:text-left lg:px-4">
        <div className="inline-flex items-center justify-center gap-2 px-3 py-1 mb-4 rounded-full border border-outline-variant/30 bg-surface-container-lowest text-xs font-semibold tracking-widest uppercase text-on-surface-variant">
          <span className="w-1.5 h-1.5 rounded-full bg-primary-fixed animate-pulse"></span>
          Environment Setup
        </div>
        <h1 className="text-4xl lg:text-6xl font-light tracking-tighter text-on-background">
          Initialize <span className="font-medium text-primary-fixed">Workspace.</span>
        </h1>
        <p className="text-on-surface-variant text-base mt-4 max-w-xl font-light leading-relaxed">
          Select your repository and active branch. The system will provision an isolated AI agent environment instantly.
        </p>
      </div>

      {/* Main 20-60-20 Layout */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 w-full items-start">
        
        {/* Left Column (20%): WeMakeDevs */}
        <div className="w-full lg:w-[20%] flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-sm hover:border-primary-fixed/30 transition-all duration-500 flex flex-col group h-full">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Community</span>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary-fixed transition-colors">emoji_events</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm p-3 overflow-hidden border border-outline-variant/20 group-hover:scale-105 transition-transform duration-500">
                <img src="/logo/wemakedev.jpg" alt="WeMakeDevs" className="w-full h-full object-contain" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-on-surface mb-2">Built for Hackathon</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  AXRAY serves as a black-box flight recorder for AI Agents, providing observability for modern workflows.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column (60%): Repository & Branch Selection */}
        <div className="w-full lg:w-[60%] flex flex-col gap-8">
          
          <div className="bg-surface-container-lowest rounded-3xl p-8 lg:p-12 border border-outline-variant/30 shadow-sm transition-all hover:border-primary-fixed/20 duration-500 relative overflow-hidden">
            {/* Subtle background decoration */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary-fixed opacity-[0.04] rounded-full blur-3xl pointer-events-none"></div>

            {/* Repository Select */}
            <div className="mb-10 relative z-30">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                  Repository
                </label>
              </div>

              <div className="relative" ref={repoDropdownRef}>
                {/* Trigger Button */}
                <button
                  type="button"
                  disabled={isRepoDisabled}
                  onClick={() => setIsRepoDropdownOpen((prev) => !prev)}
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-2xl px-6 py-5 text-base text-on-surface flex items-center justify-between focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/50 outline-none transition-all disabled:opacity-60 cursor-pointer shadow-inner text-left"
                >
                  <span className="truncate font-medium">
                    {repositoriesLoading
                      ? "Loading repositories..."
                      : repositories.length === 0
                      ? "No repositories found"
                      : selectedRepoObj
                      ? selectedRepoObj.fullName
                      : "Select a repository"}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center bg-surface-container-lowest rounded-full border border-outline-variant/20 shrink-0 ml-3">
                    <span className="material-symbols-outlined text-[16px] text-on-surface">
                      {isRepoDropdownOpen ? "expand_less" : "unfold_more"}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu Popup with Working Search Input */}
                {isRepoDropdownOpen && !isRepoDisabled && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-surface-container-highest border border-outline-variant/40 rounded-2xl p-3 shadow-2xl backdrop-blur-2xl animate-in fade-in-50 zoom-in-95">
                    {/* Search Input Box */}
                    <div className="relative mb-2">
                      <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant/60 pointer-events-none">
                        search
                      </span>
                      <input
                        type="text"
                        value={repoSearchQuery}
                        onChange={(e) => setRepoSearchQuery(e.target.value)}
                        placeholder="Search repositories..."
                        autoFocus
                        className="w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl pl-10 pr-9 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary-fixed focus:outline-none transition-all"
                      />
                      {repoSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setRepoSearchQuery("")}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[16px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Scrollable Repository List */}
                    <div className="max-h-60 overflow-y-auto custom-scrollbar space-y-0.5">
                      {filteredRepositories.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-on-surface-variant/70 text-center">
                          No repositories match "{repoSearchQuery}"
                        </div>
                      ) : (
                        filteredRepositories.map((repo) => {
                          const isSelected = repo.id === selectedRepoId;
                          return (
                            <button
                              key={repo.id}
                              type="button"
                              onClick={() => {
                                setSelectedRepoId(repo.id);
                                setIsRepoDropdownOpen(false);
                                setRepoSearchQuery("");
                              }}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center justify-between ${
                                isSelected
                                  ? "bg-primary-fixed/15 text-primary-fixed font-semibold"
                                  : "text-on-surface hover:bg-surface-container-lowest/80"
                              }`}
                            >
                              <span className="truncate">{repo.fullName}</span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-[18px] text-primary-fixed shrink-0 ml-2">
                                  check
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Branch Select */}
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-4">
                <label className="text-[11px] font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                  Active Branch
                </label>
              </div>
              
              {!isCreatingBranchPanelOpen ? (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1 group">
                    <select
                      value={selectedBranch}
                      onChange={(e) => setSelectedBranch(e.target.value)}
                      disabled={isBranchDisabled}
                      className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-2xl px-6 py-5 text-base text-on-surface appearance-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed/50 outline-none transition-all disabled:opacity-60 cursor-pointer shadow-inner"
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
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none w-8 h-8 flex items-center justify-center bg-surface-container-lowest rounded-full border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[16px] text-on-surface">call_split</span>
                    </div>
                  </div>
                  <button
                    onClick={handleOpenBranchPanel}
                    disabled={isBranchDisabled}
                    className="px-8 py-5 bg-transparent border border-primary-fixed/50 text-primary-fixed hover:bg-primary-fixed hover:text-black rounded-2xl text-[15px] font-medium transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3 whitespace-nowrap"
                  >
                    <span className="material-symbols-outlined text-[20px]">add</span>
                    New Branch
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-6 border border-primary-fixed/30 rounded-2xl p-8 bg-primary-fixed/5 shadow-inner">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-primary-fixed uppercase tracking-wider">Name</label>
                      <input
                        type="text"
                        value={newBranchName}
                        onChange={(e) => setNewBranchName(e.target.value)}
                        placeholder="e.g. feature/update"
                        disabled={isBranchMutationPending}
                        className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-2xl px-6 py-4 text-[15px] focus:border-primary-fixed outline-none transition-all text-on-surface"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-bold text-primary-fixed uppercase tracking-wider">Source</label>
                      <div className="relative group">
                        <select
                          value={newSourceBranch}
                          onChange={(e) => setNewSourceBranch(e.target.value)}
                          disabled={isBranchMutationPending || branches.length === 0}
                          className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-2xl px-6 py-4 text-[15px] focus:border-primary-fixed outline-none transition-all appearance-none text-on-surface cursor-pointer"
                        >
                          {branches.map((b) => (
                            <option key={b.name} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">unfold_more</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-2">
                    <button
                      onClick={handleCancelCreateBranch}
                      disabled={isBranchMutationPending}
                      className="px-6 py-3 text-[14px] font-medium text-on-surface-variant hover:text-on-surface rounded-2xl hover:bg-surface-container transition-all disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmCreateBranch}
                      disabled={isBranchMutationPending || !newBranchName.trim()}
                      className="px-8 py-3 bg-primary-fixed text-black font-semibold text-[14px] rounded-2xl hover:brightness-110 active:scale-[0.97] transition-all disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                    >
                      {isBranchMutationPending ? (
                        <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                      ) : (
                        "Create Branch"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Launch Button inside the main panel, decoupled but visually striking */}
            <div className="mt-12 pt-8 border-t border-outline-variant/20 relative z-10">
              <button
                onClick={handleSessionSubmit}
                disabled={isCreatingSession || !selectedRepoObj || !selectedBranch || isBranchMutationPending}
                className="w-full relative px-8 py-6 bg-primary-fixed text-black font-semibold text-[18px] tracking-wide rounded-2xl hover:brightness-110 active:scale-[0.99] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-4 group shadow-[0_4px_20px_rgba(204,255,0,0.15)] hover:shadow-[0_8px_30px_rgba(204,255,0,0.25)]"
              >
                {isCreatingSession ? (
                  <>
                    <span className="material-symbols-outlined animate-spin text-[24px]">progress_activity</span>
                    Provisioning Environment...
                  </>
                ) : (
                  <>
                    Launch Session
                    <span className="material-symbols-outlined text-[24px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300">north_east</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (20%): SigNoz */}
        <div className="w-full lg:w-[20%] flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/30 shadow-sm hover:border-primary-fixed/30 transition-all duration-500 flex flex-col group h-full">
            <div className="flex justify-between items-start mb-8">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">Telemetry</span>
              <span className="material-symbols-outlined text-[20px] text-on-surface-variant group-hover:text-primary-fixed transition-colors">monitoring</span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-6">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm p-3 overflow-hidden border border-outline-variant/20 group-hover:scale-105 transition-transform duration-500">
                <img src="/logo/signoz.jpg" alt="SigNoz" className="w-full h-full object-contain" />
              </div>
              <div className="text-center">
                <h4 className="text-sm font-medium text-on-surface mb-2">Powered by SigNoz</h4>
                <p className="text-xs text-on-surface-variant leading-relaxed mb-5">
                  Open-source observability engine powering deep telemetry with zero vendor lock-in.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Traces', 'Metrics', 'Logs'].map((item) => (
                    <span key={item} className="px-3 py-1.5 bg-surface-container-highest rounded-full text-[9px] font-semibold text-on-surface tracking-widest uppercase">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
