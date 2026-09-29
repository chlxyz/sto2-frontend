import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { isAdmin } from '../lib/admin.js'

export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex min-h-svh items-center justify-center text-sm text-[var(--muted)]">Loading…</div>
  }
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin(user)) return <Navigate to="/products" replace />
  return children
}
