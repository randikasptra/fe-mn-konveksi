// src/App.jsx
import React, { useState, createContext, useContext } from 'react'
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    Outlet,
    useLocation,
} from 'react-router-dom'

// Layouts
import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './pages/admin/AdminLayout'
import CheckoutLayout from './layouts/CheckoutLayout'

/* ================= CUSTOMER PAGES ================= */
import Home from './pages/customer/Home'
import Products from './pages/customer/Products'
import ProductDetail from './pages/customer/ProductDetail'
import Layanan from './pages/customer/Layanan'
import Tentang from './pages/customer/Tentang'
import Kontak from './pages/customer/Kontak'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import Payment from './pages/customer/Payment'
import OrderConfirmation from './pages/customer/OrderConfirmation'
import PesananSaya from './pages/customer/PesananSaya'
import ProfilePage from './pages/customer/ProfilePage'

/* ================= AUTH PAGES ================= */
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'

/* ================= ADMIN PAGES ================= */
import Dashboard from './pages/admin/Dashboard'
import OrdersAdmin from './pages/admin/OrdersAdmin'
import ProductsAdmin from './pages/admin/ProductsAdmin'
import LaporanAdmin from './pages/admin/LaporanAdmin'
import UsersAdmin from './pages/admin/UsersAdmin'
import SettingsAdmin from './pages/admin/SettingsAdmin'
/* ================= ERROR PAGES ================= */
import NotFound from './pages/errors/NotFound'
import Unauthorized from './pages/errors/Unauthorized'

// Import CustomerNavbar
import CustomerNavbar from './components/customer/Navbar'

