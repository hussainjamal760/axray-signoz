"use client";

import * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  MessageSquare,
  CheckCheck,
  Mail,
  FileDown,
  ListPlus,
  Search,
  Plus,
  CircleDot,
  Share2,
  SlidersHorizontal,
  Users,
  X,
  FolderGit2,
  GitBranch,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SessionSummary } from "../types/sessions.types";
import { useRouter } from "next/navigation";

export interface SearchTag {
  label: string;
  icon?: React.ReactNode;
}

export interface SearchResultAction {
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
}

export interface SearchResult {
  name: string;
  meta?: string;
  avatar?: string;
  icon?: React.ReactNode;
  href?: string;
  actions?: SearchResultAction[];
  originalSession?: SessionSummary;
}

export interface QuickAction {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick?: () => void;
}

export interface SearchModalProps {
  placeholder?: string;
  tags?: SearchTag[];
  sessions?: SessionSummary[];
  quickActions?: QuickAction[];
  defaultQuery?: string;
  onQueryChange?: (query: string) => void;
  onSelectResult?: (result: SearchResult, index: number) => void;
  className?: string;
  modal?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  hotkey?: string | null;
  closeOnEscape?: boolean;
  overlayClassName?: string;
}

const ICON = "h-[18px] w-[18px] text-on-surface-variant";

const DEFAULT_TAGS: SearchTag[] = [
  { label: "Active", icon: <CircleDot className="h-4 w-4 text-green-500" /> },
  { label: "Archived", icon: <FolderGit2 className="h-4 w-4 text-on-surface-variant" /> },
  { label: "Running Agents", icon: <Cpu className="h-4 w-4 text-primary-fixed" /> },
];

