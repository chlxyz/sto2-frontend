import Badge from '../atoms/Badge.jsx'
import { paymentNote, statusLabel, statusTone } from '../../lib/orderStatus.js'

// Single source for how status and payment render. The admin list and the
// customer's order list each used to render the status badge AND a bare "paid"
// badge, which read as "paid paid" or "prepared paid" because "paid" is a value
// in both the status column and the is_paid flag.
export default function OrderStatusBadges({ status, is_paid, payment_method }) {
  const note = paymentNote(status, is_paid, payment_method)

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <Badge tone={statusTone(status)}>{statusLabel(status)}</Badge>
      {note && <span className="text-xs font-medium text-[var(--muted)]">{note}</span>}
    </span>
  )
}