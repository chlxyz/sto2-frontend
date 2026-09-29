import { useState } from 'react'

export default function ProductImage({ src, name, className = '' }) {
  const [failed, setFailed] = useState(!src)
  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-[var(--bg)] text-4xl font-bold text-[var(--muted)] ${className}`}>
        {(name ?? '?').slice(0, 1).toUpperCase()}
      </div>
    )
  }
  return <img src={src} alt={name} loading="lazy" onError={() => setFailed(true)} className={`object-cover ${className}`} />
}
