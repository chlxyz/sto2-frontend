import { CURRENCIES, useCurrency } from '../../context/CurrencyContext.jsx'

export default function CurrencySelect() {
  const { currency, setCurrency } = useCurrency()
  return (
    <label className="flex items-center gap-1 text-[13px] font-medium">
      <span className="sr-only">Currency</span>
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="cursor-pointer rounded-full border border-[var(--border)] bg-transparent px-2.5 py-1.5 text-[13px] font-medium outline-none transition hover:bg-[var(--bg)]"
      >
        {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.code}</option>)}
      </select>
    </label>
  )
}
