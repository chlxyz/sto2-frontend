import Button from '../atoms/Button.jsx'
import Price from '../atoms/Price.jsx'

export default function CartSummary({ count, total, onCheckout, checkingOut }) {
  return (
    <aside className="h-fit rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-bold">Summary</h2>
      <dl className="mt-4 space-y-2 text-sm">
        <div className="flex justify-between text-[var(--muted)]">
          <dt>Items</dt>
          <dd className="font-semibold text-[var(--text)]">{count}</dd>
        </div>
        <div className="flex justify-between border-t border-[var(--border)] pt-3">
          <dt className="font-semibold">Total</dt>
          <dd><Price value={total} className="text-lg" /></dd>
        </div>
      </dl>
      <Button onClick={onCheckout} loading={checkingOut} className="mt-5 w-full">
        Proceed to checkout
      </Button>
    </aside>
  )
}
