export default function SizeChartModal({ chart, onClose }) {
  if (!chart) return null

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={chart.title}>
      <div className="fade-enter absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="rise relative max-h-[85svh] w-full max-w-lg overflow-y-auto rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl font-bold tracking-[-0.01em]">{chart.title || 'Size chart'}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close size chart"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] text-lg transition hover:bg-[var(--bg)]"
          >
            ×
          </button>
        </div>
        {chart.image_url ? (
          <img src={chart.image_url} alt={chart.title || 'Size chart'} className="mt-4 w-full rounded-[4px] border border-[var(--border)]" />
        ) : (
          <p className="mt-4 text-sm text-[var(--muted)]">No chart image uploaded for this product yet.</p>
        )}
      </div>
    </div>
  )
}
