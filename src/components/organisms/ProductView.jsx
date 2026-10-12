import { useCallback, useEffect, useRef, useState } from 'react'
import Badge from '../atoms/Badge.jsx'
import Button from '../atoms/Button.jsx'
import Price from '../atoms/Price.jsx'
import QuantityStepper from '../atoms/QuantityStepper.jsx'
import HintPopover from '../atoms/HintPopover.jsx'
import ImageCarousel from '../molecules/ImageCarousel.jsx'
import SizeChartModal from '../molecules/SizeChartModal.jsx'
import SizePicker from '../molecules/SizePicker.jsx'
import RelatedGrid from './RelatedGrid.jsx'
import { capFor, fit } from '../../lib/stock.js'

const fmtDate = (d) => new Date(d).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })

export default function ProductView({ product, related, onClose, onView, onAdd, adding }) {
  const sized = product.sizes?.length > 0
  const firstInStock = product.sizes?.find((s) => s.stock > 0)?.id ?? null
  const [quantity, setQuantity] = useState(1)
  const [colorId, setColorId] = useState(null)
  const [sizeId, setSizeId] = useState(firstInStock)
  const [hint, setHint] = useState('')
  const [imgIndex, setImgIndex] = useState(0)
  const [chartOpen, setChartOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const timer = useRef(null)
  const topRef = useRef(null)

  const close = useCallback(() => {
    setClosing(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(onClose, 380)
  }, [onClose])

  useEffect(() => () => clearTimeout(timer.current), [])

  // Reset per-product state when swapping between products (e.g. related picks).
  useEffect(() => {
    setQuantity(1)
    setColorId(null)
    setSizeId(product.sizes?.find((s) => s.stock > 0)?.id ?? null)
    setHint('')
    setImgIndex(0)
    setChartOpen(false)
    topRef.current?.scrollIntoView()
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const out = product.quantity <= 0
  const sale = product.discount_percent > 0
  const color = product.colors?.find((c) => c.id === colorId)
  const images = color?.image_url ? [{ id: `c${color.id}`, url: color.image_url }, ...product.images] : product.images

  // Clamp in the same update as the size: switching XL(5) -> L(2) at qty 5 has
  // to drop to 2, or the stepper sits above its own max.
  const pickSize = (id) => {
    setSizeId(id)
    setQuantity((q) => fit(q, product, id))
    setHint('')
  }

  // Nudge instead of submitting. Keeps the sheet open on a missing size, which
  // the generic page-level alert could not do.
  const add = async () => {
    if (sized && !sizeId) return setHint('Choose a size first')
    if (sized && !product.sizes.find((s) => s.id === sizeId)?.stock) return setHint('Out of stock')
    setHint('')
    try {
      await onAdd(product, quantity, colorId, sizeId)
      close()
    } catch {
      /* error surfaces on the page behind */
    }
  }

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !chartOpen) close() }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [close, chartOpen])

  return (
    <div className="pointer-events-none fixed inset-0 z-20" role="dialog" aria-modal="true" aria-label={product.name}>
      <div className={closing ? 'fade-exit pointer-events-auto absolute inset-x-0 bottom-0 top-[69px]' : 'fade-enter pointer-events-auto absolute inset-x-0 bottom-0 top-[69px]'} onClick={close} />
      <section className={`${closing ? 'sheet-exit' : 'sheet-enter'} pointer-events-auto absolute inset-x-0 bottom-0 top-[69px] overflow-y-auto rounded-t-[4px] border-t border-[var(--border)] bg-[var(--bg)]`}>
        <div className="sticky top-0 z-10 flex justify-end px-4 pt-4 sm:px-6">
          <button
            type="button"
            onClick={close}
            aria-label="Close product view"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)]/85 text-lg backdrop-blur-md transition hover:bg-[var(--surface)]"
          >
            ×
          </button>
        </div>
        <div ref={topRef} className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-10 lg:grid-cols-[1.2fr_1fr] lg:py-14">
          <div className="lg:sticky lg:top-0 lg:self-start">
            <ImageCarousel images={images.map((i) => i.url)} name={product.name} auto aspect="aspect-[4/5]" index={imgIndex} onIndexChange={setImgIndex} />
            {images.length > 1 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {images.map((img, i) => (
                  <button key={img.id ?? img.url} type="button" onClick={() => setImgIndex(i)} aria-label={`Show image ${i + 1}`} className={`overflow-hidden rounded-[4px] transition ${i === imgIndex % images.length ? 'opacity-100 ring-1 ring-[var(--text)]' : 'opacity-60 hover:opacity-100'}`}>
                    <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div>
              {(product.types?.length > 0 || product.is_preorder) && (
                <p className="eyebrow">
                  {[...(product.types ?? []).slice(0, 2), product.is_preorder ? 'Pre-order' : null].filter(Boolean).join(' · ')}
                </p>
              )}
              <h2 className="font-display mt-3 text-4xl font-bold leading-[1.02] tracking-[-0.02em] sm:text-5xl">
                {product.name}
              </h2>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-y border-[var(--border)] py-4">
              {sale && <span className="eyebrow bg-[var(--text)] px-2.5 py-1 text-[var(--bg)]">−{product.discount_percent}%</span>}
              <Price value={product.effective_price} original={sale ? product.price : null} className="text-2xl" />
              <span className="w-full text-xs text-[var(--muted)]">Shipping calculated at checkout.</span>
            </div>

            {product.is_preorder && product.released_at && (
              <p className="mt-4 text-sm text-[var(--muted)]">Available {fmtDate(product.released_at)} — order now, ships on release.</p>
            )}

            {sized && (
              <div className="mt-2">
                <SizePicker sizes={product.sizes} value={sizeId} onChange={pickSize} />
                {product.size_chart && (
                  <button
                    type="button"
                    onClick={() => setChartOpen(true)}
                    className="mt-3 inline-flex items-center gap-2 text-sm font-medium transition hover:opacity-70"
                  >
                    <span aria-hidden>◔</span> {product.size_chart.title || 'Size chart'}
                  </button>
                )}
              </div>
            )}

            {product.description && (
              <div className="mt-7 border-t border-[var(--border)] pt-5">
                <p className="eyebrow">Description</p>
                <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">{product.description}</p>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="mt-7">
                <p className="eyebrow">Color{color ? ` — ${color.name}` : ''}</p>
                <div className="mt-3 flex gap-2">
                  {product.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      title={c.name}
                      aria-label={`Color ${c.name}`}
                      aria-pressed={colorId === c.id}
                      // Re-clicking the chosen swatch clears the color. See the
                      // matching note in ProductCard.jsx.
                      onClick={() => setColorId(colorId === c.id ? null : c.id)}
                      className={`h-8 w-8 rounded-full border transition ${colorId === c.id ? 'border-[var(--text)] ring-1 ring-[var(--text)] ring-offset-2 ring-offset-[var(--bg)]' : 'border-[var(--border)]'}`}
                      style={{ background: c.hex || 'var(--muted)' }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* measurements per size plug in beside the chart next */}
            {!out && (
<div className="relative mt-8 flex items-center gap-4">
              <HintPopover show={Boolean(hint)} tone={hint === 'Out of stock' ? 'warn' : 'hint'}>
                {hint === 'Choose a size first' ? 'Choose a size' : hint}
              </HintPopover>
              <QuantityStepper value={quantity} onChange={setQuantity} max={capFor(product, sizeId)} />
              <Button onClick={add} loading={adding} className="flex-1 py-3">
                Add to cart
              </Button>
            </div>
            )}
            {out && <p className="mt-8"><Badge tone="warn">Sold out</Badge></p>}
          </div>
        </div>
        {related?.length > 0 && (
          <div className="mx-auto w-full max-w-6xl px-6 pb-14">
            <RelatedGrid products={related} onView={onView} />
          </div>
        )}
      </section>
      {chartOpen && product.size_chart && (
        <SizeChartModal chart={product.size_chart} onClose={() => setChartOpen(false)} />
      )}
    </div>
  )
}
