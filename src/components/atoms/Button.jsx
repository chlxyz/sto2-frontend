const tones = {
  primary: 'bg-[var(--accent)] text-[var(--accent-contrast)] hover:bg-[var(--accent-hover)]',
  ghost: 'bg-transparent text-[var(--text)] border border-[var(--border)] hover:bg-[var(--bg)]',
  danger: 'bg-transparent text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950',
}

export default function Button({ tone = 'primary', loading = false, className = '', ...props }) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-wide transition active:scale-[0.98] disabled:opacity-60 ${tones[tone]} ${className}`}
      {...props}
    >
      {loading ? 'Please wait…' : props.children}
    </button>
  )
}
