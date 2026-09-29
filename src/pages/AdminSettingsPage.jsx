import { useEffect, useState } from 'react'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import FormField from '../components/molecules/FormField.jsx'
import AdminTemplate from '../components/templates/AdminTemplate.jsx'
import api from '../lib/api.js'

const emptyVoucher = { code: '', type: 'percent', value: '', min_subtotal: '', expires_at: '', max_uses: '', max_discount: '', exclude_sale_items: false, is_active: true }

export default function AdminSettingsPage() {
  const [rates, setRates] = useState({ tax_percent: '', shipping_flat: '', free_shipping_min: '' })
  const [vouchers, setVouchers] = useState([])
  const [sizes, setSizes] = useState([])
  const [sizeLabel, setSizeLabel] = useState('')
  const [form, setForm] = useState(emptyVoucher)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const [{ data: r }, { data: v }, { data: s }] = await Promise.all([
        api.get('/admin/settings'),
        api.get('/admin/vouchers'),
        api.get('/admin/sizes'),
      ])
      setRates({ tax_percent: r.tax_percent, shipping_flat: r.shipping_flat, free_shipping_min: r.free_shipping_min })
      setVouchers(v)
      setSizes(s)
    } catch {
      setError('Could not load settings.')
    }
  }

  useEffect(() => { load() }, [])

  const saveRates = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await api.patch('/admin/settings', {
        tax_percent: rates.tax_percent,
        shipping_flat: rates.shipping_flat,
        free_shipping_min: rates.free_shipping_min,
      })
      setNotice('Rates saved.')
    } catch {
      setError('Could not save rates.')
    } finally {
      setBusy(false)
    }
  }

  const saveVoucher = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      await api.post('/admin/vouchers', {
        ...form,
        min_subtotal: form.min_subtotal || 0,
        expires_at: form.expires_at || null,
        max_uses: form.max_uses || null,
      })
      setForm(emptyVoucher)
      setNotice('Voucher created.')
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not create voucher.')
    }
  }

  const toggleVoucher = async (v) => {
    try {
      await api.patch(`/admin/vouchers/${v.id}`, { is_active: !v.is_active })
      load()
    } catch {
      setError('Could not update voucher.')
    }
  }

  const removeVoucher = async (v) => {
    if (!window.confirm(`Delete voucher "${v.code}"?`)) return
    try {
      await api.delete(`/admin/vouchers/${v.id}`)
      load()
    } catch {
      setError('Could not delete voucher.')
    }
  }

  const addSize = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    const clean = sizeLabel.trim()
    if (!clean) return
    try {
      await api.post('/admin/sizes', { label: clean })
      setSizeLabel('')
      setNotice(`Size "${clean}" added.`)
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not add size.')
    }
  }

  const removeSize = async (s) => {
    if (!window.confirm(`Delete size "${s.label}"?`)) return
    setError('')
    setNotice('')
    try {
      await api.delete(`/admin/sizes/${s.id}`)
      load()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not delete size.')
    }
  }

  return (
    <AdminTemplate>
      <Alert>{error}</Alert>
      {notice && <Alert tone="success">{notice}</Alert>}

      <section className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="font-bold">Tax & shipping</h2>
        <form onSubmit={saveRates} className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField label="Tax %" type="number" min="0" max="100" step="0.01" value={rates.tax_percent} onChange={(e) => setRates({ ...rates, tax_percent: e.target.value })} required />
          <FormField label="Flat shipping (USD)" type="number" min="0" step="0.01" value={rates.shipping_flat} onChange={(e) => setRates({ ...rates, shipping_flat: e.target.value })} required />
          <FormField label="Free shipping over (USD)" type="number" min="0" step="0.01" value={rates.free_shipping_min} onChange={(e) => setRates({ ...rates, free_shipping_min: e.target.value })} required />
          <div><Button type="submit" loading={busy}>Save rates</Button></div>
        </form>
      </section>

      <section className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="font-bold">Vouchers</h2>
        <form onSubmit={saveVoucher} className="mt-4 grid gap-4 sm:grid-cols-3">
          <FormField label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required placeholder="SAVE10" />
          <div>
            <label className="mb-1.5 block text-sm font-medium">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none">
              <option value="percent">Percent %</option>
              <option value="fixed">Fixed USD</option>
            </select>
          </div>
          <FormField label={form.type === 'percent' ? 'Value %' : 'Value USD'} type="number" min="0" step="0.01" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
          <FormField label="Min subtotal USD" type="number" min="0" step="0.01" value={form.min_subtotal} onChange={(e) => setForm({ ...form, min_subtotal: e.target.value })} />
          <FormField label="Expires" type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
          <FormField label="Max uses" type="number" min="1" step="1" value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} />
          <FormField label="Max discount USD (percent only)" type="number" min="0" step="0.01" value={form.max_discount} onChange={(e) => setForm({ ...form, max_discount: e.target.value })} />
          <label className="flex cursor-pointer items-center gap-2.5 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={!!form.exclude_sale_items}
              onChange={(e) => setForm({ ...form, exclude_sale_items: e.target.checked })}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Exclude sale items <span className="font-normal text-[var(--muted)]">— voucher applies to full-price lines only</span>
          </label>
          <div className="sm:col-span-3"><Button type="submit">Create voucher</Button></div>
        </form>

        <div className="mt-6 space-y-2">
          {vouchers.length === 0 && <EmptyState title="No vouchers" hint="Create one above." />}
          {vouchers.map((v) => (
            <div key={v.id} className="flex flex-wrap items-center gap-2 rounded-[4px] border border-[var(--border)] px-4 py-2.5 text-sm">
              <span className="font-bold">{v.code}</span>
              <span className="text-[var(--muted)]">{v.type === 'percent' ? `${v.value}%${v.max_discount ? ` (cap $${v.max_discount})` : ''}` : `$${v.value}`}{v.exclude_sale_items ? ' · no-sale' : ''} · min ${v.min_subtotal} · used {v.used_count}{v.max_uses ? `/${v.max_uses}` : ''}{v.expires_at ? ` · till ${new Date(v.expires_at).toLocaleDateString()}` : ''}</span>
              <span className="ml-auto flex gap-3">
                <button type="button" onClick={() => toggleVoucher(v)} className="font-medium text-[var(--accent)] hover:underline">{v.is_active ? 'Disable' : 'Enable'}</button>
                <button type="button" onClick={() => removeVoucher(v)} className="font-medium text-red-600 hover:underline">Delete</button>
              </span>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <h2 className="font-bold">Sizes</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Labels available in the product form dropdown. Sizes in use cannot be deleted.</p>
        <form onSubmit={addSize} className="mt-4 flex gap-2">
          <input
            value={sizeLabel}
            onChange={(e) => setSizeLabel(e.target.value)}
            placeholder="New label, e.g. XXL…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg)] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
          <Button type="submit" className="shrink-0 px-4 py-2 text-[13px]">Add</Button>
        </form>
        <div className="mt-4 flex flex-wrap gap-2">
          {sizes.length === 0 && <p className="text-sm text-[var(--muted)]">No sizes yet — add one above or type custom labels in the product form.</p>}
          {sizes.map((s) => (
            <span key={s.id} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] py-1.5 pl-4 pr-1.5 text-sm font-medium">
              {s.label}
              <span className="text-xs font-normal text-[var(--muted)] tabular-nums">{s.products_count}</span>
              <button
                type="button"
                aria-label={`Delete size ${s.label}`}
                onClick={() => removeSize(s)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>
    </AdminTemplate>
  )
}