/* ================= TOAST SYSTEM ================= */
// Buat Toast Context
const ToastContext = createContext()

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now()
    
    // Tambah toast baru
    setToasts(prev => [...prev, { id, message, type }])
    
    // Auto remove setelah duration
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, duration)

    return id // Return ID untuk bisa dismiss manual
  }

  // Helper methods
  const toast = {
    success: (message, duration = 3000) => showToast(message, 'success', duration),
    error: (message, duration = 4000) => showToast(message, 'error', duration),
    info: (message, duration = 3000) => showToast(message, 'info', duration),
    warning: (message, duration = 3000) => showToast(message, 'warning', duration),
    loading: (message) => showToast(message, 'loading', 0), // No auto dismiss untuk loading
    dismiss: (id) => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    },
    promise: async (promise, messages) => {
      const loadingId = toast.loading(messages.loading)
      try {
        const result = await promise
        toast.dismiss(loadingId)
        toast.success(messages.success)
        return result
      } catch (error) {
        toast.dismiss(loadingId)
        toast.error(messages.error || error.message)
        throw error
      }
    }
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border animate-slideIn min-w-[300px] ${
              toast.type === 'success' 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : toast.type === 'warning'
                ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                : toast.type === 'loading'
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}
          >
            {/* Icons */}
            {toast.type === 'success' && (
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-sm">✓</span>
              </div>
            )}
            {toast.type === 'error' && (
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-sm">✕</span>
              </div>
            )}
            {toast.type === 'warning' && (
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm">!</span>
              </div>
            )}
            {toast.type === 'info' && (
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-sm">i</span>
              </div>
            )}
            {toast.type === 'loading' && (
              <div className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
            )}

            {/* Message */}
            <span className="text-sm font-medium flex-1">{toast.message}</span>

            {/* Close Button */}
            {toast.type !== 'loading' && (
              <button
                onClick={() => toast.dismiss(toast.id)}
                className="text-gray-400 hover:text-gray-600 text-lg"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Custom hook untuk pakai toast
export const useToast = () => useContext(ToastContext)

/* ================= PLACEHOLDER ================= */
const PlaceholderPage = ({ title }) => (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center p-8'>
            <h1 className='text-3xl font-bold text-gray-800 mb-4'>{title}</h1>
            <p className='text-gray-600'>Halaman dalam pengembangan</p>
        </div>
    </div>
)

/* ================= ROUTE GUARDS ================= */
function PrivateAdmin({ children }) {
    const token = localStorage.getItem('mn_token')
    const userRaw = localStorage.getItem('mn_user')

    if (!token)
        return (
            <Navigate
                to='/admin/login'
                replace
            />
        )

    try {
        const user = JSON.parse(userRaw || '{}')
        const role = (user?.role || '').toLowerCase()
        if (!role.includes('admin'))
            return (
                <Navigate
                    to='/'
                    replace
                />
            )
    } catch {
        return (
            <Navigate
                to='/admin/login'
                replace
            />
        )
    }

    return children
}

function PrivateUser({ children }) {
    const token = localStorage.getItem('mn_token')
    if (!token)
        return (
            <Navigate
                to='/login'
                replace
            />
        )
    return children
}

/* ================= PUBLIC LAYOUT (tanpa navbar) ================= */
function PublicLayout() {
    const location = useLocation()

    // Jangan tampilkan navbar di halaman login/register
    const hideNavbar =
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/admin/login'

    return (
        <div className='min-h-screen bg-white'>
            {!hideNavbar && <CustomerNavbar />}
            <main>
                <Outlet />
            </main>
        </div>
    )
}

/* ================= MAIN APP ================= */
export default function App() {
    return (
        <Router>
            <ToastProvider>
                <Routes>
                    {/* ================= PUBLIC AUTH ROUTES (tanpa navbar) ================= */}
                    <Route element={<PublicLayout />}>
                        <Route
                            path='/login'
                            element={<LoginPage />}
                        />
                        <Route
                            path='/register'
                            element={<RegisterPage />}
                        />
                        {/* <Route path="/admin/login" element={<AdminLoginPage />} /> */}
                    </Route>

                    {/* ================= CUSTOMER ROUTES (dengan navbar) ================= */}
                    <Route
                        path='/'
                        element={<CustomerLayout />}
                    >
                        <Route
                            index
                            element={<Home />}
                        />
                        <Route
                            path='produk'
                            element={<Products />}
                        />
                        <Route
                            path='produk/:id'
                            element={<ProductDetail />}
                        />
                        <Route
                            path='layanan'
                            element={<Layanan />}
                        />
                        <Route
                            path='tentang'
                            element={<Tentang />}
                        />
                        <Route
                            path='kontak'
                            element={<Kontak />}
                        />

                        {/* Protected Routes - Requires Login */}
                        <Route
                            path='keranjang'
                            element={
                                <PrivateUser>
                                    <Cart />
                                </PrivateUser>
                            }
                        />
                        <Route
                            path='pesanan-saya'
                            element={
                                <PrivateUser>
                                    <PesananSaya />
                                </PrivateUser>
                            }
                        />

                        {/* Profile & Settings - Same Page */}
                        <Route
                            path='profil'
                            element={
                                <PrivateUser>
                                    <ProfilePage />
                                </PrivateUser>
                            }
                        />
                        <Route
                            path='pengaturan'
                            element={
                                <PrivateUser>
                                    <ProfilePage />
                                </PrivateUser>
                            }
                        />

                        {/* Optional: Favorit (if needed in future) */}
                        <Route
                            path='favorit'
                            element={
                                <PrivateUser>
                                    <PlaceholderPage title='Favorit' />
                                </PrivateUser>
                            }
                        />
                    </Route>

                    {/* ================= CHECKOUT FLOW ROUTES ================= */}
                    <Route
                        path='/checkout'
                        element={
                            <PrivateUser>
                                <CheckoutLayout />
                            </PrivateUser>
                        }
                    >
                        <Route
                            index
                            element={<Checkout />}
                        />
                        <Route
                            path='payment'
                            element={<Payment />}
                        />
                        <Route
                            path='confirmation'
                            element={<OrderConfirmation />}
                        />
                    </Route>

                    {/* ================= ADMIN ROUTES ================= */}
                    <Route
                        path='/admin'
                        element={
                            <PrivateAdmin>
                                <AdminLayout />
                            </PrivateAdmin>
                        }
                    >
                        <Route
                            index
                            element={
                                <Navigate
                                    to='dashboard'
                                    replace
                                />
                            }
                        />
                        <Route
                            path='dashboard'
                            element={<Dashboard />}
                        />
                        <Route
                            path='orders'
                            element={<OrdersAdmin />}
                        />
                        <Route
                            path='products'
                            element={<ProductsAdmin />}
                        />
                        <Route
                            path='laporan'
                            element={<LaporanAdmin />}
                        />
                        <Route
                            path='users'
                            element={<UsersAdmin />}
                        />
                        <Route
                            path='settings'
                            element={<SettingsAdmin />} // Tambah route ini
                        />
                        
                    </Route>

                    {/* ================= ERROR ROUTES ================= */}
                    <Route
                        path='/unauthorized'
                        element={<Unauthorized />}
                    />
                    <Route
                        path='*'
                        element={<NotFound />}
                    />
                </Routes>
            </ToastProvider>
        </Router>
    )
}