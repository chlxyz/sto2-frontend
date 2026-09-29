import { useState } from 'react'
import Alert from '../atoms/Alert.jsx'
import Button from '../atoms/Button.jsx'
import ColorManager from './ColorManager.jsx'
import FormField from './FormField.jsx'
import ImageManager from './ImageManager.jsx'
import SizesManager from './SizesManager.jsx'
import TypePicker from './TypePicker.jsx'

export default function ProductForm({ initial, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    product_name: initial?.name ?? '',
    product_desc: initial?.description ?? '',
    product_price: initial?.price ?? '',
    product_quantity: initial?.quantity ?? '',
    discount_percent: initial?.discount_percent ?? 0,
    released_at: initial?.released_at ? initial.released_at.slice(0, 10) : '',
  })
  const [types, setTypes] = useState(initial?.types ?? [])
  const [colors, setColors] = useState(initial?.colors ?? [])
  const [sizes, setSizes] = useState(initial?.sizes ?? [])
  const [listed, setListed] = useState(initial?.is_listed ?? true)
  const [chartTitle, setChartTitle] = useState(initial?.size_chart?.title ?? '')
  const [chartFile, setChartFile] = useState(null)
  const [removeChart, setRemoveChart] = useState(false)
  const [existingImages, setExistingImages] = useState(initial?.images ?? [])
  const [removeIds, setRemoveIds] = useState([])
  const [newFiles, setNewFiles] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const stockTotal = sizes.length
      ? sizes.reduce((n, s) => n + Math.max(0, parseInt(s.stock, 10) || 0), 0)
      : Math.max(0, parseInt(form.product_quantity, 10) || 0)
    if (stockTotal < 1) {
      setError('Add at least one size with stock, or set Stock to 1 or more.')
      return
    }
    setBusy(true)
    try {
      const fd = new FormData()
      Object.entries({ ...form, released_at: form.released_at || '' }).forEach(([k, v]) => fd.append(k, v))
      fd.append('is_listed', listed ? '1' : '0')
      types.forEach((t, i) => fd.append(`types[${i}]`, t))
      colors.forEach((c, i) => {
        fd.append(`colors[${i}][name]`, c.name)
        if (c.hex) fd.append(`colors[${i}][hex]`, c.hex)
      })
      sizes.forEach((s, i) => {
        fd.append(`sizes[${i}][label]`, s.label)
        fd.append(`sizes[${i}][stock]`, s.stock)
      })
      if (chartTitle !== (initial?.size_chart?.title ?? '')) fd.append('size_chart_title', chartTitle)
      if (chartFile) fd.append('size_chart_image', chartFile)
      if (removeChart) fd.append('remove_size_chart', '1')
      newFiles.forEach((f) => fd.append('images[]', f))
      removeIds.forEach((id, i) => fd.append(`remove_image_ids[${i}]`, id))
      await onSubmit(fd)
    } catch (err) {
      setError(err.response?.data?.message ?? 'Save failed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:grid-cols-2">
      <div className="sm:col-span-2"><Alert>{error}</Alert></div>
      <FormField label="Name" value={form.product_name} onChange={set('product_name')} required />
      <TypePicker value={types} onChange={setTypes} />
      <div className="sm:col-span-2">
        <FormField label="Description" value={form.product_desc} onChange={set('product_desc')} required />
      </div>
      <FormField label="Price (USD)" type="number" step="0.01" min="0" value={form.product_price} onChange={set('product_price')} required />
      <FormField label="Discount %" type="number" min="0" max="100" step="1" value={form.discount_percent} onChange={set('discount_percent')} />
      <FormField label="Stock" type="number" min="0" step="1" value={form.product_quantity} onChange={set('product_quantity')} required />
      <div>
        <label className="mb-1.5 block text-sm font-medium">Release date</label>
        <input
          type="date"
          value={form.released_at}
          onChange={set('released_at')}
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none transition focus:border-[var(--accent)]"
        />
        <p className="mt-1 text-xs text-[var(--muted)]">Future date = pre-order. Empty = available now.</p>
      </div>
      <ImageManager
        existing={existingImages}
        pending={newFiles}
        productId={initial?.id}
        onReorderExisting={setExistingImages}
        onReorderPending={setNewFiles}
        onRemoveExisting={(img) => {
          setExistingImages(existingImages.filter((x) => x.url !== img.url))
          if (img.id) setRemoveIds([...removeIds, img.id])
        }}
        onAddFiles={(files) => setNewFiles([...newFiles, ...files])}
        onRemovePending={(i) => setNewFiles(newFiles.filter((_, x) => x !== i))}
      />
      <ColorManager colors={colors} onChange={setColors} productId={initial?.id} />
      <SizesManager sizes={sizes} onChange={setSizes} />
      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-sm font-medium">Size chart</label>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="Chart title, e.g. Hoodie measurements…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
          />
          <label className="shrink-0 cursor-pointer rounded-full border border-[var(--border)] px-4 py-2.5 text-sm font-medium transition hover:bg-[var(--bg)]">
            {chartFile ? chartFile.name.slice(0, 18) + '…' : initial?.size_chart?.image_url ? 'Replace image' : 'Upload image'}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => setChartFile(e.target.files[0] ?? null)} />
          </label>
          {(initial?.size_chart || chartFile) && (
            <button
              type="button"
              onClick={() => { setRemoveChart(true); setChartFile(null); setChartTitle('') }}
              className="shrink-0 text-sm text-red-600 hover:underline"
            >
              Remove chart
            </button>
          )}
        </div>
        {removeChart && <p className="mt-1 text-xs text-red-600">Chart will be removed on save.</p>}
      </div>
      <label className="flex cursor-pointer items-center gap-3 sm:col-span-2">
        <input
          type="checkbox"
          checked={listed}
          onChange={(e) => setListed(e.target.checked)}
          className="h-5 w-5 accent-[var(--accent)]"
        />
        <span className="text-sm font-medium">Listed <span className="font-normal text-[var(--muted)]">— unlisted products are hidden from the shop</span></span>
      </label>
      <div className="flex items-end gap-2 sm:col-span-2">
        <Button type="submit" loading={busy}>{initial ? 'Save changes' : 'Add product'}</Button>
        {onCancel && <Button type="button" tone="ghost" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  )
}
