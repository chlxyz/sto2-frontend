const tones = {
  error: 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300',
  success: 'border-green-300 bg-green-50 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300',
  info: 'border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]',
}

export default function Alert({ tone = 'error', children }) {
  if (!children) return null
  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${tones[tone]}`}>
      {children}
    </div>
  )
}
