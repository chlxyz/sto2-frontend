// Rounded size pills: greyed when gone, red when almost gone, stock count under each.
export default function SizePicker({ sizes, value, onChange, compact = false }) {
  if (!sizes?.length) return null

  return (
    <div className={compact ? 'mt-2.5' : 'mt-7'}>
      {!compact && <p className="eyebrow">Size{value ? ` — ${sizes.find((s) => s.id === value)?.label ?? ''}` : ''}</p>}
      <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2.5 mt-3'}`}>
        {sizes.map((s) => {
          const gone = s.stock <= 0
          const low = !gone && s.stock <= 3
          const active = value === s.id
          return (
            <span key={s.id} className="flex flex-col items-center gap-1">
              <button
                type="button"
                disabled={gone}
                title={s.label}
                aria-label={`Size ${s.label}${gone ? ' (out of stock)' : ` (${s.stock} left)`}`}
                aria-pressed={active}
                onClick={() => onChange(active ? null : s.id)}
                className={`${compact ? 'min-w-10 px-2 py-1 text-xs' : 'min-w-12 px-3.5 py-2.5 text-sm'} rounded-full border font-semibold transition ${
                  active
                    ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                    : gone
                      ? 'cursor-not-allowed border-[var(--border)] text-[var(--muted)] opacity-40'
                      : low
                        ? 'border-red-400 text-red-600 hover:border-red-600 dark:border-red-800 dark:text-red-400'
                        : 'border-[var(--border)] hover:border-[var(--text)]'
                }`}
              >
                {s.label}
              </button>
              <span className={`text-[11px] tabular-nums ${gone ? 'text-[var(--muted)]' : low ? 'font-semibold text-red-600 dark:text-red-400' : 'text-[var(--muted)]'}`}>
                {gone ? '0' : s.stock}
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
