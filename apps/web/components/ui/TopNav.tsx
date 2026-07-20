"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopNavProps {
  onToggleSidebar: () => void;
}

export function TopNav({ onToggleSidebar }: TopNavProps) {
  const pathname = usePathname();
  const currentPath = (pathname?.split('/')[1] || 'dashboard').replace(/-/g, ' ');

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full h-16 shrink-0 border-b-[3px] border-primary-fixed bg-background flex justify-between items-center px-gutter z-50">
      <div className="flex items-center gap-4 md:gap-8 h-full">

        {/* Desktop home button */}
        <Link
          href="/"
          className="hidden lg:block material-symbols-outlined text-primary-fixed hover:text-white cursor-pointer transition-colors"
        >
          home
        </Link>
        <div className="flex items-center gap-2 font-headline-lg tracking-tighter">
          <span className="text-xl md:text-2xl font-black text-on-surface-variant uppercase hidden md:inline">Workspace</span>
          <span className="material-symbols-outlined text-xl md:text-2xl text-on-surface-variant hidden md:inline">chevron_right</span>
          <span className="text-xl md:text-2xl font-black text-primary-fixed uppercase">{currentPath}</span>
        </div>
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
                alt="Profile"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD03TDPe4nCQtxWu9hvB_tCHTE3EUI3iAnl774S1Ve24-EWuPi21IO02GRQ2esVNyBysMTumHMCpBLa1ur1_BqfSQUDGVXFAnNWGSdyIDeiIMho6l2AeLZeoJM8-YYEjh9dQMiSRrlsLTTMpymf2qHTN2WytXn1UJb_QudXjUI-le4Dv4hIKcDGyyj0svcCt5L_F3NBb_5DmvgF86VgQ69N3Cq3AgILRsULJ9ccm1gayRJO2cQY9uZv9IUfl6SN3H1s2i2FJEnaakRP"
              />
            </div>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-14 w-48 bg-surface-container border-[3px] border-white brutalist-shadow flex flex-col z-50">
                <div className="p-3 border-b-[3px] border-outline-variant bg-surface-container-high">
                  <p className="font-mono-label text-[10px] text-on-surface-variant uppercase font-bold">Signed in as</p>
                  <p className="font-bold text-sm text-white truncate mt-0.5">admin@axray.dev</p>
                </div>
                <button className="flex items-center gap-3 px-4 py-3 hover:bg-primary-fixed hover:text-background transition-colors text-white font-bold text-sm text-left w-full group">
                  <span className="material-symbols-outlined text-[18px] group-hover:text-background text-on-surface-variant">person</span>
                  Account
                </button>
                <button className="flex items-center gap-3 px-4 py-3 hover:bg-error hover:text-white transition-colors text-error font-bold text-sm text-left w-full group border-t-[3px] border-outline-variant">
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
