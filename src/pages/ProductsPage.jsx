import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../components/molecules/SearchBar.jsx'
import FilterBar from '../components/organisms/FilterBar.jsx'
import HeroStrip from '../components/organisms/HeroStrip.jsx'
import ProductGrid from '../components/organisms/ProductGrid.jsx'
import ProductView from '../components/organisms/ProductView.jsx'
import ShopTemplate from '../components/templates/ShopTemplate.jsx'
import api, { notifyCartChanged } from '../lib/api.js'
import Alert from '../components/atoms/Alert.jsx'

const releaseOf = (p) => p.released_at ?? p.created_at ?? 0

export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ types: [], sort: 'newest', onSale: false })
  const [addingId, setAddingId] = useState(null)
  const [viewing, setViewing] = useState(null)

  useEffect(() => {
    api.get('/products')
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [])

  const typeCounts = useMemo(() => {
    const counts = {}
    products.forEach((p) => p.types?.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1 }))
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((p) => {
      if (filters.types.length && !filters.types.every((t) => p.types?.includes(t))) return false
      if (filters.onSale && !(p.discount_percent > 0)) return false
      if (!q) return true
      return [p.name, p.description, ...(p.types ?? [])].some((f) => f?.toLowerCase().includes(q))
    })
    list = [...list].sort((a, b) => {
      if (filters.sort === 'price-asc') return a.effective_price - b.effective_price
      if (filters.sort === 'price-desc') return b.effective_price - a.effective_price
      if (filters.sort === 'featured') return 0
      return new Date(releaseOf(b)) - new Date(releaseOf(a))
    })
    return list
  }, [products, query, filters])

  const related = useMemo(() => {
    if (!viewing) return []
    const mine = new Set(viewing.types ?? [])
    const scored = products
      .filter((p) => p.id !== viewing.id)
      .map((p) => ({
        p,
        shared: (p.types ?? []).filter((t) => mine.has(t)).length,
      }))
      .sort((a, b) => b.shared - a.shared || products.indexOf(a.p) - products.indexOf(b.p))
    return scored.slice(0, 4).map((s) => s.p)
  }, [products, viewing])

  const add = async (product, quantity, colorId, sizeId) => {
    setAddingId(product.id)
    try {
      await api.post('/cart', { product_id: product.id, quantity, color_id: colorId, size_id: sizeId })
      notifyCartChanged()
    } catch (err) {
      // Server already returns actionable text ("Please choose a size.",
      // "Product is out of stock."); don't throw it away.
      setError(err.response?.data?.message || 'Could not add to cart.')
      throw new Error('add-to-cart-failed')
    } finally {
      setAddingId(null)
    }
  }

  return (
    <ShopTemplate>
      <HeroStrip />
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">02 — Catalog{visible.length > 0 && ` · ${visible.length}`}</p>
          <h1 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Shop all products</h1>
        </div>
        <SearchBar value={query} onChange={setQuery} />
      </div>
      <Alert>{error}</Alert>
      {!loading && typeCounts.length > 0 && (
        <FilterBar types={typeCounts} value={filters} onChange={setFilters} />
      )}
      <ProductGrid products={visible} loading={loading} addingId={addingId} onAdd={add} onView={setViewing} />
      {viewing && (
        <ProductView
          product={viewing}
          related={related}
          onClose={() => setViewing(null)}
          onView={setViewing}
          onAdd={add}
          adding={addingId === viewing.id}
        />
      )}
    </ShopTemplate>
  )
}
