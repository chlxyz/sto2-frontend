const blurb = {
  ScanBank: 'Scan a QR code with your banking app.',
  'Bank Transfer': 'Transfer to our account, confirmed instantly in this demo.',
  'Cash on Delivery': 'Pay in cash when your order arrives.',
}

export default function PaymentMethodPicker({ methods, value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Payment method" className="grid gap-3 sm:grid-cols-3">
      {methods.map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={value === m}
          onClick={() => onChange(m)}
          className={`rounded-[4px] border p-4 text-left transition ${
            value === m
              ? 'border-[var(--accent)] bg-[var(--accent)]/5 shadow-[var(--shadow)]'
              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]'
          }`}
        >
          <span className="flex items-center gap-2 font-semibold">
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${value === m ? 'border-[var(--accent)]' : 'border-[var(--muted)]'}`}>
              {value === m && <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />}
            </span>
            {m}
          </span>
          <span className="mt-1 block text-xs text-[var(--muted)]">{blurb[m]}</span>
        </button>
      ))}
    </div>
  )
}
