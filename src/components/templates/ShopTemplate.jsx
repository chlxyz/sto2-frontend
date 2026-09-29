import ShopHeader from '../organisms/ShopHeader.jsx'

export default function ShopTemplate({ children }) {
  return (
    <div className="flex min-h-svh flex-col bg-[var(--bg)] text-[var(--text)]">
      <ShopHeader />
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-6 py-8">{children}</main>
      <footer className="mx-auto w-full max-w-7xl px-6 pb-10 pt-6">
        <p className="eyebrow border-t border-[var(--border)] pt-6 text-center">STO2 — Essentials, edited</p>
      </footer>
    </div>
  )
}
