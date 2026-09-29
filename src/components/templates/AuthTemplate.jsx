import ThemeToggle from '../atoms/ThemeToggle.jsx'

export default function AuthTemplate({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--bg)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <span className="font-display text-[17px] font-bold tracking-[0.08em]">STO2</span>
        <ThemeToggle />
      </div>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
