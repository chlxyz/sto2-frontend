import { useEffect, useMemo, useState } from 'react'
import api from '../../lib/api.js'

export default function TypePicker({ value, onChange }) {
  const [all, setAll] = useState([])
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    api.get('/types').then(({ data }) => setAll(data)).catch(() => {})
  }, [])

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase()
    return all.filter((t) => t.toLowerCase().includes(q) && !value.includes(t)).slice(0, 6)
  }, [all, query, value])

  const add = (name) => {
    const clean = name.trim()
    if (clean && !value.includes(clean)) onChange([...value, clean])
    setQuery('')
    setOpen(false)
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium">Types</label>
      <div className="flex flex-wrap gap-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg)] py-1 pl-3 pr-1.5 text-[13px]">
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => onChange(value.filter((x) => x !== t))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="relative mt-2">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder="Search types, e.g. t-shirt…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        {open && query.trim() && (
          <ul className="absolute inset-x-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow)]">
            {matches.map((m) => (
              <li key={m}>
                <button
                  type="button"
                  onMouseDown={() => add(m)}
                  className="block w-full px-3.5 py-2 text-left text-sm transition hover:bg-[var(--bg)]"
                >
                  {m}
                </button>
              </li>
            ))}
            {!matches.some((m) => m.toLowerCase() === query.trim().toLowerCase()) && (
              <li>
                <button
                  type="button"
                  onMouseDown={() => add(query)}
                  className="block w-full px-3.5 py-2 text-left text-sm font-medium text-[var(--accent)] transition hover:bg-[var(--bg)]"
                >
                  + Create “{query.trim()}”
                </button>
              </li>
            )}
          </ul>
        )}
      </div>
    </div>
  )
}
