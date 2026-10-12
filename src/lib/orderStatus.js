// Fulfilment track, forward-only. 'pending' and 'awaiting_scan' sit before it,
// so indexOf() returning -1 means "not on the track yet" and may enter anywhere
// -- that is what lets an admin mark an offline bank transfer as paid.
export const TRACK = ['paid', 'prepared', 'shipped', 'completed']

export const nextStatuses = (status) => TRACK.slice(TRACK.indexOf(status) + 1)

const TONES = {
  paid: 'success',
  prepared: 'accent',
  shipped: 'accent',
  completed: 'success',
  cancelled: 'warn',
  refunded: 'warn',
}

export const statusTone = (s) => TONES[s] ?? 'neutral'

export const statusLabel = (s) => s.replace(/_/g, ' ')

// The status badge already reads "paid" when paid is the status, so in that case
// only the method adds information. Otherwise spell it out.
export const paymentNote = (status, isPaid, method) => {
  if (!isPaid) return null
  if (status === 'paid') return method ?? null
  return method ? `Paid · ${method}` : 'Paid'
}