"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const pathname = usePathname();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    const sessionMatch = pathname?.match(/^\/sessions\/([^/]+)/);
    if (sessionMatch) {
      const id = sessionMatch[1];
      setActiveSessionId(id);
      localStorage.setItem("lastActiveSessionId", id);
    } else {
      const saved = localStorage.getItem("lastActiveSessionId");
      if (saved) {
        setActiveSessionId(saved);
      }
    }
  }, [pathname]);

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (path.startsWith('/sessions/') && pathname?.startsWith('/sessions/'));
    if (isActive) {
      return "flex items-center gap-4 px-4 py-3 bg-primary-fixed text-on-primary-fixed font-black uppercase border-2 border-background brutalist-shadow-sm whitespace-nowrap overflow-hidden";
    }
    return "flex items-center gap-4 px-4 py-3 text-on-surface hover:bg-surface-container border border-transparent font-bold uppercase transition-colors whitespace-nowrap overflow-hidden";
  };

  const agentLink = activeSessionId ? `/sessions/${activeSessionId}` : "/dashboard";

  return (
    <aside
      className={cn(
        "group h-full border-r-[3px] border-primary-fixed bg-background transition-all duration-300 ease-in-out z-40 overflow-hidden shrink-0",
        isOpen 
          ? "w-64 absolute lg:relative translate-x-0 lg:w-[72px] lg:hover:w-64" 
          : "w-64 absolute lg:relative -translate-x-full lg:translate-x-0 border-r-0 lg:border-r-[3px] lg:w-[72px] lg:hover:w-64"
      )}
    >
      <div className="group/sidebar w-64 h-full flex flex-col">
        <div className="px-4 pt-6 pb-2 shrink-0">
          <div className="flex items-center gap-3 p-2 border-2 border-outline-variant bg-surface-container-high overflow-hidden">
            <div className="w-8 h-8 shrink-0 bg-primary-fixed flex items-center justify-center">
              <span className="material-symbols-outlined text-background text-sm">terminal</span>
            </div>
            <div className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">
              <p className="font-mono-label text-[10px] leading-tight text-on-surface-variant uppercase">Core Engine</p>
              <p className="font-bold text-sm text-white">AXRAY <span className="text-[10px] opacity-50 ml-1">v1.0.0</span></p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
          <Link href={agentLink} className={getLinkClasses(agentLink)}>
            <span className="material-symbols-outlined">smart_toy</span>
            Agent
          </Link>
          <Link href="/observer" className={getLinkClasses("/observer")}>
            <span className="material-symbols-outlined">play_circle</span>
            Observer
          </Link>
          <Link href="/traces" className={getLinkClasses("/traces")}>
            <span className="material-symbols-outlined">rebase_edit</span>
            Traces
          </Link>
          <Link href="/analytics" className={getLinkClasses("/analytics")}>
            <span className="material-symbols-outlined">monitoring</span>
            Analytics
          </Link>

          <div className="h-px bg-outline-variant my-6"></div>

          <Link href="#" className={getLinkClasses("/settings")}>
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
        </nav>

        <div className="p-4 border-t-[3px] border-outline-variant bg-surface shrink-0 flex flex-col gap-4">
          <button className="w-full bg-primary-fixed border-2 border-background py-3 font-black text-background uppercase tracking-widest text-xs brutalist-shadow-sm hover:-translate-y-0.5 hover:-translate-x-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none transition-all flex items-center justify-start px-2 gap-3 overflow-hidden">
            <span className="material-symbols-outlined shrink-0 text-sm ml-1">rocket_launch</span>
            <span className="whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">Deploy Agent</span>
          </button>
          
          <div className="flex items-center gap-3 px-2 overflow-hidden">
            <div className="w-3 h-3 bg-primary-fixed shrink-0 animate-pulse ml-1.5"></div>
            <span className="font-mono-label text-[10px] font-bold uppercase tracking-widest text-primary-fixed whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">SYSTEM_READY</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
