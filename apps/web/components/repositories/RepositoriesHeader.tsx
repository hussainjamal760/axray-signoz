export function RepositoriesHeader() {
  return (
    <header className="flex justify-between items-center px-6 py-4 w-full h-16 bg-background border-b-[3px] border-outline-variant z-40 shrink-0">
      <div></div>
      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <input 
            className="bg-surface-container border-2 border-outline px-4 py-1.5 text-sm font-mono-label focus:outline-none focus:border-primary-fixed w-64 transition-all text-on-surface" 
            placeholder="Search components..." 
            type="text"
          />
          <span className="material-symbols-outlined absolute right-3 top-2 text-outline text-sm">search</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">notifications</button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-white transition-colors">help</button>
          <div className="h-8 w-8 border-2 border-outline-variant overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              alt="Profile" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD03TDPe4nCQtxWu9hvB_tCHTE3EUI3iAnl774S1Ve24-EWuPi21IO02GRQ2esVNyBysMTumHMCpBLa1ur1_BqfSQUDGVXFAnNWGSdyIDeiIMho6l2AeLZeoJM8-YYEjh9dQMiSRrlsLTTMpymf2qHTN2WytXn1UJb_QudXjUI-le4Dv4hIKcDGyyj0svcCt5L_F3NBb_5DmvgF86VgQ69N3Cq3AgILRsULJ9ccm1gayRJO2cQY9uZv9IUfl6SN3H1s2i2FJEnaakRP"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
