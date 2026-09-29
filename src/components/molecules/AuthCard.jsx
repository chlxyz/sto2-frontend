export default function AuthCard({ title, subtitle, children }) {
  return (
    <div className="w-full max-w-sm rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-8 sm:p-10">
      <p className="eyebrow">STO2</p>
      <h1 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em]">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>}
      <div className="mt-6">{children}</div>
    </div>
  )
}
