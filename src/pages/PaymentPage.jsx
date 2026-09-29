import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import Price from '../components/atoms/Price.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import ScanQr from '../components/molecules/ScanQr.jsx'
import PaymentMethodPicker from '../components/organisms/PaymentMethodPicker.jsx'
import ShopTemplate from '../components/templates/ShopTemplate.jsx'
import api from '../lib/api.js'

const qrPayload = (token) => `sto2pay://scan/${token}`

export default function PaymentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [methods, setMethods] = useState([])
  const [method, setMethod] = useState('')
  const [scan, setScan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [paying, setPaying] = useState(false)
  const [scanning, setScanning] = useState(false)
  const poll = useRef(null)

  useEffect(() => {
    api.get(`/orders/${id}/payment-methods`)
      .then(({ data }) => {
        setOrder(data.order)
        setMethods(data.methods)
        setMethod(data.methods[0] ?? '')
        if (data.order.is_paid) {
          setNotice('This order is already paid.')
        } else if (data.order.scan_token) {
          setScan({ token: data.order.scan_token, payload: qrPayload(data.order.scan_token) })
        }
      })
      .catch(() => setError('Could not load this order.'))
      .finally(() => setLoading(false))
  }, [id])

  // Poll while a scan is pending so another device/tab completing it shows live.
  useEffect(() => {
    if (!scan || order?.is_paid) return
    poll.current = setInterval(async () => {
      try {
        const { data } = await api.get(`/orders/${id}/payment-methods`)
        if (data.order.is_paid) {
          clearInterval(poll.current)
          navigate('/orders')
        }
      } catch { /* keep polling */ }
    }, 2500)
    return () => clearInterval(poll.current)
  }, [scan, order?.is_paid, id, navigate])

  const pay = async () => {
    setError('')
    setPaying(true)
    try {
      const { data } = await api.post(`/orders/${id}/payment-methods`, {
        payment_method: method,
        idempotency_key: order.idempotency_key,
      })
      if (data.status === 'awaiting_scan') {
        setScan({ token: data.scan_token, payload: data.qr_payload })
        setOrder(data.order)
        return
      }
      setOrder(data)
      setNotice(data.is_paid ? 'Payment confirmed.' : '')
      if (data.is_paid) navigate('/orders')
    } catch (err) {
      if (err.response?.status === 422) {
        setError(err.response.data.message ?? 'Payment rejected.')
      } else {
        setError('Payment failed. Please try again.')
      }
    } finally {
      setPaying(false)
    }
  }

  const simulateScan = async () => {
    if (!scan) return
    setError('')
    setScanning(true)
    try {
      const { data } = await api.post(`/orders/${id}/scan`, { scan_token: scan.token })
      setOrder(data)
      navigate('/orders')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Scan failed. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <ShopTemplate>
      <h1 className="font-display text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Payment for order #{id}</h1>
      <Alert>{error}</Alert>
      {notice && <Alert tone="success">{notice}</Alert>}
      {loading ? (
        <Skeleton className="h-64" />
      ) : order ? (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_320px]">
          <div className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="font-bold">Choose a method</h2>
            <div className="mt-4">
              <PaymentMethodPicker methods={methods} value={method} onChange={setMethod} />
            </div>
            {!order.is_paid && method !== 'ScanBank' && (
              <Button onClick={pay} loading={paying} className="mt-6 w-full sm:w-auto">
                Pay <Price value={order.total_price} className="text-[var(--accent-contrast)]" />
              </Button>
            )}
            {!order.is_paid && method === 'ScanBank' && !scan && (
              <Button onClick={pay} loading={paying} className="mt-6 w-full sm:w-auto">
                Generate QR code
              </Button>
            )}
            {!order.is_paid && method === 'ScanBank' && scan && (
              <ScanQr payload={scan.payload} onSimulateScan={simulateScan} scanning={scanning} />
            )}
          </div>
          <aside className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 text-sm">
            <h2 className="font-bold">Order summary</h2>
            <ul className="mt-3 space-y-1 text-[var(--muted)]">
              {order.order_items?.map((i) => (
                <li key={i.id}>{i.product?.product_name} <span className="tabular-nums">× {i.quantity}</span></li>
              ))}
            </ul>
            <p className="mt-3 border-t border-[var(--border)] pt-3">Total <Price value={order.total_price} /></p>
            <Link to="/orders" className="mt-3 block text-[var(--accent)] hover:underline">Back to orders</Link>
          </aside>
        </div>
      ) : null}
    </ShopTemplate>
  )
}
