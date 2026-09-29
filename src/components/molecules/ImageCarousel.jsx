import { useEffect, useRef, useState } from 'react'
import ProductImage from '../atoms/ProductImage.jsx'

export default function ImageCarousel({ images, name, auto = false, interval = 4000, aspect = 'aspect-[4/5]', index: controlled, onIndexChange }) {
  const [inner, setInner] = useState(0)
  const index = controlled ?? inner
  const setIndex = onIndexChange ?? setInner
  const [hovering, setHovering] = useState(false)
  const [reduced, setReduced] = useState(false)
  const interactedAt = useRef(0)
  const list = images?.length ? images : []

  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const fn = (e) => setReduced(e.matches)
    mq.addEventListener('change', fn)
    return () => mq.removeEventListener('change', fn)
  }, [])

  const go = (i) => {
    interactedAt.current = Date.now()
    setIndex(((i % list.length) + list.length) % list.length)
  }

  // Autoplay: steps every `interval`, freezes while hovered, and waits a full
  // interval after any manual navigation before resuming.
  useEffect(() => {
    if (!auto || reduced || list.length < 2 || hovering) return
    const delay = Math.max(interval - (Date.now() - interactedAt.current), 1200)
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % list.length)
      interactedAt.current = Date.now()
    }, delay)
    return () => clearTimeout(id)
  }, [auto, reduced, hovering, index, list.length, interval])

  if (!list.length) {
    return <ProductImage src={null} name={name} className={`${aspect} w-full`} />
  }

  return (
    <div
      className="group/car relative overflow-hidden rounded-[4px] bg-[var(--surface)]"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {list.map((src, i) => (
          <ProductImage
            key={src + i}
            src={src}
            name={i === 0 ? name : ''}
            className={`${aspect} w-full shrink-0`}
          />
        ))}
      </div>
      {list.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); go(index - 1) }}
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg)]/85 text-sm opacity-0 backdrop-blur-sm transition group-hover/car:opacity-100"
          >
            ←
          </button>
          <button
            type="button"
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); go(index + 1) }}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--bg)]/85 text-sm opacity-0 backdrop-blur-sm transition group-hover/car:opacity-100"
          >
            →
          </button>
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {list.map((src, i) => (
              <button
                key={src + i}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={(e) => { e.stopPropagation(); go(i) }}
                className={`h-1.5 rounded-full transition ${i === index ? 'w-5 bg-[var(--text)]' : 'w-1.5 bg-[var(--text)]/30 hover:bg-[var(--text)]/60'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
