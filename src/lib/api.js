import axios from 'axios'

const base = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${base}/api`,
  withCredentials: true,
  // ponytail: SPA (:5173) and API (:8000) are cross-origin (ports differ),
  // so axios would otherwise skip the X-XSRF-TOKEN header -> 419 on every POST.
  withXSRFToken: true,
  headers: { Accept: 'application/json' },
})

export async function csrf() {
  await axios.get(`${base}/sanctum/csrf-cookie`, { withCredentials: true })
}

export function notifyCartChanged() {
  window.dispatchEvent(new Event('cart:changed'))
}

export default api
