export default function EmptyState({ title, hint, action }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-8 py-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {hint && <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
