import Button from '../atoms/Button.jsx'
import QuantityStepper from '../atoms/QuantityStepper.jsx'

export default function ProductCardActions({ quantity, onQuantity, onAdd, adding, max }) {
  return (
    <div className="mt-3 flex items-center gap-3 border-t border-[var(--border)] pt-3">
      <QuantityStepper small value={quantity} onChange={onQuantity} max={max} />
      <Button onClick={onAdd} loading={adding} className="flex-1 px-4 py-2 text-[13px]">
        Add to cart
      </Button>
    </div>
  )
}
