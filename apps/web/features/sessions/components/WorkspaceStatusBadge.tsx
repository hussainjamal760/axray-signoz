interface WorkspaceStatusBadgeProps {
  isInitialized: boolean;
}

export function WorkspaceStatusBadge({ isInitialized }: WorkspaceStatusBadgeProps) {
  if (isInitialized) {
    return (
      <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-3 py-1 font-mono-label text-xs font-bold">
        Ready
      </span>
    );
  }

  return (
    <span className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-3 py-1 font-mono-label text-xs font-bold animate-pulse">
      Preparing
    </span>
  );
}
