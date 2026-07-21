"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

interface TopNavProps {
  onToggleSidebar: () => void;
  showSidebarButton?: boolean;
}

export function TopNav({ onToggleSidebar, showSidebarButton = true }: TopNavProps) {
  const pathname = usePathname();
  const currentPath = (pathname?.split('/')[1] || 'dashboard').replace(/-/g, ' ');

  const sessionMatch = pathname?.match(/^\/sessions\/([^/]+)/);
  const isInsideSession = !!sessionMatch || pathname?.startsWith('/sessions/new');
  const isSessionHub = pathname === "/sessions" || pathname === "/sessions/";

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: logout, isPending } = useLogout();
  const { data: currentUserData } = useCurrentUser();

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
    if (isSessionHub) {
      return (
        <span className="text-xl md:text-2xl font-black text-white uppercase">
          Sessions
        </span>
      );
    }

    if (isInsideSession) {
      return (
        <span className="text-xl md:text-2xl font-black text-white uppercase">
          Session Dashboard
        </span>
      );
    }

    return (
      <span className="text-xl md:text-2xl font-black text-white uppercase">
        {currentPath}
      </span>
    );
  };

  return (
    <header className="w-full h-16 shrink-0 border-b-[3px] border-primary-fixed bg-background flex justify-between items-center px-gutter z-50">
      <div className="flex items-center gap-4 md:gap-8 h-full">
        {showSidebarButton && (
          <button
            onClick={onToggleSidebar}
            className="lg:hidden material-symbols-outlined text-on-surface-variant hover:text-white cursor-pointer transition-colors p-2 rounded-none"
          >
            menu
          </button>
        )}

        {/* Dynamic Desktop Icon: Back to Sessions vs Home */}
        {isInsideSession ? (
          <Link
            href="/sessions"
            className="hidden lg:block material-symbols-outlined text-primary-fixed hover:text-white cursor-pointer transition-colors"
            title="Back to Sessions"
          >
            arrow_back
          </Link>
        ) : (
          <Link
            href="/"
            className="hidden lg:block material-symbols-outlined text-primary-fixed hover:text-white cursor-pointer transition-colors"
            title="Home"
          >
            home
          </Link>
        )}

        {renderBreadcrumb()}
      </div>
      <div className="flex items-center gap-4 md:gap-6 h-full">
        <div className="hidden lg:flex items-center bg-surface-container border-2 border-outline px-4 py-1.5 focus-within:border-primary-fixed transition-all">
          <span className="material-symbols-outlined text-on-surface-variant mr-2" style={{ fontSize: '18px' }}>search</span>
          <input className="bg-transparent border-none focus:outline-none text-mono-label font-mono-label w-48 xl:w-64 placeholder:text-on-surface-variant/50 text-white" placeholder="QUERY_LOGS_AND_METRICS..." type="text" />
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button className="hover:bg-surface-container-high p-2 transition-transform active:translate-x-1 active:translate-y-1 text-on-surface-variant hover:text-white rounded-none">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="hover:bg-surface-container-high p-2 transition-transform active:translate-x-1 active:translate-y-1 text-on-surface-variant hover:text-white rounded-none">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="relative" ref={menuRef}>
            <div
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="h-10 w-10 border-2 border-white bg-primary-fixed flex items-center justify-center brutalist-shadow ml-2 overflow-hidden cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              <img
                className="w-full h-full object-cover pointer-events-none"
                alt={currentUserData?.user?.username || "Profile"}
                src={currentUserData?.user?.avatarUrl || `https://github.com/identicons/${currentUserData?.user?.username || 'github'}.png`}
              />
            </div>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-14 w-48 bg-surface-container border-[3px] border-white brutalist-shadow flex flex-col z-50">
                <div className="p-3 border-b-[3px] border-outline-variant bg-surface-container-high">
                  <p className="font-mono-label text-[10px] text-on-surface-variant uppercase font-bold">Signed in as</p>
                  <p className="font-bold text-sm text-white truncate mt-0.5">
                    {currentUserData?.user?.email || currentUserData?.user?.username || "Guest"}
                  </p>
                </div>
                <Link 
                  href="/account"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-primary-fixed hover:text-background transition-colors text-white font-bold text-sm text-left w-full group"
                >
                  <span className="material-symbols-outlined text-[18px] group-hover:text-background text-on-surface-variant">person</span>
                  Account
                </Link>
                <button
                  onClick={() => {
                    setIsProfileMenuOpen(false);
                    logout();
                  }}
                  disabled={isPending}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-error hover:text-white transition-colors text-error font-bold text-sm text-left w-full group border-t-[3px] border-outline-variant disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  {isPending ? "Logging out..." : "Logout"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
