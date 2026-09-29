import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import OrderCard from '../components/organisms/OrderCard.jsx'
import ShopTemplate from '../components/templates/ShopTemplate.jsx'
import api from '../lib/api.js'

export default function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancellingId, setCancellingId] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const cancel = async (order) => {
    setCancellingId(order.id)
    try {
      await api.delete(`/orders/${order.id}`)
      load()
    } catch {
      setError('Could not cancel the order.')
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <ShopTemplate>
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Your orders</h1>
      <Alert>{error}</Alert>
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          hint="Checkout your cart and it will show up here."
          action={<Link to="/products"><Button>Start shopping</Button></Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} cancelling={cancellingId === o.id} onCancel={cancel} />
          ))}
        </div>
      )}
    </ShopTemplate>
  )
}
