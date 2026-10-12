import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import CartList from '../components/organisms/CartList.jsx'
import CartSummary from '../components/organisms/CartSummary.jsx'
import ShopTemplate from '../components/templates/ShopTemplate.jsx'
import api, { notifyCartChanged } from '../lib/api.js'

export default function CartPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [checkingOut, setCheckingOut] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(() => {
    setLoading(true)
    api.get('/cart')
      .then(({ data }) => setItems(data))
      .catch(() => setError('Could not load your cart.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const mutate = async (fn) => {
    setError('')
    try {
      await fn()
      notifyCartChanged()
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Cart update failed.')
    }
  }

  const checkout = () => {
    navigate('/checkout')
  }

  const total = items.reduce((n, i) => n + i.line_total, 0)
  const count = items.reduce((n, i) => n + i.quantity, 0)

  return (
    <ShopTemplate>
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Your cart</h1>
      <Alert>{error}</Alert>
      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          hint="Add something you love from the shop."
          action={<Link to="/products"><Button>Browse products</Button></Link>}
        />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
          <CartList
            items={items}
            onQuantity={(item, q) => mutate(() => api.patch(`/cart/${item.id}`, { quantity: q }))}
            onVariant={(item, patch) => mutate(() => api.patch(`/cart/${item.id}`, { quantity: item.quantity, ...patch }))}
            onRemove={(item) => mutate(() => api.delete(`/cart/${item.id}`))}
          />
          <CartSummary count={count} total={total} onCheckout={checkout} checkingOut={checkingOut} />
        </div>
      )}
    </ShopTemplate>
  )
}
