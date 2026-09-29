import { Link } from 'react-router-dom'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import Price from '../atoms/Price.jsx'

const statusTone = (s) => (s === 'paid' ? 'success' : s === 'cancelled' ? 'warn' : 'neutral')

export default function OrderCard({ order, onCancel, cancelling }) {
  return (
    <article className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-bold">Order #{order.id}</h3>
        <Badge tone={statusTone(order.status)}>{order.status}</Badge>
        {order.is_paid && <Badge tone="success">paid</Badge>}
        <span className="ml-auto text-sm text-[var(--muted)]">
          {new Date(order.created_at).toLocaleDateString()}
        </span>
      </div>
      <ul className="mt-3 space-y-2">
        {order.items.map((item, i) => (
          <li key={i} className="flex items-center gap-3">
            {item.image_url && <img src={item.image_url} alt="" className="h-11 w-11 rounded-[4px] object-cover" />}
            <span className="min-w-0 flex-1 truncate text-sm text-[var(--muted)]">
              {item.product_name} <span className="tabular-nums">× {item.quantity}</span>{[item.color, item.size].filter(Boolean).length > 0 && ` · ${[item.color, item.size].filter(Boolean).join(' · ')}`}
            </span>
            <span className="text-sm tabular-nums"><Price value={item.price * item.quantity} className="text-sm font-medium" /></span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 border-t border-[var(--border)] pt-3 text-sm">
        {order.discount_total > 0 && (
          <div className="flex justify-between text-[var(--muted)]"><dt>Sale discount</dt><dd className="tabular-nums">−<Price value={order.discount_total} className="text-sm font-medium" /></dd></div>
        )}
        {(order.voucher_codes ?? []).map((c) => (
          <div key={c} className="flex justify-between text-[var(--muted)]"><dt>{c}</dt><dd className="tabular-nums">−<Price value={(order.voucher_amount ?? 0) / order.voucher_codes.length} className="text-sm font-medium" /></dd></div>
        ))}
        {order.tax_amount > 0 && (
          <div className="flex justify-between text-[var(--muted)]"><dt>Tax</dt><dd className="tabular-nums"><Price value={order.tax_amount} className="text-sm font-medium" /></dd></div>
        )}
        {order.shipping_amount > 0 && (
          <div className="flex justify-between text-[var(--muted)]"><dt>Shipping</dt><dd className="tabular-nums"><Price value={order.shipping_amount} className="text-sm font-medium" /></dd></div>
        )}
        <div className="flex items-center justify-between gap-2 pt-1">
          <dt className="text-[var(--muted)]">Total <Price value={order.total_price} /></dt>
          <dd className="flex gap-2">
            {!order.is_paid && (
              <Link to={`/orders/${order.id}/pay`}>
                <Button className="px-4 py-2 text-[13px]">Pay now</Button>
              </Link>
            )}
            <Button tone="ghost" onClick={() => onCancel(order)} loading={cancelling} className="px-4 py-2 text-[13px]">
              Cancel order
            </Button>
          </dd>
        </div>
      </dl>
    </article>
  )
}
