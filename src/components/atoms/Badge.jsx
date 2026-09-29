const tones = {
  neutral: 'bg-[var(--bg)] text-[var(--muted)]',
  success: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300',
  warn: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  accent: 'bg-[var(--accent)] text-[var(--accent-contrast)]',
}

export default function Badge({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${tones[tone]}`}>
      {children}
    </span>
  )
}
