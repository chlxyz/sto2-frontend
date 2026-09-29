import AdminTable from '../molecules/AdminTable.jsx'

export default function AdminUserList({ users, onDelete, me }) {
  return (
    <AdminTable head={['User', 'Email', 'Joined', 'Actions']}>
      {users.map((u) => (
        <tr key={u.id}>
          <td className="px-5 py-3 font-semibold">{u.name}</td>
          <td className="px-5 py-3 text-[var(--muted)]">{u.email}</td>
          <td className="px-5 py-3 text-[var(--muted)]">{new Date(u.created_at).toLocaleDateString()}</td>
          <td className="px-5 py-3">
            {u.email === me ? (
              <span className="text-xs text-[var(--muted)]">you</span>
            ) : (
              <button type="button" onClick={() => onDelete(u)} className="font-medium text-red-600 hover:underline">Delete</button>
            )}
          </td>
        </tr>
      ))}
    </AdminTable>
  )
}
