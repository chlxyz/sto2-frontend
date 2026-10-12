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
  const [updatingId, setUpdatingId] = useState(null)

  useEffect(() => {
    api.get('/admin/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => setError('Could not load orders.'))
      .finally(() => setLoading(false))
  }, [])

  // Forward-only and irreversible, so the step is deliberate rather than firing
  // on the select's first click. Same window.confirm pattern as AddressBook.
  const setStatus = async (order, status) => {
    if (!window.confirm(`Move order #${order.id} to ${status}? This cannot be undone.`)) return

    setUpdatingId(order.id)
    setError('')
    try {
      const { data } = await api.patch(`/admin/orders/${order.id}/status`, { status })
      setOrders((os) => os.map((o) => (o.id === order.id ? data : o)))
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not update status.')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <AdminTemplate>
      <Alert>{error}</Alert>
      {loading ? (
        <Skeleton className="h-44" />
      ) : orders.length === 0 ? (
        <EmptyState title="No orders yet" />
      ) : (
        <AdminOrderList orders={orders} onStatus={setStatus} updatingId={updatingId} />
      )}
    </AdminTemplate>
  )
}
