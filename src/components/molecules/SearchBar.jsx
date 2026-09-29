export default function SearchBar({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      <span aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--muted)]">⌕</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search products…"
        className="w-full border-0 border-b border-[var(--border)] bg-transparent py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
      />
    </div>
  )
}
