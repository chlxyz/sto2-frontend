import Price from '../atoms/Price.jsx'
import ProductImage from '../atoms/ProductImage.jsx'
import QuantityStepper from '../atoms/QuantityStepper.jsx'

export default function CartList({ items, onQuantity, onRemove }) {
  return (
    <ul className="divide-y divide-[var(--border)] rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-5">
      {items.map((item) => (
        <li key={item.id} className="flex gap-4 py-4">
          <ProductImage src={item.product.images?.[0]?.url} name={item.product.name} className="h-20 w-20 shrink-0 rounded-[4px]" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{item.product.name}</p>
            <p className="text-sm text-[var(--muted)]">
              <Price value={item.product.effective_price} original={item.product.discount_percent > 0 ? item.product.price : null} className="text-sm font-medium" />
              {item.color && (
                <span className="ml-2 inline-flex items-center gap-1.5 align-middle">
                  <span className="inline-block h-3 w-3 rounded-full border border-[var(--border)]" style={{ background: item.color.hex || 'var(--muted)' }} />
                  {item.color.name}
                </span>
              )}
              {item.size && (
                <span className="ml-2 inline-flex items-center rounded-full border border-[var(--border)] px-2 py-0.5 align-middle text-xs font-semibold">
                  {item.size.label}
                </span>
              )}
            </p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <QuantityStepper small value={item.quantity} onChange={(q) => onQuantity(item, q)} max={Math.max(item.quantity, item.product.quantity)} />
              <button type="button" onClick={() => onRemove(item)} className="text-sm text-red-600 hover:underline">
                Remove
              </button>
            </div>
          </div>
          <Price value={item.line_total} className="shrink-0" />
        </li>
      ))}
    </ul>
  )
}
