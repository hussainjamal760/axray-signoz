export function TraceSpanDetails() {
  return (
    <aside 
      className="w-full md:w-[450px] bg-surface-container border-t-[3px] md:border-t-0 md:border-l-[3px] border-primary-fixed overflow-y-auto p-8 shrink-0 custom-scrollbar"
      data-lenis-prevent="true"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary-fixed text-on-primary-fixed font-mono-label text-[10px] px-2 py-0.5 font-bold uppercase tracking-widest">
            Selected Span
          </span>
        </div>
        <h2 className="text-2xl font-black text-white uppercase break-all">tool.write_file</h2>
        <div className="h-1 w-24 bg-primary-fixed mt-2"></div>
      </div>

      <div className="grid grid-cols-2 gap-px bg-primary-fixed border-2 border-primary-fixed mb-8">
        <div className="bg-surface-container-low p-4">
          <span className="block font-mono-label text-[10px] text-on-surface-variant uppercase mb-1">Status</span>
          <span className="font-mono-label text-green-400 font-bold">SUCCESS</span>
        </div>
        <div className="bg-surface-container-low p-4">
          <span className="block font-mono-label text-[10px] text-on-surface-variant uppercase mb-1">Duration</span>
          <span className="font-mono-label text-white font-bold">1.8s</span>
        </div>
        <div className="bg-surface-container-low p-4">
          <span className="block font-mono-label text-[10px] text-on-surface-variant uppercase mb-1">Input Tokens</span>
          <span className="font-mono-label text-white font-bold">4,102</span>
        </div>
        <div className="bg-surface-container-low p-4">
          <span className="block font-mono-label text-[10px] text-on-surface-variant uppercase mb-1">Output Tokens</span>
          <span className="font-mono-label text-white font-bold">188</span>
        </div>
      </div>

      <section className="mb-8">
        <h3 className="font-mono-label text-primary-fixed uppercase font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">table_rows</span>
          Attributes
        </h3>
        <div className="border-2 border-outline-variant">
          <table className="w-full text-left font-mono-label text-sm">
            <thead className="bg-surface-container-high border-b-2 border-outline-variant">
              <tr>
                <th className="p-3 text-[10px] uppercase text-on-surface-variant">Key</th>
                <th className="p-3 text-[10px] uppercase text-on-surface-variant">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-outline-variant">
              <tr>
                <td className="p-3 text-on-surface-variant">repository</td>
                <td className="p-3 text-white">auth-test</td>
              </tr>
              <tr>
                <td className="p-3 text-on-surface-variant">agent</td>
                <td className="p-3 text-white">gemini-1.5-pro</td>
              </tr>
              <tr>
                <td className="p-3 text-on-surface-variant">file</td>
                <td className="p-3 text-primary-fixed">/src/auth.js</td>
              </tr>
              <tr>
                <td className="p-3 text-on-surface-variant">operation</td>
                <td className="p-3 text-white">overwrite</td>
              </tr>
              <tr>
                <td className="p-3 text-on-surface-variant">user_id</td>
                <td className="p-3 text-white">usr_99x</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-mono-label text-primary-fixed uppercase font-bold mb-4 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">code</span>
          Input Payload
        </h3>
        <div className="bg-background p-4 border-2 border-primary-fixed overflow-x-auto custom-scrollbar">
          <pre className="font-mono-label text-[11px] text-green-300">
{`{
  "filename": "auth.js",
  "content": "export const validate = (token) => { ... }",
  "encoding": "utf-8",
  "mode": "0o644"
}`}
          </pre>
        </div>
        <button className="w-full mt-4 bg-transparent border-2 border-primary-fixed text-primary-fixed font-black py-3 hover:bg-primary-fixed hover:text-on-primary-fixed transition-all uppercase tracking-widest neo-shadow-primary hover:shadow-none hover:translate-x-1 hover:translate-y-1">
          Open in Editor
        </button>
      </section>
    </aside>
  );
}
