export default function QuantityStepper({ value, onChange, small = false, max = Infinity }) {
  const step = (d) => onChange(Math.min(max, Math.max(1, value + d)))
  const pad = small ? 'h-7 w-7 text-sm' : 'h-9 w-9 text-base'
  const atMax = value >= max
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] p-1">
      <button type="button" aria-label="Decrease quantity" onClick={() => step(-1)} className={`${pad} rounded-full text-[var(--muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)]`}>−</button>
      <span className={`${small ? 'w-6' : 'w-8'} text-center text-sm font-semibold tabular-nums`}>{value}</span>
      <button type="button" aria-label="Increase quantity" disabled={atMax} onClick={() => step(1)} className={`${pad} rounded-full text-[var(--muted)] transition hover:bg-[var(--bg)] hover:text-[var(--text)] disabled:opacity-30`}>+</button>
    </div>
  )
}
