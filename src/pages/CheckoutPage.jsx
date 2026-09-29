import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import Price from '../components/atoms/Price.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import AddressBook from '../components/molecules/AddressBook.jsx'
import ShopTemplate from '../components/templates/ShopTemplate.jsx'
import api from '../lib/api.js'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [lines, setLines] = useState([])
  const [quote, setQuote] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [code, setCode] = useState('')
  const [codes, setCodes] = useState([])
  const [dest, setDest] = useState(null)
  const [placing, setPlacing] = useState(false)

  const load = useCallback(async (applied = codes) => {
    setLoading(true)
    setError('')
    try {
      const [{ data: items }, { data: q }] = await Promise.all([
        api.get('/cart'),
        api.get('/cart/summary', { params: { voucher_codes: applied } }),
      ])
      setLines(items)
      setQuote(q)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not load checkout.')
    } finally {
      setLoading(false)
    }
  }, [codes])

  useEffect(() => { load() }, [load])

  const placeOrder = async () => {
    if (!dest?.contact?.trim() || !dest?.address?.trim()) {
      setError('Choose a delivery address.')
      return
    }
    setPlacing(true)
    setError('')
    try {
      const { data } = await api.post('/cart/checkout', {
        voucher_codes: codes,
        contact_name: dest.contact.trim(),
        address: dest.address.trim(),
        address_lat: dest.lat ?? null,
        address_lng: dest.lng ?? null,
      })
      if (dest.save && !dest.id) {
        try {
          await api.post('/addresses', {
            contact_name: dest.contact.trim(),
            address: dest.address.trim(),
          })
        } catch { /* bookkeeping only, order already placed */ }
      }
      navigate(Number(data.total_price) === 0 ? '/orders' : `/orders/${data.id}/pay`)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Checkout failed.')
    } finally {
      setPlacing(false)
    }
  }

  const addVoucher = () => {
    const clean = code.trim().toUpperCase()
    if (!clean || codes.includes(clean)) return
    const next = [...codes, clean]
    setCodes(next)
    setCode('')
    load(next)
  }

  const removeVoucher = (c) => {
    const next = codes.filter((x) => x !== c)
    setCodes(next)
    load(next)
  }

  return (
    <ShopTemplate>
      <p className="eyebrow">03 — Checkout</p>
      <h1 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">Review & pay</h1>
      <Alert>{error}</Alert>
      {loading ? (
        <Skeleton className="h-64" />
      ) : lines.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          action={<Link to="/products"><Button>Browse products</Button></Link>}
        />
      ) : (
        <div className="grid items-start gap-5 lg:grid-cols-[1fr_360px]">
          <ul className="divide-y divide-[var(--border)] rounded-[4px] border border-[var(--border)] bg-[var(--surface)] px-5">
            {lines.map((i) => (
              <li key={i.id} className="flex items-center gap-4 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{i.product.name}</p>
                  <p className="text-sm text-[var(--muted)]">
                    {[i.color?.name, i.size?.label].filter(Boolean).join(' · ')}
                    {[i.color?.name, i.size?.label].filter(Boolean).length > 0 && ' · '}
                    <span className="tabular-nums">× {i.quantity}</span>
                  </p>
                </div>
                <Price value={i.line_total} className="shrink-0" />
              </li>
            ))}
          </ul>
          <aside className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 lg:sticky lg:top-24">
            <h2 className="font-bold">Deliver to</h2>
            <div className="mt-3">
              <AddressBook mode="select" onSelection={setDest} />
            </div>
            <h2 className="mt-6 font-bold">Summary</h2>
            <div className="mt-3 flex gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') addVoucher() }}
                placeholder="Voucher code"
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-sm uppercase outline-none placeholder:normal-case placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              />
              <Button tone="ghost" onClick={addVoucher} className="shrink-0 px-4 py-2 text-[13px]">Apply</Button>
            </div>
            {codes.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {codes.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg)] py-1 pl-3 pr-1.5 text-xs font-semibold">
                    {c}
                    <button type="button" aria-label={`Remove ${c}`} onClick={() => removeVoucher(c)} className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-[var(--border)]">×</button>
                  </span>
                ))}
              </div>
            )}
            {quote && (
              <dl className="mt-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-[var(--muted)]"><dt>Subtotal</dt><dd className="tabular-nums"><Price value={quote.subtotal} className="text-sm font-medium" /></dd></div>
                {quote.discount_total > 0 && (
                  <div className="flex justify-between text-[var(--muted)]"><dt>Sale discount</dt><dd className="tabular-nums">−<Price value={quote.discount_total} className="text-sm font-medium" /></dd></div>
                )}
                {quote.vouchers?.map((v) => (
                  <div key={v.code} className="flex justify-between text-[var(--muted)]"><dt>{v.code}</dt><dd className="tabular-nums">−<Price value={v.amount} className="text-sm font-medium" /></dd></div>
                ))}
                <div className="flex justify-between text-[var(--muted)]"><dt>Tax</dt><dd className="tabular-nums"><Price value={quote.tax_amount} className="text-sm font-medium" /></dd></div>
                <div className="flex justify-between text-[var(--muted)]"><dt>Shipping</dt><dd className="tabular-nums">{quote.shipping_amount === 0 ? 'Free' : <Price value={quote.shipping_amount} className="text-sm font-medium" />}</dd></div>
                <div className="flex justify-between border-t border-[var(--border)] pt-3"><dt className="font-semibold">Total</dt><dd><Price value={quote.total} className="text-lg" /></dd></div>
              </dl>
            )}
            <Button onClick={placeOrder} loading={placing} disabled={!dest?.contact?.trim() || !dest?.address?.trim()} className="mt-5 w-full">Place order</Button>
          </aside>
        </div>
      )}
    </ShopTemplate>
  )
}