export function SessionSearchModal({
  placeholder = "Search repositories, branches, or agents...",
  tags = DEFAULT_TAGS,
  sessions = [],
  quickActions = [],
  defaultQuery = "",
  onQueryChange,
  onSelectResult,
  className,
  modal = true,
  open,
  defaultOpen = false,
  onOpenChange,
  hotkey = "k",
  closeOnEscape = true,
  overlayClassName,
}: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState(defaultQuery);
  const [activeTags, setActiveTags] = useState<SearchTag[]>(tags);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isControlled = open !== undefined;
  const [internalOpen, setInternalOpen] = useState(defaultOpen);
  const actualOpen = isControlled ? open : internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (!isControlled) setInternalOpen(value);
      onOpenChange?.(value);
    },
    [isControlled, onOpenChange]
  );

  const openRef = useRef(actualOpen);
  const setOpenRef = useRef(setOpen);
  useEffect(() => {
    openRef.current = actualOpen;
    setOpenRef.current = setOpen;
  });

  useEffect(() => {
    if (!modal) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (hotkey && e.key.toLowerCase() === hotkey.toLowerCase() && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpenRef.current(!openRef.current);
      } else if (closeOnEscape && e.key === "Escape" && openRef.current) {
        setOpenRef.current(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal, hotkey, closeOnEscape]);

  useEffect(() => {
    if (modal && actualOpen) {
      const id = requestAnimationFrame(() => inputRef.current?.focus());
      return () => cancelAnimationFrame(id);
    }
  }, [modal, actualOpen]);

  const results: SearchResult[] = useMemo(() => {
    return sessions.map(session => ({
      name: session.repositoryFullName,
      meta: `Branch: ${session.branch} • ${session.status}`,
      icon: <FolderGit2 className="h-5 w-5 text-primary-fixed" />,
      originalSession: session,
    }));
  }, [sessions]);

  const filteredResults = useMemo(() => {
    let q = query.trim().toLowerCase();
    let filtered = results;

    if (q) {
      filtered = filtered.filter((r) => 
        `${r.name} ${r.meta ?? ""}`.toLowerCase().includes(q)
      );
    }

    if (activeTags.length > 0 && activeTags.length < DEFAULT_TAGS.length) {
      // Basic mock filtering based on tags
      const hasActive = activeTags.some(t => t.label === "Active");
      const hasArchived = activeTags.some(t => t.label === "Archived");
      
      if (hasActive && !hasArchived) {
        filtered = filtered.filter(r => r.originalSession?.status === 'active');
      } else if (!hasActive && hasArchived) {
        filtered = filtered.filter(r => r.originalSession?.status === 'archived');
      }
    }

    return filtered;
  }, [query, results, activeTags]);

  const handleQuery = (value: string) => {
    setQuery(value);
    onQueryChange?.(value);
  };

  const removeTag = (index: number) =>
    setActiveTags((prev) => prev.filter((_, i) => i !== index));

  const toggleTag = (tag: SearchTag) => {
    setActiveTags((prev) => {
      const exists = prev.some((t) => t.label === tag.label);
      if (exists) {
        return prev.filter((t) => t.label !== tag.label);
      }
      return [...prev, tag];
    });
  };

  const handleSelectResult = (result: SearchResult, index: number) => {
    if (result.originalSession) {
      router.push(`/sessions/${result.originalSession.id}`);
    }
    onSelectResult?.(result, index);
    setOpen(false);
  };

  const panel = (
    <div
      role={modal ? "dialog" : undefined}
      aria-modal={modal ? true : undefined}
      className={cn(
        "mx-auto w-full max-w-2xl overflow-hidden rounded-2xl border-2 backdrop-blur-xl",
        "border-outline bg-surface/90 text-on-surface shadow-2xl",
        className
      )}
    >
      {/* Search bar */}
      <div className="flex items-center gap-2 border-b-2 border-outline-variant px-4 py-4">
        <Search className={ICON} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search"
          className="min-w-0 flex-1 bg-transparent px-3 text-base text-white outline-none placeholder:text-on-surface-variant"
        />
        <div className="flex shrink-0 items-center gap-3">
          <div className="relative">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-label="Filters"
              className={cn(
                "text-on-surface-variant transition-colors hover:text-white",
                filtersOpen && "text-white"
              )}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
            {filtersOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-outline-variant bg-surface-container-high p-2 shadow-xl z-50">
                {tags.map((tag) => {
                  const isActive = activeTags.some((t) => t.label === tag.label);
                  return (
                    <button
                      key={tag.label}
                      onClick={() => toggleTag(tag)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-surface-container-highest"
                    >
                      <div className="flex h-4 w-4 items-center justify-center rounded border border-outline-variant">
                        {isActive && <CheckCheck className="h-3 w-3 text-primary-fixed" />}
                      </div>
                      <span className="text-on-surface">{tag.label}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <kbd className="flex items-center gap-1 rounded-md border border-outline-variant bg-surface-container px-2 py-1 font-sans text-xs font-bold text-on-surface-variant">
            <span className="text-sm leading-none">⌘</span>
            {modal && hotkey ? hotkey.toUpperCase() : "F"}
          </kbd>
        </div>
      </div>

      {/* Tags */}
      {activeTags.length > 0 ? (
        <div className="border-b-2 border-outline-variant px-5 py-4 bg-surface-container-low">
          <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Filter by</span>
          <div className="mt-3 flex flex-wrap gap-2">
            {activeTags.map((tag, i) => (
              <span
                key={`${tag.label}-${i}`}
                className="flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 text-xs font-bold ring-1 ring-inset ring-outline-variant text-white"
              >
                {tag.icon}
                <span>{tag.label}</span>
                <button
                  type="button"
                  onClick={() => removeTag(i)}
                  aria-label={`Remove ${tag.label}`}
                  className="text-on-surface-variant transition-colors hover:text-red-400 ml-1"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Results */}
      {filteredResults.length > 0 ? (
        <div className="border-b-2 border-outline-variant">
          <p className="px-5 pt-4 pb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
            Sessions&nbsp;&nbsp;<span className="text-primary-fixed">{filteredResults.length}</span>
          </p>
          <ul className="px-2 pb-2 max-h-[40vh] overflow-y-auto custom-scrollbar">
            {filteredResults.map((result, i) => (
              <li key={`${result.name}-${i}`}>
                <button
                  onClick={() => handleSelectResult(result, i)}
                  className="group relative flex w-full items-center text-left rounded-xl px-4 py-3 transition-colors hover:bg-surface-container-highest focus:bg-surface-container-highest outline-none"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container border border-outline-variant">
                    {result.icon}
                  </span>
                  <span className="ml-4 flex-1 truncate">
                    <span className="block text-base font-bold text-white truncate">{result.name}</span>
                    {result.meta ? <span className="block text-sm text-on-surface-variant mt-0.5 truncate">{result.meta}</span> : null}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="py-12 text-center text-on-surface-variant">
          <p className="text-sm">No sessions found matching your search.</p>
        </div>
      )}

      {/* Quick actions */}
      {quickActions.length > 0 ? (
        <div className="px-2 py-2 bg-surface-container-low">
          <p className="px-3 pt-3 pb-2 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Quick actions</p>
          {quickActions.map((action, i) => (
            <button
              key={`${action.label}-${i}`}
              type="button"
              onClick={() => {
                action.onClick?.();
                setOpen(false);
              }}
              className="relative flex w-full items-center rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-surface-container-highest"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-surface-container border border-outline-variant text-on-surface-variant">
                {action.icon ?? <Plus className="h-4 w-4" />}
              </span>
              <span className="pl-3 text-sm font-semibold text-white">{action.label}</span>
              {action.shortcut ? (
                <kbd className="ml-auto flex h-[26px] w-[26px] items-center justify-center rounded-md bg-surface-container font-sans text-xs font-bold text-on-surface-variant border border-outline-variant">
                  {action.shortcut}
                </kbd>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  if (!modal) return panel;

  return (
    <div
      onClick={() => setOpen(false)}
      aria-hidden={!actualOpen}
      className={cn(
        "fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] transition-opacity duration-200",
        actualOpen ? "opacity-100" : "pointer-events-none opacity-0",
        overlayClassName
      )}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "relative z-10 w-full max-w-2xl transition-all duration-200 ease-out",
          actualOpen ? "translate-y-0 scale-100 opacity-100" : "-translate-y-4 scale-[0.98] opacity-0"
        )}
      >
        {panel}
      </div>
    </div>
  );
}

export default SessionSearchModal;
