export function TerminalPanel() {
  return (
    <div className="col-span-12 md:col-span-7 bg-background border-[3px] border-outline flex flex-col h-[450px] brutalist-shadow">
      <div className="p-4 border-b-2 border-outline flex items-center justify-between bg-surface shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-error border border-background"></div>
            <div className="w-3 h-3 bg-primary-fixed border border-background"></div>
            <div className="w-3 h-3 bg-outline border border-background"></div>
          </div>
          <span className="font-mono-label text-xs font-black uppercase text-outline">Terminal: npm_test_auth</span>
        </div>
        <span className="font-mono-label text-[10px] font-bold text-primary-fixed">LATENCY: 120MS</span>
      </div>
      
      <div className="flex-1 p-6 font-mono-label text-sm overflow-y-auto space-y-3 custom-scrollbar">
        <div className="text-outline-variant"># C:\Workspace\core-engine&gt; npm run test:auth</div>
        <div className="text-on-surface">Starting Jest in watch mode...</div>
        
        <div className="flex gap-4">
          <span className="bg-primary-fixed text-background px-1 font-black">PASS</span>
          <span className="text-on-surface">src/auth/__tests__/login.test.js</span>
        </div>
        
        <div className="flex gap-4">
          <span className="bg-error text-on-error px-1 font-black">FAIL</span>
          <span className="text-on-surface">src/auth/__tests__/session.test.js</span>
        </div>
        
        <div className="text-error mt-4 font-black">FAIL: Session Management › should invalidate stale tokens</div>
        
        <div className="bg-error-container/20 border-l-4 border-error p-4 text-xs font-mono-label">
          EXPECTED: 401<br/>
          RECEIVED: 200
        </div>
        
        <div className="text-primary-fixed mt-6 font-bold uppercase italic">
          Agent identified failure. patching source in turn #5...
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-primary-fixed font-black">&gt;</span>
          {/* Using a simple CSS block for cursor blink to avoid complex states for now */}
          <span className="inline-block w-2 h-4 bg-primary-fixed animate-pulse"></span>
        </div>
      </div>
    </div>
  );
}
