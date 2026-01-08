// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts
import CustomerLayout from "./layouts/CustomerLayout";
import AdminLayout from "./pages/admin/AdminLayout";
import CheckoutLayout from "./layouts/CheckoutLayout";

/* ================= CUSTOMER PAGES ================= */
import Home from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import Checkout from "./pages/customer/Checkout";
import Payment from "./pages/customer/Payment";
import OrderConfirmation from "./pages/customer/OrderConfirmation";
import PesananSaya from "./pages/customer/PesananSaya";

/* ================= ADMIN PAGES ================= */
import AdminLoginPage from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import LaporanAdmin from "./pages/admin/LaporanAdmin";

/* ================= ERROR PAGES ================= */
import NotFound from "./pages/errors/NotFound";
import Unauthorized from "./pages/errors/Unauthorized";

/* ================= PLACEHOLDER ================= */
const PlaceholderPage = ({ title }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">{title}</h1>
      <p className="text-gray-600">Halaman dalam pengembangan</p>
    </div>
  </div>
);

/* ================= ROUTE GUARDS ================= */
function PrivateAdmin({ children }) {
  const token = localStorage.getItem("mn_token");
  const userRaw = localStorage.getItem("mn_user");

  if (!token) return <Navigate to="/admin/login" replace />;

  try {
    const user = JSON.parse(userRaw || "{}");
    const role = (user?.role || "").toLowerCase();
    if (!role.includes("admin")) return <Navigate to="/" replace />;
  } catch {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

function PrivateUser({ children }) {
  const token = localStorage.getItem("mn_token");
  if (!token) return <Navigate to="/" replace />;
  return children;
}

/* ================= MAIN APP ================= */
export default function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { background: "#363636", color: "#fff" },
          success: {
            style: { background: "#10B981" },
          },
          error: {
            style: { background: "#EF4444" },
          },
        }}
      />

      <Routes>
        {/* ================= CUSTOMER ROUTES ================= */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="produk" element={<Products />} />
          <Route path="produk/:id" element={<ProductDetail />} />
          <Route path="layanan" element={<PlaceholderPage title="Layanan" />} />
          <Route
            path="tentang"
            element={<PlaceholderPage title="Tentang Kami" />}
          />
          <Route path="kontak" element={<PlaceholderPage title="Kontak" />} />
          <Route
            path="keranjang"
            element={
              <PrivateUser>
                <Cart />
              </PrivateUser>
            }
          />
          <Route
            path="pesanan-saya"
            element={
              <PrivateUser>
                <PesananSaya />
              </PrivateUser>
            }
          />
          <Route
            path="profil"
            element={
              <PrivateUser>
                <PlaceholderPage title="Profil" />
              </PrivateUser>
            }
          />
          <Route
            path="favorit"
            element={
              <PrivateUser>
                <PlaceholderPage title="Favorit" />
              </PrivateUser>
            }
          />
        </Route>

        {/* ================= CHECKOUT FLOW ROUTES ================= */}
        <Route
          path="/checkout"
          element={
            <PrivateUser>
              <CheckoutLayout />
            </PrivateUser>
          }
        >
          <Route index element={<Checkout />} />
          <Route path="payment" element={<Payment />} />
          <Route path="confirmation" element={<OrderConfirmation />} />
        </Route>

        {/* ================= ADMIN ROUTES ================= */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <PrivateAdmin>
              <AdminLayout />
            </PrivateAdmin>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<OrdersAdmin />} />
          <Route path="products" element={<ProductsAdmin />} />
          <Route path="laporan" element={<LaporanAdmin />} />
        </Route>

        {/* ================= ERROR ROUTES ================= */}
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
