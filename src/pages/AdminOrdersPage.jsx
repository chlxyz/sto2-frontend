import { useEffect, useState } from 'react'
import Alert from '../components/atoms/Alert.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import AdminOrderList from '../components/organisms/AdminOrderList.jsx'
import AdminTemplate from '../components/templates/AdminTemplate.jsx'
import api from '../lib/api.js'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/admin/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <AdminTemplate>
      <Alert>{error}</Alert>
      {loading ? (
        <Skeleton className="h-44" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <AdminOrderList orders={orders} />
      )}
    </AdminTemplate>
  )
}
