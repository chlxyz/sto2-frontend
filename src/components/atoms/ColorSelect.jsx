// Explicit color control for the cart line. Shows the chosen swatch beside the
// name so it is obvious which variant is on the line: the product page swatches
// toggle off when re-clicked, which is easy to do by accident, and the cart is
// the place that should be unambiguous.
export default function ColorSelect({ colors, value, onChange, label }) {
  const current = colors.find((c) => c.id === value)

  return (
    <label className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
      Color
      {current && (
        <span
          aria-hidden
          className="inline-block h-3 w-3 shrink-0 rounded-full border border-[var(--border)]"
          style={{ background: current.hex || 'var(--muted)' }}
        />
      )}
      <select
        aria-label={label}
        className="rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-medium text-[var(--text)]"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      >
        <option value="">No color</option>
        {colors.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
    </label>
  )
}