import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const CACHE_KEY = 'sto2-fx'
const CACHE_TTL = 12 * 3600 * 1000
const ENDPOINT = 'https://open.er-api.com/v6/latest/USD'

export const CURRENCIES = [
  { code: 'USD', locale: 'en-US' },
  { code: 'IDR', locale: 'id-ID' },
  { code: 'EUR', locale: 'de-DE' },
  { code: 'GBP', locale: 'en-GB' },
  { code: 'SGD', locale: 'en-SG' },
  { code: 'JPY', locale: 'ja-JP' },
]

const CurrencyContext = createContext(null)

function readCache() {
  try {
    const raw = JSON.parse(localStorage.getItem(CACHE_KEY))
    if (raw?.rates && Date.now() - raw.at < CACHE_TTL) return raw.rates
    return raw?.rates ?? null
  } catch {
    return null
  }
}

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => localStorage.getItem('sto2-currency') ?? 'USD')
  const [rates, setRates] = useState(() => readCache() ?? { USD: 1 })

  useEffect(() => {
    let live = true
    fetch(ENDPOINT)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (live && data?.rates) {
          setRates(data.rates)
          localStorage.setItem(CACHE_KEY, JSON.stringify({ rates: data.rates, at: Date.now() }))
        }
      })
      .catch(() => {})
    return () => { live = false }
  }, [])

  const change = useCallback((code) => {
    setCurrency(code)
    localStorage.setItem('sto2-currency', code)
  }, [])

  const value = useMemo(() => {
    const meta = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0]
    const rate = rates[meta.code] ?? 1
    return {
      currency: meta.code,
      setCurrency: change,
      convert: (usd) => (usd ?? 0) * rate,
      format: (usd) => new Intl.NumberFormat(meta.locale, {
        style: 'currency',
        currency: meta.code,
        maximumFractionDigits: meta.code === 'IDR' || meta.code === 'JPY' ? 0 : 2,
      }).format((usd ?? 0) * rate),
    }
  }, [currency, rates, change])

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCurrency() {
  return useContext(CurrencyContext)
}
