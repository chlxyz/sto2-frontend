import OrderStatusBadges from '../molecules/OrderStatusBadges.jsx'
import Badge from '../atoms/Badge.jsx'
import Price from '../atoms/Price.jsx'
import { nextStatuses, statusLabel } from '../../lib/orderStatus.js'

const select = 'rounded-full border border-[var(--border)] bg-[var(--bg)] px-2.5 py-1 text-xs font-medium text-[var(--text)]'

export default function AdminOrderList({ orders, onStatus, updatingId }) {
  return (
    <div className="space-y-4">
      {orders.map((o) => {
        const options = nextStatuses(o.status)

        return (
          <article key={o.id} className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-bold">Order #{o.id}</h3>
              <Badge>{o.user?.email ?? '—'}</Badge>
              <OrderStatusBadges status={o.status} is_paid={o.is_paid} payment_method={o.payment_method} />
              <span className="ml-auto text-sm text-[var(--muted)]">{new Date(o.created_at).toLocaleDateString()}</span>
            </div>

            {/* Forward-only, so the select narrows as the order progresses and
                hides entirely once completed. The confirm lives in the page. */}
            <div className="mt-3 flex items-center gap-2">
              {options.length > 0 ? (
                <label className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  Move to
                  <select
                    aria-label={`Update status for order ${o.id}`}
                    className={select}
                    value=""
                    disabled={updatingId === o.id}
                    onChange={(e) => e.target.value && onStatus(o, e.target.value)}
                  >
                    <option value="">Choose…</option>
                    {options.map((s) => (
                      <option key={s} value={s}>{statusLabel(s)}</option>
                    ))}
                  </select>
                </label>
              ) : (
                <p className="text-xs text-[var(--muted)]">No further action.</p>
              )}
            </div>

            <ul className="mt-3 space-y-2">
              {o.items.map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  {item.image_url && <img src={item.image_url} alt="" className="h-11 w-11 rounded-[4px] object-cover" />}
                  <span className="min-w-0 flex-1 truncate text-sm text-[var(--muted)]">
                    {item.product_name} <span className="tabular-nums">× {item.quantity}</span>{[item.color, item.size].filter(Boolean).length > 0 && ` · ${[item.color, item.size].filter(Boolean).join(' · ')}`}
                  </span>
                  <span className="text-sm tabular-nums"><Price value={item.price * item.quantity} className="text-sm font-medium" /></span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1 border-t border-[var(--border)] pt-3 text-sm">
              {o.discount_total > 0 && (
                <div className="flex justify-between text-[var(--muted)]"><dt>Sale discount</dt><dd className="tabular-nums">−<Price value={o.discount_total} className="text-sm font-medium" /></dd></div>
              )}
              {(o.voucher_codes ?? []).length > 0 && (
                <div className="flex justify-between text-[var(--muted)]"><dt>{o.voucher_codes.join(', ')}</dt><dd className="tabular-nums">−<Price value={o.voucher_amount} className="text-sm font-medium" /></dd></div>
              )}
              {o.tax_amount > 0 && (
                <div className="flex justify-between text-[var(--muted)]"><dt>Tax</dt><dd className="tabular-nums"><Price value={o.tax_amount} className="text-sm font-medium" /></dd></div>
              )}
              {o.shipping_amount > 0 && (
                <div className="flex justify-between text-[var(--muted)]"><dt>Shipping</dt><dd className="tabular-nums"><Price value={o.shipping_amount} className="text-sm font-medium" /></dd></div>
              )}
              <p className="pt-1">Total <Price value={o.total_price} /></p>
            </dl>
          </article>
        )
      })}
    </div>
  )
}