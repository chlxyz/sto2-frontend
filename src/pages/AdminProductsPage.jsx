import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import ProductForm from '../components/molecules/ProductForm.jsx'
import AdminProductTable from '../components/organisms/AdminProductTable.jsx'
import FilterBar from '../components/organisms/FilterBar.jsx'
import AdminTemplate from '../components/templates/AdminTemplate.jsx'
import api from '../lib/api.js'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)
  const [adding, setAdding] = useState(false)
  const [filters, setFilters] = useState({ types: [], sort: 'featured', onSale: false, listed: 'all' })

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/products')
      .then(({ data }) => setProducts(data))
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const save = async (fd) => {
    if (editing) {
      fd.append('_method', 'PATCH')
      await api.post(`/admin/products/${editing.id}`, fd)
    } else {
      await api.post('/admin/products', fd)
    }
    setEditing(null)
    setAdding(false)
    load()
  }

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return
    try {
      await api.delete(`/admin/products/${p.id}`)
      load()
    } catch {
      setError('Delete failed.')
    }
  }

  const toggleListed = async (p) => {
    try {
      const fd = new FormData()
      fd.append('_method', 'PATCH')
      fd.append('product_name', p.name)
      fd.append('product_desc', p.description ?? '')
      fd.append('product_quantity', p.sizes?.length ? p.sizes.reduce((n, s) => n + s.stock, 0) : p.quantity)
      fd.append('product_price', p.price)
      fd.append('is_listed', p.is_listed ? '0' : '1')
      await api.post(`/admin/products/${p.id}`, fd)
      load()
    } catch {
      setError('Could not change listing.')
    }
  }

  const reorder = async (ids) => {
    const prev = products
    setProducts(ids.map((id) => products.find((p) => p.id === id)).filter(Boolean))
    try {
      await api.patch('/admin/products/order', { ids })
    } catch {
      setError('Could not save order.')
      setProducts(prev)
    }
  }

  const typeCounts = useMemo(() => {
    const counts = {}
    products.forEach((p) => p.types?.forEach((t) => { counts[t] = (counts[t] ?? 0) + 1 }))
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name))
  }, [products])

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      if (filters.types.length && !filters.types.every((t) => p.types?.includes(t))) return false
      if (filters.onSale && !(p.discount_percent > 0)) return false
      if (filters.listed === 'listed' && !p.is_listed) return false
      if (filters.listed === 'unlisted' && p.is_listed) return false
      return true
    })
    return [...list].sort((a, b) => {
      if (filters.sort === 'price-asc') return a.effective_price - b.effective_price
      if (filters.sort === 'price-desc') return b.effective_price - a.effective_price
      if (filters.sort === 'featured') return 0
      return new Date(b.released_at ?? b.created_at ?? 0) - new Date(a.released_at ?? a.created_at ?? 0)
    })
  }, [products, filters])

  const reorderable = filters.types.length === 0 && !filters.onSale && (filters.listed ?? 'all') === 'all' && filters.sort === 'featured'

  const formOpen = adding || editing

  return (
    <AdminTemplate>
      <Alert>{error}</Alert>
      {!loading && typeCounts.length > 0 && (
        <FilterBar types={typeCounts} value={filters} onChange={setFilters} showListed />
      )}
      {!formOpen && (
        <div><Button onClick={() => setAdding(true)}>Add product</Button></div>
      )}
      {formOpen && (
        <ProductForm
          initial={editing}
          onSubmit={save}
          onCancel={() => { setEditing(null); setAdding(false) }}
        />
      )}
      {loading ? (
        <Skeleton className="h-64" />
      ) : visible.length === 0 ? (
        <EmptyState title="No products" hint="Add your first product above." />
      ) : (
        <AdminProductTable products={visible} onEdit={setEditing} onDelete={remove} onToggleListed={toggleListed} onReorder={reorder} reorderable={reorderable} />
      )}
    </AdminTemplate>
  )
}
