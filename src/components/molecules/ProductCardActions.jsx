import { useState } from 'react'
import Button from '../atoms/Button.jsx'
import HintPopover from '../atoms/HintPopover.jsx'
import QuantityStepper from '../atoms/QuantityStepper.jsx'
import { capFor } from '../../lib/stock.js'

export default function ProductCardActions({ product, quantity, onQuantity, onAdd, adding, sizeId }) {
  const [hint, setHint] = useState('')
  const needsSize = product.sizes?.length > 0

  // Nudge, never submit. The server already 422s on a missing size; blocking it
  // here keeps the failure actionable instead of a generic page-level alert.
  const submit = () => {
    if (needsSize && !sizeId) return setHint('Choose a size first')
    if (needsSize && !product.sizes.find((s) => s.id === sizeId)?.stock) return setHint('Out of stock')
    setHint('')
    onAdd()
  }

  return (
    <div className="relative mt-3 flex items-center gap-3 border-t border-[var(--border)] pt-3">
      <HintPopover show={Boolean(hint)} tone={hint === 'Out of stock' ? 'warn' : 'hint'}>
        {hint === 'Choose a size first' ? 'Choose a size' : hint}
      </HintPopover>
      <QuantityStepper small value={quantity} onChange={onQuantity} max={capFor(product, sizeId)} />
      <Button onClick={submit} loading={adding} className="flex-1 px-4 py-2 text-[13px]">
        Add to cart
      </Button>
    </div>
  )
}