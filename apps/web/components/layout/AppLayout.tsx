"use client";

import { useState } from "react";
import { TopNav } from "./TopNav";
import { Sidebar } from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
  showSidebar?: boolean;
}

export function AppLayout({ children, showSidebar = true }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  return (
    <div className="h-screen w-full flex flex-col bg-background text-on-background font-geist overflow-hidden">
      <TopNav showSidebarButton={showSidebar} onToggleSidebar={toggleSidebar} />
      
      <div className="flex flex-1 overflow-hidden relative">
        {showSidebar && <Sidebar isOpen={isSidebarOpen} />}
        
        {/* Overlay for mobile when sidebar is open */}
        {showSidebar && isSidebarOpen && (
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        <main className="flex-1 flex flex-col overflow-hidden relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}
