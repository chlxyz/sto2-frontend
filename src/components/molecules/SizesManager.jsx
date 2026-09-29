import { useEffect, useState } from 'react'
import api from '../../lib/api.js'

export default function SizesManager({ sizes, onChange }) {
  const [label, setLabel] = useState('')
  const [stock, setStock] = useState('')
  const [picked, setPicked] = useState('')
  const [options, setOptions] = useState([])

  useEffect(() => {
    api.get('/sizes').then(({ data }) => setOptions(data)).catch(() => {})
  }, [])

  const add = () => {
    const clean = (label.trim() || picked).trim()
    if (!clean || sizes.some((s) => s.label.toLowerCase() === clean.toLowerCase())) return
    onChange([...sizes, { label: clean, stock: Math.max(0, parseInt(stock, 10) || 0) }])
    setLabel('')
    setStock('')
    setPicked('')
  }

  const setRow = (i, patch) => onChange(sizes.map((s, x) => (x === i ? { ...s, ...patch } : s)))

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium">Sizes & stock</label>
      {sizes.length > 0 && (
        <div className="mb-2 space-y-1.5">
          {sizes.map((s, i) => (
            <div key={s.id ?? s.label} className="flex items-center gap-2">
              <span className="min-w-16 rounded-full border border-[var(--border)] bg-[var(--bg)] px-3 py-1.5 text-center text-[13px] font-semibold">{s.label}</span>
              <input
                type="number"
                min="0"
                step="1"
                value={s.stock}
                onChange={(e) => setRow(i, { stock: Math.max(0, parseInt(e.target.value, 10) || 0) })}
                aria-label={`Stock for ${s.label}`}
                className="w-24 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
              />
              <button
                type="button"
                aria-label={`Remove size ${s.label}`}
                onClick={() => onChange(sizes.filter((_, x) => x !== i))}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2">
        <select
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          aria-label="Existing sizes"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none"
        >
          <option value="">Select size…</option>
          {options.filter((o) => !sizes.some((s) => s.label.toLowerCase() === o.toLowerCase())).map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="or custom…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <input
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="Stock"
          type="number"
          min="0"
          className="w-24 shrink-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-full border border-[var(--border)] px-4 text-sm font-medium transition hover:bg-[var(--bg)]"
        >
          Add
        </button>
      </div>
      <p className="mt-1 text-xs text-[var(--muted)]">Empty = one-size product using the Stock field.</p>
    </div>
  )
}
