export function CodeViewerPanel() {
  return (
    <div className="flex-1 flex flex-col border-r-[3px] border-primary-fixed bg-surface-container-lowest overflow-hidden">
      <div className="flex bg-surface-container-high border-b-2 border-outline-variant shrink-0 overflow-x-auto custom-scrollbar">
        <button className="px-6 py-3 font-mono-label text-mono-label text-on-surface-variant hover:text-primary-fixed border-r-2 border-outline-variant shrink-0">BEFORE</button>
        <button className="px-6 py-3 font-mono-label text-mono-label text-on-surface-variant hover:text-primary-fixed border-r-2 border-outline-variant shrink-0">AFTER</button>
        <button className="px-6 py-3 font-mono-label text-mono-label font-black text-on-primary-fixed bg-primary-fixed shrink-0">DIFF</button>
        <div className="flex-1 flex justify-end items-center px-4 font-mono-label text-mono-label text-on-surface-variant min-w-[150px]">src/auth.js</div>
      </div>
      
      <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono-label text-mono-label leading-relaxed custom-scrollbar">
        <div className="flex gap-4 mb-1">
          <span className="w-8 text-right opacity-30 select-none">10</span>
          <span className="text-on-surface whitespace-pre-wrap break-all">export const authMiddleware = (req, res, next) =&gt; {'{'}</span>
        </div>
        <div className="flex gap-4 mb-1">
          <span className="w-8 text-right opacity-30 select-none">11</span>
          <span className="text-on-surface whitespace-pre-wrap break-all">  const user = req.context.user;</span>
        </div>
        <div className="flex gap-4 mb-1 bg-error-container/20 border-l-4 border-error py-0.5">
          <span className="w-8 text-right text-error/50 select-none">12</span>
          <span className="text-error font-bold whitespace-pre-wrap break-all">- if (!user) return res.status(401).send();</span>
        </div>
        <div className="flex gap-4 mb-1 bg-primary-container/10 border-l-4 border-primary-fixed py-0.5">
          <span className="w-8 text-right text-primary-fixed/50 select-none">12</span>
          <span className="text-primary-fixed font-bold whitespace-pre-wrap break-all">+ if (!user || !user.isValid) {'{'}</span>
        </div>
        <div className="flex gap-4 mb-1 bg-primary-container/10 border-l-4 border-primary-fixed py-0.5">
          <span className="w-8 text-right text-primary-fixed/50 select-none">13</span>
          <span className="text-primary-fixed font-bold whitespace-pre-wrap break-all">+   logger.warn(`Auth failed: ${'{user ? \'Invalid\' : \'Missing\'}'}`);</span>
        </div>
        <div className="flex gap-4 mb-1 bg-primary-container/10 border-l-4 border-primary-fixed py-0.5">
          <span className="w-8 text-right text-primary-fixed/50 select-none">14</span>
          <span className="text-primary-fixed font-bold whitespace-pre-wrap break-all">+   return res.status(401).json({'{'} error: "UNAUTHORIZED" {'}'});</span>
        </div>
        <div className="flex gap-4 mb-1 bg-primary-container/10 border-l-4 border-primary-fixed py-0.5">
          <span className="w-8 text-right text-primary-fixed/50 select-none">15</span>
          <span className="text-primary-fixed font-bold whitespace-pre-wrap break-all">+ {'}'}</span>
        </div>
        <div className="flex gap-4 mb-1">
          <span className="w-8 text-right opacity-30 select-none">16</span>
          <span className="text-on-surface whitespace-pre-wrap break-all">  next();</span>
        </div>
        <div className="flex gap-4 mb-1">
          <span className="w-8 text-right opacity-30 select-none">17</span>
          <span className="text-on-surface whitespace-pre-wrap break-all">{'}'}</span>
        </div>
      </div>
    </div>
  );
}
