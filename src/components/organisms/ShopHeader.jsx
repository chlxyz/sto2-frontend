import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import api from '../../lib/api.js'
import { isAdmin } from '../../lib/admin.js'
import ThemeToggle from '../atoms/ThemeToggle.jsx'
import CurrencySelect from '../molecules/CurrencySelect.jsx'

const link = ({ isActive }) =>
  `text-[13px] font-medium tracking-wide transition ${isActive ? 'text-[var(--text)] underline decoration-[var(--accent)] decoration-2 underline-offset-8' : 'text-[var(--muted)] hover:text-[var(--text)]'}`

export default function ShopHeader() {
  const { user, logout } = useAuth()
  const [count, setCount] = useState(0)
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const initial = (user?.display_name || user?.name || user?.email || '?').slice(0, 1).toUpperCase()

  useEffect(() => {
    if (!menu) return
    const close = (e) => {
      if (e.key === 'Escape' || (menuRef.current && !menuRef.current.contains(e.target))) {
        setMenu(false)
      }
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('keydown', close)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('keydown', close)
    }
  }, [menu])

  useEffect(() => { setMenu(false) }, [location.pathname])

  useEffect(() => {
    let live = true
    api.get('/cart').then(({ data }) => {
      if (live) setCount(data.reduce((n, i) => n + i.quantity, 0))
    }).catch(() => {})
    const refresh = () => api.get('/cart').then(({ data }) => {
      if (live) setCount(data.reduce((n, i) => n + i.quantity, 0))
    }).catch(() => {})
    window.addEventListener('cart:changed', refresh)
    return () => { live = false; window.removeEventListener('cart:changed', refresh) }
  }, [location.pathname])

  const out = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center gap-8 px-6">
        <Link to="/products" className="font-display text-[17px] font-bold tracking-[0.08em]">
          STO2
        </Link>
        <nav className="hidden items-center gap-7 sm:flex">
          <NavLink to="/products" className={link}>Shop</NavLink>
          <NavLink to="/orders" className={link}>Orders</NavLink>
          {isAdmin(user) && <NavLink to="/admin/products" className={link}>Admin</NavLink>}
        </nav>
        <div className="ml-auto flex items-center gap-5">
          <Link to="/cart" className="text-[13px] font-medium tracking-wide transition hover:text-[var(--muted)]">
            Cart<sup className="font-display ml-1 text-[11px] font-bold">{count > 0 ? count : ''}</sup>
          </Link>
          <CurrencySelect />
          <ThemeToggle />
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu(!menu)}
              aria-label="Profile menu"
              aria-expanded={menu}
              className="font-display flex h-9 w-9 items-center justify-center rounded-full bg-[var(--text)] text-sm font-bold text-[var(--bg)] transition hover:opacity-80"
            >
              {initial}
            </button>
            {menu && (
              <div className="absolute right-0 top-11 z-30 w-56 rounded-[4px] border border-[var(--border)] bg-[var(--surface)] py-2 shadow-[var(--shadow)]">
                <p className="truncate px-4 pb-1 pt-2 text-sm font-semibold">{user?.display_name || user?.name}</p>
                <p className="truncate px-4 pb-2 text-xs text-[var(--muted)]">{user?.email}</p>
                <div className="border-t border-[var(--border)] pt-1">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm transition hover:bg-[var(--bg)]"
                  >
                    Profile
                  </Link>
                  <button
                    type="button"
                    onClick={out}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 transition hover:bg-[var(--bg)]"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
