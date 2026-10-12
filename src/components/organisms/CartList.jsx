import ColorSelect from '../atoms/ColorSelect.jsx'
import Price from '../atoms/Price.jsx'
import ProductImage from '../atoms/ProductImage.jsx'
import QuantityStepper from '../atoms/QuantityStepper.jsx'
import { capFor } from '../../lib/stock.js'

const select = 'rounded-full border border-[var(--border)] bg-[var(--bg)] px-2 py-1 text-xs font-medium text-[var(--text)]'

export default function CartList({ items, onQuantity, onRemove, onVariant }) {
  return (
    <ul className="divide-y divide-[var(--border)] rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-5">
      {items.map((item) => {
        const sizes = item.product.sizes ?? []
        const colors = item.product.colors ?? []
        // Only a size that is genuinely gone blocks selection. Comparing a
        // candidate size's stock against this line's quantity flagged sizes the
        // user was happy to switch INTO, and the flagged set moved every time
        // update() clamped the quantity. Picking a smaller size now just clamps
        // via the API and the stepper re-syncs from the reload.
        const gone = (s) => s.stock <= 0

        return (
          <li key={item.id} className="flex gap-4 py-4">
            <ProductImage src={item.product.images?.[0]?.url} name={item.product.name} className="h-20 w-20 shrink-0 rounded-[4px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{item.product.name}</p>
              <p className="mt-0.5 text-sm text-[var(--muted)]">
                <Price value={item.product.effective_price} original={item.product.discount_percent > 0 ? item.product.price : null} className="text-sm font-medium" />
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {sizes.length > 0 && (
                  <label className="flex items-center gap-1.5 text-xs text-[var(--muted)]">
                    Size
                    <select
                      aria-label={`Size for ${item.product.name}`}
                      className={select}
                      value={item.size?.id ?? ''}
                      onChange={(e) => onVariant(item, { size_id: Number(e.target.value) })}
                    >
                      {sizes.map((s) => (
                        <option key={s.id} value={s.id} disabled={gone(s)}>
                          {s.label}
                          {gone(s) ? ' — sold out' : s.stock <= 3 ? ` — ${s.stock} left` : ''}
                        </option>
                      ))}
                    </select>
                  </label>
                )}

                {colors.length > 0 && (
                  <ColorSelect
                    colors={colors}
                    value={item.color?.id ?? null}
                    label={`Color for ${item.product.name}`}
                    onChange={(color_id) => onVariant(item, { color_id })}
                  />
                )}
              </div>

              <div className="mt-2 flex items-center justify-between gap-2">
                {/* QuantityStepper already clamps to max, and the floor keeps the
                    displayed number equal to the server's when stock dropped
                    below what this line holds. */}
                <QuantityStepper small value={item.quantity} onChange={(q) => onQuantity(item, q)} max={Math.max(item.quantity, capFor(item.product, item.size?.id))} />
                <button type="button" onClick={() => onRemove(item)} className="text-sm text-red-600 hover:underline">
                  Remove
                </button>
              </div>
            </div>
            <Price value={item.line_total} className="shrink-0" />
          </li>
        )
      })}
    </ul>
  )
}