export default function AdminTable({ head, children }) {
  return (
    <div className="overflow-x-auto rounded-[4px] border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wide text-[var(--muted)]">
            {head.map((h) => <th key={h} className="px-5 py-3 font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">{children}</tbody>
      </table>
    </div>
  )
}
