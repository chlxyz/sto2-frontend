import { useState } from 'react'
import Badge from '../atoms/Badge.jsx'
import Price from '../atoms/Price.jsx'
import ProductImage from '../atoms/ProductImage.jsx'
import AdminTable from '../molecules/AdminTable.jsx'

export default function AdminProductTable({ products, onEdit, onDelete, onToggleListed, onReorder, reorderable = true }) {
  const [dragId, setDragId] = useState(null)

  const drop = (targetId) => {
    if (dragId == null || dragId === targetId) return
    const ids = products.map((p) => p.id)
    const from = ids.indexOf(dragId)
    const to = ids.indexOf(targetId)
    if (from < 0 || to < 0) return
    ids.splice(to, 0, ...ids.splice(from, 1))
    onReorder(ids)
    setDragId(null)
  }

  return (
    <AdminTable head={['', 'Product', 'Price', 'Stock', 'Listed', 'Actions']}>
      {products.map((p) => (
        <tr
          key={p.id}
          draggable={reorderable}
          onDragStart={() => reorderable && setDragId(p.id)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => reorderable && drop(p.id)}
          className={dragId === p.id ? 'opacity-40' : ''}
        >
          <td className={`w-10 px-3 py-3 text-[var(--muted)] ${reorderable ? 'cursor-grab active:cursor-grabbing' : 'opacity-30'}`} title={reorderable ? 'Drag to reorder' : 'Clear filters and use Featured sort to reorder'}>⋮⋮</td>
          <td className="px-5 py-3">
            <div className="flex items-center gap-3">
              <ProductImage src={p.images?.[0]?.url} name={p.name} className="h-11 w-11 rounded-[4px]" />
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="max-w-56 truncate text-xs text-[var(--muted)]">
                  {[(p.types ?? []).join(' · '), (p.sizes ?? []).map((s) => s.label).join(', ')].filter(Boolean).join(' — ') || p.description}
                </p>
              </div>
            </div>
          </td>
          <td className="px-5 py-3"><Price value={p.effective_price} original={p.discount_percent > 0 ? p.price : null} /></td>
          <td className="px-5 py-3">
            <Badge tone={p.quantity > 0 ? 'success' : 'warn'}>{p.quantity}</Badge>
          </td>
          <td className="px-5 py-3">
            <button
              type="button"
              onClick={() => onToggleListed(p)}
              aria-pressed={p.is_listed}
              title={p.is_listed ? 'Unlist product' : 'List product'}
            >
              <Badge tone={p.is_listed ? 'success' : 'neutral'}>{p.is_listed ? 'Listed' : 'Unlisted'}</Badge>
            </button>
          </td>
          <td className="px-5 py-3">
            <div className="flex gap-3">
              <button type="button" onClick={() => onEdit(p)} className="font-medium text-[var(--accent)] hover:underline">Edit</button>
              <button type="button" onClick={() => onDelete(p)} className="font-medium text-red-600 hover:underline">Delete</button>
            </div>
          </td>
        </tr>
      ))}
    </AdminTable>
  )
}
