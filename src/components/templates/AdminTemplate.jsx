import { NavLink } from 'react-router-dom'
import ShopTemplate from './ShopTemplate.jsx'

const link = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${isActive ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--muted)] hover:text-[var(--text)]'}`

export default function AdminTemplate({ children }) {
  return (
    <ShopTemplate>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold tracking-[-0.02em]">Admin</h1>
        <nav className="flex gap-1 rounded-full border border-[var(--border)] bg-[var(--surface)] p-1">
          <NavLink to="/admin/products" className={link}>Products</NavLink>
          <NavLink to="/admin/users" className={link}>Users</NavLink>
          <NavLink to="/admin/orders" className={link}>Orders</NavLink>
          <NavLink to="/admin/settings" className={link}>Shop</NavLink>
        </nav>
      </div>
      {children}
    </ShopTemplate>
  )
}
