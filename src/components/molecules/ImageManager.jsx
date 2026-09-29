import { useState } from 'react'
import api from '../../lib/api.js'

export default function ImageManager({ existing, pending, onRemoveExisting, onAddFiles, onRemovePending, onReorderExisting, productId }) {
  const [drag, setDrag] = useState(null)

  const move = (list, setList, from, to, persist) => {
    if (from == null || from === to) return
    const next = [...list]
    next.splice(to, 0, ...next.splice(from, 1))
    setList(next)
    persist?.(next)
  }

  const persistOrder = async (next) => {
    if (!productId) return
    try {
      await api.patch(`/admin/products/${productId}/images/order`, { ids: next.map((i) => i.id).filter(Boolean) })
    } catch { /* order kept locally, retried on next drag */ }
  }

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium">Pictures <span className="font-normal text-[var(--muted)]">— drag to reorder, first is cover</span></label>
      <div className="flex flex-wrap gap-2">
        {existing.map((img, i) => (
          <span
            key={img.id ?? img.url}
            draggable={!!img.id}
            onDragStart={() => img.id && setDrag({ list: 'existing', i })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drag?.list === 'existing' && move(existing, (next) => onReorderExisting(next), drag.i, i, persistOrder)}
            onDragEnd={() => setDrag(null)}
            className={`relative ${img.id ? 'cursor-grab active:cursor-grabbing' : ''} ${drag?.list === 'existing' && existing[drag.i]?.url === img.url ? 'opacity-40' : ''}`}
          >
            <img src={img.url} alt="" className="h-20 w-20 rounded-[4px] object-cover" />
            {i === 0 && <em className="eyebrow absolute left-1 top-1 bg-[var(--bg)]/85 px-1.5 not-italic">cover</em>}
            <button
              type="button"
              aria-label="Remove picture"
              onClick={() => onRemoveExisting(img)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--text)] text-xs text-[var(--bg)]"
            >
              ×
            </button>
          </span>
        ))}
        {pending.map((file, i) => (
          <span
            key={file.name + i}
            draggable
            onDragStart={() => setDrag({ list: 'pending', i })}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => drag?.list === 'pending' && move(pending, (next) => onReorderPending(next), drag.i, i)}
            onDragEnd={() => setDrag(null)}
            className="relative cursor-grab active:cursor-grabbing"
          >
            <img src={URL.createObjectURL(file)} alt="" className="h-20 w-20 rounded-[4px] object-cover opacity-70" />
            <button
              type="button"
              aria-label="Remove new picture"
              onClick={() => onRemovePending(i)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--text)] text-xs text-[var(--bg)]"
            >
              ×
            </button>
          </span>
        ))}
        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-[4px] border border-dashed border-[var(--border)] text-2xl text-[var(--muted)] transition hover:border-[var(--accent)] hover:text-[var(--text)]">
          +
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => onAddFiles([...e.target.files])} />
        </label>
      </div>
    </div>
  )
}
