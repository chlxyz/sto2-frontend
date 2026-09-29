import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import { CurrencyProvider } from './context/CurrencyContext.jsx'
import AdminOrdersPage from './pages/AdminOrdersPage.jsx'
import AdminProductsPage from './pages/AdminProductsPage.jsx'
import AdminSettingsPage from './pages/AdminSettingsPage.jsx'
import AdminUsersPage from './pages/AdminUsersPage.jsx'
import CartPage from './pages/CartPage.jsx'
import CheckoutPage from './pages/CheckoutPage.jsx'
import OrdersPage from './pages/OrdersPage.jsx'
import OtpPage from './pages/OtpPage.jsx'
import PaymentPage from './pages/PaymentPage.jsx'
import ProductsPage from './pages/ProductsPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import RequireAdmin from './pages/RequireAdmin.jsx'
import RequireAuth from './pages/RequireAuth.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CurrencyProvider>
        <Routes>
          <Route path="/login" element={<OtpPage />} />
          <Route path="/register" element={<Navigate to="/login" replace />} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<RequireAuth><ProductsPage /></RequireAuth>} />
          <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
          <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
          <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
          <Route path="/orders/:id/pay" element={<RequireAuth><PaymentPage /></RequireAuth>} />
          <Route path="/admin/products" element={<RequireAdmin><AdminProductsPage /></RequireAdmin>} />
          <Route path="/admin/users" element={<RequireAdmin><AdminUsersPage /></RequireAdmin>} />
          <Route path="/admin/orders" element={<RequireAdmin><AdminOrdersPage /></RequireAdmin>} />
          <Route path="/admin/settings" element={<RequireAdmin><AdminSettingsPage /></RequireAdmin>} />
          <Route path="*" element={<Navigate to="/products" replace />} />
        </Routes>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
