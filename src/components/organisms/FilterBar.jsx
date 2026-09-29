const SORTS = [
  { id: 'featured', label: 'Featured' },
  { id: 'newest', label: 'Newest' },
  { id: 'price-asc', label: 'Price · low to high' },
  { id: 'price-desc', label: 'Price · high to low' },
]

const LISTED = [
  { id: 'all', label: 'All' },
  { id: 'listed', label: 'Listed' },
  { id: 'unlisted', label: 'Unlisted' },
]

export default function FilterBar({ types, value, onChange, showSale = true, showListed = false }) {
  const toggleType = (t) => onChange({
    ...value,
    types: value.types.includes(t)
      ? value.types.filter((x) => x !== t)
      : [...value.types, t],
  })

  return (
    <div className="flex flex-col gap-4 border-y border-[var(--border)] py-4 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-wrap gap-2">
        {types.map(({ name, count }) => (
          <label
            key={name}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition ${
              value.types.includes(name)
                ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)]'
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={value.types.includes(name)}
              onChange={() => toggleType(name)}
            />
            {name}
            <span className="text-[11px] opacity-70 tabular-nums">{count}</span>
          </label>
        ))}
        {showSale && (
          <label
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3.5 py-1.5 text-[13px] transition ${
              value.onSale
                ? 'border-[var(--text)] bg-[var(--text)] text-[var(--bg)]'
                : 'border-[var(--border)] text-[var(--muted)] hover:border-[var(--text)] hover:text-[var(--text)]'
            }`}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={value.onSale}
              onChange={() => onChange({ ...value, onSale: !value.onSale })}
            />
            On sale
          </label>
        )}
      </div>
      <label className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
        Sort
        <select
          value={value.sort}
          onChange={(e) => onChange({ ...value, sort: e.target.value })}
          className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] text-[var(--text)] outline-none"
        >
          {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </select>
      </label>
      {showListed && (
        <label className="flex items-center gap-2 text-[13px] text-[var(--muted)]">
          Status
          <select
            value={value.listed ?? 'all'}
            onChange={(e) => onChange({ ...value, listed: e.target.value })}
            className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3.5 py-1.5 text-[13px] text-[var(--text)] outline-none"
          >
            {LISTED.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      )}
    </div>
  )
}
