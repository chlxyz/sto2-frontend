import Price from '../atoms/Price.jsx'
import ProductImage from '../atoms/ProductImage.jsx'

export default function RelatedGrid({ products, onView }) {
  if (!products?.length) return null

  return (
    <section className="border-t border-[var(--border)] pt-8">
      <p className="eyebrow">You might like</p>
      <div className="mt-4 grid grid-cols-2 gap-5 lg:grid-cols-4">
        {products.map((p) => (
          <button key={p.id} type="button" onClick={() => onView(p)} className="group text-left">
            <div className="overflow-hidden rounded-[4px] bg-[var(--surface)]">
              <ProductImage
                src={p.images?.[0]?.url}
                name={p.name}
                className="aspect-[4/5] w-full transition duration-500 ease-out group-hover:scale-[1.04]"
              />
            </div>
            <p className="font-display mt-3 text-[15px] font-semibold leading-snug">{p.name}</p>
            <Price value={p.effective_price} original={p.discount_percent > 0 ? p.price : null} className="text-sm" />
          </button>
        ))}
      </div>
    </section>
  )
}
