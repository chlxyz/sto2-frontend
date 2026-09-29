import { useEffect, useState } from 'react'
import Alert from '../atoms/Alert.jsx'
import Button from '../atoms/Button.jsx'
import FormField from './FormField.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../lib/api.js'

// mode="select": dropdown of saved + new-address entry, reports {id, contact, address, lat, lng, save}
// mode="manage": full CRUD list for the profile page.
export default function AddressBook({ mode = 'select', selection, onSelection }) {
  const { user } = useAuth()
  const [list, setList] = useState([])
  const [error, setError] = useState('')
  const [picked, setPicked] = useState('new')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')
  const [saveNew, setSaveNew] = useState(true)
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      const { data } = await api.get('/addresses')
      setList(data)
      return data
    } catch {
      setError('Could not load addresses.')
      return []
    }
  }

  useEffect(() => { load() }, [])

  // Default: first saved address, else blank new entry prefilled from profile.
  useEffect(() => {
    if (mode !== 'select' || selection !== undefined) return
    const first = list[0]
    if (first) {
      onSelection?.({ id: first.id, contact: first.contact_name || '', address: first.address || '', lat: first.address_lat, lng: first.address_lng, save: false })
      setPicked(String(first.id))
    } else {
      onSelection?.({ id: null, contact: user?.full_name || user?.name || '', address: user?.address || '', lat: user?.address_lat ?? null, lng: user?.address_lng ?? null, save: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list.length, mode])

  const pick = (id) => {
    setPicked(id)
    if (id === 'new') {
      onSelection?.({ id: null, contact: '', address: '', lat: null, lng: null, save: saveNew })
      return
    }
    const a = list.find((x) => String(x.id) === String(id))
    if (a) onSelection?.({ id: a.id, contact: a.contact_name || '', address: a.address || '', lat: a.address_lat, lng: a.address_lng, save: false })
  }

  const editNew = (patch) => {
    const next = {
      id: null,
      contact: patch.contact ?? contact,
      address: patch.address ?? address,
      lat: null,
      lng: null,
      save: patch.save ?? saveNew,
    }
    if (patch.contact !== undefined) setContact(patch.contact)
    if (patch.address !== undefined) setAddress(patch.address)
    if (patch.save !== undefined) setSaveNew(patch.save)
    onSelection?.(next)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this address?')) return
    setError('')
    try {
      await api.delete(`/addresses/${id}`)
      const next = await load()
      if (mode === 'select' && String(picked) === String(id)) {
        const first = next[0]
        if (first) {
          setPicked(String(first.id))
          onSelection?.({ id: first.id, contact: first.contact_name || '', address: first.address || '', lat: first.address_lat, lng: first.address_lng, save: false })
        } else {
          setPicked('new')
          onSelection?.({ id: null, contact: '', address: '', lat: null, lng: null, save: false })
        }
      }
    } catch {
      setError('Could not delete address.')
    }
  }

  if (mode === 'manage') {
    return <ManageList list={list} error={error} busy={busy} setBusy={setBusy} setError={setError} reload={load} onDelete={remove} />
  }

  return (
    <div>
      <Alert>{error}</Alert>
      <label className="mb-1.5 block text-sm font-medium">Delivery address</label>
      <select
        value={picked}
        onChange={(e) => pick(e.target.value)}
        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-sm outline-none"
      >
        {list.map((a) => (
          <option key={a.id} value={a.id}>{a.label} — {a.address?.slice(0, 40)}</option>
        ))}
        <option value="new">+ New address…</option>
      </select>
      {picked === 'new' && (
        <div className="mt-3 space-y-3">
          <FormField label="Contact name" value={contact} onChange={(e) => editNew({ contact: e.target.value })} required autoComplete="name" />
          <FormField label="Address" value={address} onChange={(e) => editNew({ address: e.target.value })} required autoComplete="street-address" />
          <label className="flex cursor-pointer items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={saveNew}
              onChange={(e) => editNew({ save: e.target.checked })}
              className="h-4 w-4 accent-[var(--accent)]"
            />
            Save to my addresses
          </label>
        </div>
      )}
    </div>
  )
}

function ManageList({ list, error, busy, setBusy, setError, reload, onDelete }) {
  const [label, setLabel] = useState('')
  const [contact, setContact] = useState('')
  const [address, setAddress] = useState('')

  const add = async (e) => {
    e.preventDefault()
    if (!address.trim()) return
    setBusy(true)
    setError('')
    try {
      await api.post('/addresses', {
        label: label.trim() || 'Home',
        contact_name: contact.trim() || null,
        address: address.trim(),
      })
      setLabel('')
      setContact('')
      setAddress('')
      reload()
    } catch (err) {
      setError(err.response?.data?.message ?? 'Could not add address.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className="mb-1.5 block text-sm font-medium">Saved addresses</label>
      <Alert>{error}</Alert>
      <div className="space-y-2">
        {list.length === 0 && <p className="text-sm text-[var(--muted)]">No saved addresses yet.</p>}
        {list.map((a) => (
          <div key={a.id} className="flex items-center gap-3 rounded-[4px] border border-[var(--border)] px-4 py-2.5 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{a.label}{a.contact_name ? ` · ${a.contact_name}` : ''}</p>
              <p className="truncate text-[var(--muted)]">{a.address}</p>
            </div>
            <button type="button" onClick={() => onDelete(a.id)} className="shrink-0 font-medium text-red-600 hover:underline">
              Delete
            </button>
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label, e.g. Home"
          maxLength={64}
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
        />
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Street address…"
          required
          className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
        />
        <div className="flex gap-2">
          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact"
            className="w-28 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2 text-sm outline-none placeholder:text-[var(--muted)]"
          />
          <Button type="submit" loading={busy} className="shrink-0 px-4 py-2 text-[13px]">Add</Button>
        </div>
      </form>
    </div>
  )
}
