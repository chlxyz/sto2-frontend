// Must match the backend default in config/admin.php (ADMIN_EMAIL).
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@gmail.com'

export const isAdmin = (user) => user?.email === ADMIN_EMAIL
