import { useCallback, useEffect, useState } from 'react'
import Alert from '../components/atoms/Alert.jsx'
import EmptyState from '../components/atoms/EmptyState.jsx'
import Skeleton from '../components/atoms/Skeleton.jsx'
import AdminUserList from '../components/organisms/AdminUserList.jsx'
import AdminTemplate from '../components/templates/AdminTemplate.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../lib/api.js'

export default function AdminUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(() => setError('Could not load users.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  const remove = async (u) => {
    if (!window.confirm(`Delete user "${u.email}"? Their orders go with it.`)) return
    try {
      await api.delete(`/admin/users/${u.id}`)
      load()
    } catch {
      setError('Delete failed.')
    }
  }

  return (
    <AdminTemplate>
      <Alert>{error}</Alert>
      {loading ? (
        <Skeleton className="h-64" />
      ) : users.length === 0 ? (
        <EmptyState title="No users" />
      ) : (
        <AdminUserList users={users} me={user?.email} onDelete={remove} />
      )}
    </AdminTemplate>
  )
}
