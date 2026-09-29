import EmptyState from '../atoms/EmptyState.jsx'
import Skeleton from '../atoms/Skeleton.jsx'
import ProductCard from './ProductCard.jsx'

export default function ProductGrid({ products, loading, addingId, onAdd, onView }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="aspect-[4/5] rounded-[4px]" />
            <div className="space-y-2 pt-4">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return <EmptyState title="No products found" hint="Try a different search, or check back later." />
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} adding={addingId === p.id} onAdd={onAdd} onView={onView} />
      ))}
    </div>
  )
}
