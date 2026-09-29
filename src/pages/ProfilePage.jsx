import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Alert from '../components/atoms/Alert.jsx'
import Button from '../components/atoms/Button.jsx'
import AddressBook from '../components/molecules/AddressBook.jsx'
import FormField from '../components/molecules/FormField.jsx'
import ShopTemplate from '../components/templates/ShopTemplate.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'

export default function ProfilePage() {
  const { user, saveProfile } = useAuth()
  const welcome = !!useLocation().state?.welcome
  const [displayName, setDisplayName] = useState('')
  const [fullName, setFullName] = useState('')
  const [taken, setTaken] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name ?? '')
      setFullName(user.full_name ?? '')
    }
  }, [user?.email]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(timer.current), [])

  const check = (value) => {
    clearTimeout(timer.current)
    setTaken(false)
    setSuggestions([])
    const clean = value.trim()
    if (!clean || clean === user?.display_name) return
    timer.current = setTimeout(async () => {
      try {
        const { data } = await api.get('/user/name-suggestions', { params: { name: clean } })
        if (!data.includes(clean.toLowerCase().replace(/[^a-z0-9_]+/gi, ''))) {
          setTaken(true)
          setSuggestions(data)
        }
      } catch { /* availability unknown, server validates on save */ }
    }, 400)
  }

  const save = async (e) => {
    e.preventDefault()
    setError('')
    setNotice('')
    setBusy(true)
    try {
      await saveProfile({
        display_name: displayName.trim() || null,
        full_name: fullName.trim() || null,
      })
      setNotice('Profile saved.')
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not save profile.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <ShopTemplate>
      <p className="eyebrow">{welcome ? '01 — Welcome' : 'Account'}</p>
      <h1 className="font-display mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
        {welcome ? 'Pick your display name' : 'Your profile'}
      </h1>
      <Alert>{error}</Alert>
      {notice && <Alert tone="success">{notice}</Alert>}
      <form onSubmit={save} className="grid max-w-xl gap-4 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] p-6">
        <div>
          <FormField
            label="Display name (unique)"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); check(e.target.value) }}
            maxLength={32}
            placeholder="e.g. owl_fan"
          />
          {taken && (
            <div className="mt-2 text-sm">
              <p className="text-red-600">That name is taken. Try:</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { setDisplayName(s); setTaken(false); setSuggestions([]) }}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-[13px] transition hover:border-[var(--text)]"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <FormField label="Contact name (full name)" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
        <AddressBook mode="manage" />
        <p className="text-xs text-[var(--muted)]">Signed in as {user?.email}. Map pinning arrives with the profile upgrade.</p>
        <div><Button type="submit" loading={busy}>Save profile</Button></div>
      </form>
    </ShopTemplate>
  )
}
