import Link from "next/link";

export function SessionHistory() {
  return (
    <section className="col-span-12 bg-surface border-[3px] border-outline brutalist-shadow">
      <div className="p-6 border-b-2 border-outline bg-background">
        <h3 className="text-xl font-black uppercase italic text-on-surface">Session History</h3>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse font-mono-label text-xs">
          <thead>
            <tr className="bg-surface-container border-b-2 border-outline">
              <th className="px-8 py-4 font-black uppercase text-primary-fixed">ID</th>
              <th className="px-8 py-4 font-black uppercase text-primary-fixed">Repo</th>
              <th className="px-8 py-4 font-black uppercase text-primary-fixed">Status</th>
              <th className="px-8 py-4 font-black uppercase text-primary-fixed">Time</th>
              <th className="px-8 py-4 font-black uppercase text-primary-fixed">Cost</th>
              <th className="px-8 py-4 font-black uppercase text-primary-fixed">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-outline-variant">
            <tr className="hover:bg-background group transition-colors">
              <td className="px-8 py-5 font-black text-on-surface">#1023</td>
              <td className="px-8 py-5 text-on-surface-variant">core-engine/main</td>
              <td className="px-8 py-5">
                <span className="text-primary-fixed font-black uppercase underline">Success</span>
              </td>
              <td className="px-8 py-5 text-on-surface-variant">04:23</td>
              <td className="px-8 py-5 text-on-surface-variant">$0.12</td>
              <td className="px-8 py-5">
                <button className="bg-outline text-background font-black uppercase px-3 py-1 hover:bg-primary-fixed transition-colors">Inspect</button>
              </td>
            </tr>
            <tr className="hover:bg-background group transition-colors">
              <td className="px-8 py-5 font-black text-on-surface">#1022</td>
              <td className="px-8 py-5 text-on-surface-variant">dashboard-ui/feat-v2</td>
              <td className="px-8 py-5">
                <span className="text-error font-black uppercase underline">Failed</span>
              </td>
              <td className="px-8 py-5 text-on-surface-variant">01:12</td>
              <td className="px-8 py-5 text-on-surface-variant">$0.04</td>
              <td className="px-8 py-5">
                <Link href="/analysis" className="bg-outline text-background font-black uppercase px-3 py-1 hover:bg-primary-fixed transition-colors inline-block">Debug</Link>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
