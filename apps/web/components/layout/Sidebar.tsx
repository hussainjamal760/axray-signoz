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
      if (id !== "new") {
        setActiveSessionId(id);
        localStorage.setItem("lastActiveSessionId", id);
      }
    } else {
      const saved = localStorage.getItem("lastActiveSessionId");
      if (saved) {
        setActiveSessionId(saved);
      }
    }
  }, [pathname]);

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path;
    if (isActive) {
      return "flex items-center gap-3.5 px-3.5 py-3 bg-primary-fixed text-black rounded-2xl font-semibold text-sm transition-all shadow-sm whitespace-nowrap overflow-hidden";
    }
    return "flex items-center gap-3.5 px-3.5 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-2xl font-medium text-sm transition-all whitespace-nowrap overflow-hidden";
  };

  const agentLink = activeSessionId ? `/sessions/${activeSessionId}` : "/sessions";
  const observerLink = activeSessionId ? `/sessions/${activeSessionId}/observer` : "/sessions";
  const tracesLink = activeSessionId ? `/sessions/${activeSessionId}/traces` : "/sessions";
  const analyticsLink = activeSessionId ? `/sessions/${activeSessionId}/analytics` : "/sessions";
  const signozLink = activeSessionId ? `/sessions/${activeSessionId}/signoz` : "/sessions";

  return (
    <aside
      className={cn(
        "group h-full border-r border-outline-variant/20 bg-background transition-all duration-300 ease-in-out z-40 overflow-hidden shrink-0 font-sans",
        isOpen
          ? "w-64 absolute lg:relative translate-x-0 lg:w-[72px] lg:hover:w-64"
          : "w-64 absolute lg:relative -translate-x-full lg:translate-x-0 border-r-0 lg:border-r lg:w-[72px] lg:hover:w-64"
      )}
    >
      <div className="group/sidebar w-full h-full flex flex-col">
        <div className="px-3 pt-5 pb-2 shrink-0">
          <Link href="/" className="flex items-center gap-3 p-2 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 overflow-hidden shadow-sm hover:border-primary-fixed/50 transition-colors">
            <div className="w-8 h-8 shrink-0 rounded-xl flex items-center justify-center overflow-hidden bg-black/50 p-0.5">
              <img src="/logo/axray-logo.png" alt="AXRAY" className="w-full h-full object-contain" />
            </div>
            <div className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">
              <p className="text-[10px] font-medium text-on-surface-variant uppercase tracking-wider">Home</p>
              <p className="font-semibold text-sm text-on-surface">AXRAY <span className="text-[10px] text-on-surface-variant font-normal ml-1">v1.0.0</span></p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          <Link href={agentLink} className={getLinkClasses(agentLink)}>
            <span className="material-symbols-outlined text-[20px] shrink-0">smart_toy</span>
            <span className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">Agent</span>
          </Link>
          <Link href={observerLink} className={getLinkClasses(observerLink)}>
            <span className="material-symbols-outlined text-[20px] shrink-0">play_circle</span>
            <span className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">Observer</span>
          </Link>
          <Link href={tracesLink} className={getLinkClasses(tracesLink)}>
            <span className="material-symbols-outlined text-[20px] shrink-0">rebase_edit</span>
            <span className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">Traces</span>
          </Link>
          <Link href={analyticsLink} className={getLinkClasses(analyticsLink)}>
            <span className="material-symbols-outlined text-[20px] shrink-0">monitoring</span>
            <span className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">Analytics</span>
          </Link>
          <Link href={signozLink} className={getLinkClasses(signozLink)}>
            <span className="material-symbols-outlined text-[20px] shrink-0">dashboard_customize</span>
            <span className="whitespace-nowrap transition-opacity duration-200 lg:opacity-0 lg:group-hover:opacity-100">SigNoz Config</span>
          </Link>
        </nav>

        <div className="p-3 border-t border-outline-variant/20 shrink-0 flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2 overflow-hidden">
            <div className="w-2 h-2 rounded-full bg-primary-fixed shrink-0 animate-pulse ml-1"></div>
            <span className="text-[10px] font-semibold tracking-wider text-primary-fixed uppercase whitespace-nowrap lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">System Ready</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
