"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSessions } from "@/features/sessions/hooks/useSessions";
import { SessionSearchModal } from "@/features/sessions/components/SessionSearchModal";

interface TopNavProps {
  onToggleSidebar?: () => void;
  showSidebarButton?: boolean;
}

export function TopNav({ showSidebarButton, onToggleSidebar }: TopNavProps) {
  const pathname = usePathname();
  const currentPath = (pathname?.split('/')[1] || 'dashboard').replace(/-/g, ' ');

  const sessionMatch = pathname?.match(/^\/sessions\/([^/]+)/);
  const isInsideSession = !!sessionMatch && !pathname?.startsWith('/sessions/new');
  const currentSessionId = isInsideSession ? sessionMatch[1] : null;
  const isSessionHub = pathname === "/sessions" || pathname === "/sessions/";
  const isAccountPage = pathname === "/account" || pathname === "/account/";

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: logout, isPending } = useLogout();
  const { data: currentUserData } = useCurrentUser();
  const { data: sessions = [] } = useSessions();
  const currentSession = currentSessionId ? sessions.find((s: any) => s.id === currentSessionId) : null;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderBreadcrumb = () => {
    if (isSessionHub) return "Sessions";
    if (isInsideSession) return "Session Dashboard";
    return currentPath.charAt(0).toUpperCase() + currentPath.slice(1);
  };

  return (
    <header className="sticky top-0 z-50 h-16 w-full bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant/20 px-4 md:px-6 flex items-center justify-between font-sans">

      {/* Left: Breadcrumb Navigation */}
      <div className="flex items-center gap-3">
        {showSidebarButton && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden w-10 h-10 rounded-2xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-high transition-all"
            title="Toggle Sidebar"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>
        )}
        {isInsideSession ? (
          <Link href="/sessions" className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-high transition-all" title="Back to Sessions">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          </Link>
        ) : (
          <Link href="/" className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-high transition-all" title="Home">
            <span className="material-symbols-outlined text-[18px]">home</span>
          </Link>
        )}
        <h2 className="text-lg md:text-xl font-semibold text-on-surface tracking-tight truncate">
          <Link href="/sessions" className="hover:text-primary-fixed transition-colors">
            {renderBreadcrumb()}
          </Link>
        </h2>

        {currentSession && (
          <div className="hidden md:flex items-center gap-3 ml-2">
            <div className="h-4 w-px bg-outline-variant/30" />
            
            <div className="flex items-center gap-2 bg-surface-container-highest border border-outline-variant/30 rounded-full px-4 py-1.5 text-xs text-on-surface">
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">folder</span>
              <span className="font-medium text-on-surface">{currentSession.repositoryFullName}</span>
            </div>

            <div className="flex items-center gap-2 bg-surface-container-highest border border-outline-variant/30 rounded-full px-4 py-1.5 text-xs text-on-surface">
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant">call_split</span>
              <span className="font-medium text-on-surface">{currentSession.branch}</span>
            </div>
          </div>
        )}
      </div>

      {/* Right: Profile & Actions */}
      <div className="flex items-center gap-3 ml-auto">
        {!isAccountPage && (
          <div className="hidden lg:flex w-72 mr-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group flex flex-1 items-center bg-surface-container border border-outline-variant/30 hover:border-primary-fixed/50 rounded-2xl px-4 py-2 transition-all h-10 cursor-text shadow-sm"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-fixed mr-2.5 text-[18px] transition-colors">search</span>
              <span className="w-full text-left text-on-surface-variant/70 text-[11px] font-medium tracking-wide truncate transition-colors">
                {isSessionHub ? "Search sessions..." : "Search in session..."}
              </span>
              <kbd className="hidden sm:flex shrink-0 items-center gap-1 border border-outline-variant/30 rounded-lg bg-surface-container-highest px-2 py-0.5 text-[10px] font-mono text-on-surface-variant">
                <span>⌘</span>K
              </kbd>
            </button>

            <SessionSearchModal
              sessions={sessions}
              open={isSearchOpen}
              onOpenChange={setIsSearchOpen}
              placeholder={isSessionHub ? "Search sessions..." : "Search everything in session..."}
              showPages={!isSessionHub}
            />
          </div>
        )}

        <button className="hidden sm:flex w-10 h-10 rounded-2xl bg-surface-container items-center justify-center text-on-surface-variant hover:text-primary-fixed hover:bg-surface-container-high transition-all">
          <span className="material-symbols-outlined text-[18px]">notifications</span>
        </button>

        <div className="relative" ref={menuRef}>
          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="h-9 w-9 rounded-xl overflow-hidden border border-outline-variant/30 bg-primary-fixed flex items-center justify-center cursor-pointer hover:border-primary-fixed transition-all"
          >
            <img
              className="w-full h-full object-cover pointer-events-none"
              alt={currentUserData?.user?.username || "Profile"}
              src={currentUserData?.user?.avatarUrl || `https://github.com/identicons/${currentUserData?.user?.username || 'github'}.png`}
            />
          </div>

          {isProfileMenuOpen && (
            <div className="absolute right-0 top-12 w-52 bg-surface-container-lowest border border-outline-variant/30 rounded-2xl shadow-xl flex flex-col z-50 text-left overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-3.5 border-b border-outline-variant/20 bg-surface-container-lowest">
                <p className="text-[10px] text-on-surface-variant uppercase font-medium tracking-wider">Signed in as</p>
                <p className="font-medium text-xs text-on-surface truncate mt-0.5">
                  {currentUserData?.user?.email || currentUserData?.user?.username || "Guest"}
                </p>
              </div>
              <Link
                href="/account"
                onClick={() => setIsProfileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-container transition-colors text-on-surface text-xs font-medium group"
              >
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant group-hover:text-primary-fixed">person</span>
                Account
              </Link>
              <button
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  logout();
                }}
                disabled={isPending}
                className="flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 hover:text-rose-400 transition-colors text-rose-400 font-medium text-xs w-full text-left border-t border-outline-variant/20 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                {isPending ? "Logging out..." : "Logout"}
              </button>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
