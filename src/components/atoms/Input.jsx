export default function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm text-[var(--text)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] ${className}`}
      {...props}
    />
  )
}
