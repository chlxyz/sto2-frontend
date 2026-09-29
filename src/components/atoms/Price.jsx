import { useCurrency } from '../../context/CurrencyContext.jsx'

export default function Price({ value, original, className = '' }) {
  const { format } = useCurrency()
  return (
    <span className={`inline-flex items-baseline gap-2 font-bold text-[var(--text)] ${className}`}>
      {original != null && original > value && (
        <s className="text-sm font-medium text-[var(--muted)]">{format(original)}</s>
      )}
      {format(value)}
    </span>
  )
}
