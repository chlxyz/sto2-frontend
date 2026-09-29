import QRCode from 'react-qr-code'
import Button from '../atoms/Button.jsx'

export default function ScanQr({ payload, onSimulateScan, scanning }) {
  return (
    <div className="mt-6 rounded-[4px] border border-[var(--border)] bg-[var(--bg)] p-6 text-center">
      <p className="eyebrow">Scan to pay</p>
      <div className="mx-auto mt-4 w-fit bg-white p-4">
        <QRCode value={payload} size={180} />
      </div>
      <p className="mx-auto mt-4 max-w-xs text-xs text-[var(--muted)]">
        Point your banking app at the code. No app handy? The button below calls the same confirm endpoint a real scan would hit.
      </p>
      <Button onClick={onSimulateScan} loading={scanning} className="mt-4 px-4 py-2 text-[13px]">
        Simulate scan
      </Button>
    </div>
  )
}
