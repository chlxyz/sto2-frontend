import { useState } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme ?? 'light')
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    localStorage.setItem('sto2-theme', next)
    setTheme(next)
  }
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-base transition hover:bg-[var(--bg)]"
    >
      {theme === 'dark' ? '☀' : '☾'}
    </button>
  )
}
