import { useState } from 'react'
import Price from '../atoms/Price.jsx'
import ImageCarousel from '../molecules/ImageCarousel.jsx'
import ProductCardActions from '../molecules/ProductCardActions.jsx'
import SizePicker from '../molecules/SizePicker.jsx'
import { fit } from '../../lib/stock.js'

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })

export default function ProductCard({ product, onAdd, adding, onView }) {
  const [quantity, setQuantity] = useState(1)
  const [colorId, setColorId] = useState(null)
  const [sizeId, setSizeId] = useState(product.sizes?.find((s) => s.stock > 0)?.id ?? null)

  // Clamp in the same update as the size, so a smaller size can never leave the
  // stepper showing a quantity above its own stock.
  const pickSize = (id) => {
    setSizeId(id)
    setQuantity((q) => fit(q, product, id))
  }
  const out = product.quantity <= 0
  const sale = product.discount_percent > 0
  const color = product.colors?.find((c) => c.id === colorId)
  const images = color?.image_url ? [{ id: `c${color.id}`, url: color.image_url }, ...product.images] : product.images

  return (
    <article className="group flex flex-col">
      <div className="relative">
        <div onClick={() => onView?.(product)} className="cursor-pointer">
          <ImageCarousel images={images.map((i) => i.url)} name={product.name} auto />
        </div>
        <div className="absolute left-4 top-4 flex gap-2">
          {sale && <span className="eyebrow bg-[var(--text)] px-2.5 py-1 text-[var(--bg)]">−{product.discount_percent}%</span>}
          {product.is_preorder && <span className="eyebrow bg-[var(--bg)]/85 px-2.5 py-1 backdrop-blur-sm">Pre-order</span>}
        </div>
        {out && (
          <span className="eyebrow absolute inset-x-0 bottom-4 mx-auto w-fit bg-[var(--text)] px-3 py-1.5 text-[var(--bg)]">Sold out</span>
        )}
      </div>
      <div className="flex flex-1 flex-col pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-display text-[17px] font-semibold leading-snug tracking-[-0.01em]">
            <button type="button" onClick={() => onView?.(product)} className="text-left transition hover:opacity-70">{product.name}</button>
          </h3>
          <Price value={product.effective_price} original={sale ? product.price : null} className="shrink-0 text-[15px]" />
        </div>
        {product.description && <p className="mt-1 line-clamp-1 text-[13px] text-[var(--muted)]">{product.description}</p>}
        {product.is_preorder && product.released_at && (
          <p className="mt-1 text-xs text-[var(--muted)]">Available {fmtDate(product.released_at)}</p>
        )}
        {product.colors?.length > 0 && (
          <div className="mt-2.5 flex gap-1.5">
            {product.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                title={c.name}
                aria-label={`Color ${c.name}`}
                aria-pressed={colorId === c.id}
                // Re-clicking the chosen swatch clears the color. Intentional --
                // the cart's ColorSelect is the unambiguous place to change or
                // unset a variant once it is on a line.
                onClick={() => setColorId(colorId === c.id ? null : c.id)}
                className={`h-5 w-5 rounded-full border transition ${colorId === c.id ? 'border-[var(--text)] ring-1 ring-[var(--text)] ring-offset-2 ring-offset-[var(--bg)]' : 'border-[var(--border)]'}`}
                style={{ background: c.hex || 'var(--muted)' }}
              />
            ))}
          </div>
        )}
        {product.sizes?.length > 0 && (
          <SizePicker compact sizes={product.sizes} value={sizeId} onChange={pickSize} />
        )}
        {!out && (
          <ProductCardActions
            product={product}
            quantity={quantity}
            onQuantity={setQuantity}
            adding={adding}
            sizeId={sizeId}
            onAdd={() => onAdd(product, quantity, colorId, sizeId).catch(() => {})}
          />
        )}
      </div>
    </article>
  )
}
