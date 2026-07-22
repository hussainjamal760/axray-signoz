"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";
import { useSessions } from "@/features/sessions/hooks/useSessions";
import { SessionSearchModal } from "@/features/sessions/components/SessionSearchModal";

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { mutate: logout, isPending } = useLogout();
  const { data: currentUserData } = useCurrentUser();
  const { data: sessions = [] } = useSessions();

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
    if (isSessionHub) return "SESSIONS";
    if (isInsideSession) return "SESSION DASHBOARD";
    return currentPath.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 h-16 flex w-full pointer-events-none">
      
      {/* Left Side Bar - Flexible width */}
      <div className="flex-1 max-w-[20px] md:max-w-[60px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto">
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary-fixed" />
      </div>

      {/* Responsive Notch Container */}
      <div className="flex h-16 relative z-10 shrink-0 flex-1 pointer-events-auto">
        
        {/* Left Curve */}
        <div className="w-[30px] h-full relative shrink-0">
          <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V64 C15 64 15 40 0 40 Z')" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
            <path d="M0 38.5 C15 38.5 15 62.5 30 62.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
          </svg>
        </div>

        {/* Center Content Area */}
        <div className="flex-1 h-full relative min-w-0 bg-background border-b-[3px] border-primary-fixed flex items-end justify-between pb-2.5 px-2 md:px-6">
          
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-3 shrink-0">
            {isInsideSession ? (
              <Link href="/sessions" className="material-symbols-outlined text-primary-fixed hover:text-white transition-colors" title="Back to Sessions">
                arrow_back
              </Link>
            ) : (
              <Link href="/" className="material-symbols-outlined text-primary-fixed hover:text-white transition-colors" title="Home">
                home
              </Link>
            )}
            <span className="text-xl md:text-2xl font-black text-white truncate uppercase tracking-tighter">
              {renderBreadcrumb()}
            </span>
          </div>

          {/* Center: Search */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group flex flex-1 items-center bg-surface-container-high border-[3px] border-outline-variant hover:border-primary-fixed px-3 py-1.5 transition-all h-10 cursor-text shadow-none hover:shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary-fixed mr-2 text-[20px] transition-colors group-hover:rotate-12">search</span>
              <span className="font-mono-label w-full text-left text-on-surface-variant/60 group-hover:text-primary-fixed/90 text-[10px] uppercase font-black tracking-widest truncate transition-colors">
                {isSessionHub ? "Search sessions..." : "Change session or search everything in session"}
              </span>
              <kbd className="hidden sm:flex shrink-0 items-center gap-1 border-2 border-outline-variant group-hover:border-primary-fixed bg-surface-container group-hover:bg-primary-fixed/10 px-2 py-0.5 text-[10px] font-black text-on-surface-variant group-hover:text-primary-fixed transition-colors">
                <span>⌘</span>K
              </kbd>
            </button>
            
            <SessionSearchModal
              sessions={sessions}
              open={isSearchOpen}
              onOpenChange={setIsSearchOpen}
              placeholder={isSessionHub ? "Search sessions..." : "Change session or search everything in session..."}
              showPages={!isSessionHub}
            />
          </div>

          {/* Right: Profile & Actions */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <button className="hidden sm:block hover:bg-surface-container-high p-1.5 text-on-surface-variant hover:text-primary-fixed transition-all">
              <span className="material-symbols-outlined text-[20px]">notifications</span>
            </button>
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-8 w-8 md:h-9 md:w-9 border-[3px] border-white bg-primary-fixed flex items-center justify-center shadow-[3px_3px_0px_0px_#000] cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all ml-1"
              >
                <img
                  className="w-full h-full object-cover pointer-events-none"
                  alt={currentUserData?.user?.username || "Profile"}
                  src={currentUserData?.user?.avatarUrl || `https://github.com/identicons/${currentUserData?.user?.username || 'github'}.png`}
                />
              </div>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-12 md:top-14 w-48 bg-surface-container border-[3px] border-white shadow-[4px_4px_0px_0px_#000] flex flex-col z-50 text-left">
                  <div className="p-3 border-b-[3px] border-outline-variant bg-surface-container-high">
                    <p className="font-mono-label text-[10px] text-on-surface-variant uppercase font-bold">Signed in as</p>
                    <p className="font-bold text-sm text-white truncate mt-0.5">
                      {currentUserData?.user?.email || currentUserData?.user?.username || "Guest"}
                    </p>
                  </div>
                  <Link
                    href="/account"
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-primary-fixed hover:text-black transition-colors text-white font-bold text-sm group"
                  >
                    <span className="material-symbols-outlined text-[18px] group-hover:text-black text-on-surface-variant">person</span>
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    disabled={isPending}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-error hover:text-black transition-colors text-error font-bold text-sm w-full group border-t-[3px] border-outline-variant disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    {isPending ? "Logging out..." : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Curve */}
        <div className="w-[30px] h-full relative shrink-0">
          <div className="absolute inset-0 bg-background" style={{ clipPath: "path('M0 0 H30 V40 C15 40 15 64 0 64 Z')" }} />
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 30 64">
            <path d="M0 62.5 C15 62.5 15 38.5 30 38.5" fill="none" className="stroke-primary-fixed" strokeWidth="3" />
          </svg>
        </div>

      </div>

      {/* Right Side Bar - Empty space */}
      <div className="flex-1 max-w-[20px] md:max-w-[60px] h-10 bg-background z-20 relative min-w-0 pointer-events-auto">
        <div className="absolute inset-x-0 bottom-0 h-[3px] bg-primary-fixed" />
      </div>

    </header>
  );
}
