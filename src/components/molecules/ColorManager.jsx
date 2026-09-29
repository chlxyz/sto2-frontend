import { useEffect, useState } from 'react'
import api from '../../lib/api.js'

export default function ColorManager({ colors, onChange, productId }) {
  const [name, setName] = useState('')
  const [hex, setHex] = useState('#000000')
  const [picked, setPicked] = useState('')
  const [options, setOptions] = useState([])
  const [uploading, setUploading] = useState(null)

  useEffect(() => {
    api.get('/colors').then(({ data }) => setOptions(data)).catch(() => {})
  }, [])

  const add = () => {
    const clean = (name.trim() || picked).trim()
    if (!clean || colors.some((c) => c.name.toLowerCase() === clean.toLowerCase())) return
    const known = options.find((o) => o.name.toLowerCase() === clean.toLowerCase())
    onChange([...colors, { name: clean, hex: known?.hex ?? hex }])
    setName('')
    setPicked('')
  }

  const uploadImage = async (color, file) => {
    if (!productId || !color.id || !file) return
    setUploading(color.id)
    try {
      const fd = new FormData()
      fd.append('image', file)
      const { data } = await api.post(`/admin/products/${productId}/colors/${color.id}/image`, fd)
      const fresh = data.colors.find((c) => c.id === color.id)
      onChange(colors.map((c) => (c.id === color.id ? { ...c, image_url: fresh?.image_url ?? c.image_url } : c)))
    } finally {
      setUploading(null)
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium">Colors</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((c) => (
          <span key={c.id ?? c.name} className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg)] py-1 pl-2 pr-1.5 text-[13px]">
            <span className="h-4 w-4 rounded-full border border-[var(--border)]" style={{ background: c.hex || 'transparent' }} />
            {c.image_url && <img src={c.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />}
            {c.name}
            {productId && c.id && (
              <label className="cursor-pointer text-xs text-[var(--muted)] hover:text-[var(--text)]">
                {uploading === c.id ? '…' : 'photo'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => uploadImage(c, e.target.files[0])} />
              </label>
            )}
            <button
              type="button"
              aria-label={`Remove ${c.name}`}
              onClick={() => onChange(colors.filter((x) => x.name !== c.name))}
              className="flex h-5 w-5 items-center justify-center rounded-full text-[var(--muted)] transition hover:bg-[var(--border)] hover:text-[var(--text)]"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <select
          value={picked}
          onChange={(e) => setPicked(e.target.value)}
          aria-label="Existing colors"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none"
        >
          <option value="">Select color…</option>
          {options.filter((o) => !colors.some((c) => c.name.toLowerCase() === o.name.toLowerCase())).map((o) => (
            <option key={o.name} value={o.name}>{o.name}</option>
          ))}
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="or custom…"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
        />
        <input
          type="color"
          value={hex}
          onChange={(e) => setHex(e.target.value)}
          aria-label="Color swatch"
          className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"
        />
        <button
          type="button"
          onClick={add}
          className="shrink-0 rounded-full border border-[var(--border)] px-4 text-sm font-medium transition hover:bg-[var(--bg)]"
        >
          Add
        </button>
      </div>
    </div>
  )
}
