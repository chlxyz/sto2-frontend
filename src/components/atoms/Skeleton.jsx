export default function Skeleton({ className = '' }) {
  return <div aria-hidden className={`skeleton-shimmer rounded-xl bg-[var(--border)] ${className}`} />
}
