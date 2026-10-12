// Anchored nudge bubble for the Add to cart button. role="status" so screen
// readers announce it without stealing focus. No popover library needed.
export default function HintPopover({ show, tone = 'hint', children }) {
  if (!show) return null

  const tones = {
    hint: 'border-[var(--border)] bg-[var(--surface)] text-[var(--text)]',
    warn: 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300',
  }

  return (
    <span
      role="status"
      className={`pointer-events-none absolute -top-2 right-0 z-10 -translate-y-full whitespace-nowrap rounded-[4px] border px-3 py-2 text-xs font-medium shadow-lg ${tones[tone]}`}
    >
      {children}
    </span>
  )
}