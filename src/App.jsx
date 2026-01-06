// src/App.jsx
import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/common/Header";

/* ================= CUSTOMER PAGES ================= */
import Catalog from "./pages/customer/Home";
import Products from "./pages/customer/Products";
import ProductDetail from "./pages/customer/ProductDetail";
import PesananSaya from "./pages/customer/PesananSaya"; // ✅ NEW

/* ================= ADMIN PAGES ================= */
import AdminLoginPage from "./pages/admin/AdminLogin";
import Dashboard from "./pages/admin/Dashboard";
import OrdersAdmin from "./pages/admin/OrdersAdmin";
import ProductsAdmin from "./pages/admin/ProductsAdmin";
import LaporanAdmin from "./pages/admin/LaporanAdmin";

/* ================= ADMIN LAYOUT ================= */
import AdminLayout from "./pages/admin/AdminLayout";

/* ================= HELPERS ================= */
function getToken() {
  return localStorage.getItem("mn_token") || null;
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem("mn_user") || "null");
  } catch {
    return null;
  }
}

/* ================= ROUTE GUARDS ================= */
function PrivateAdmin({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token) return <Navigate to="/admin/login" replace />;

  const role = (user?.role || "").toLowerCase();
  if (!role.includes("admin")) return <Navigate to="/" replace />;

  return children;
}

function PrivateUser({ children }) {
  const token = getToken();
  if (!token) return <Navigate to="/" replace />;
  return children;
}

/* ================= APP ================= */
export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header hanya tampil di CUSTOMER AREA */}
      {!isAdminRoute && <Header />}

      {isAdminRoute ? (
        /* ================= ADMIN AREA ================= */
        <main className="min-h-screen">
          <Routes>
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

            <Route
              path="/admin/*"
              element={<Navigate to="/admin/dashboard" replace />}
            />
          </Routes>
        </main>
      ) : (
        /* ================= CUSTOMER AREA ================= */
        <main className="container mx-auto px-4 py-6">
          <Routes>
            <Route path="/" element={<Catalog />} />
            <Route path="/produk" element={<Products />} />
            <Route path="/product/:slug" element={<ProductDetail />} />

            {/* ✅ PESANAN SAYA */}
            <Route
              path="/pesanan-saya"
              element={
                <PrivateUser>
                  <PesananSaya />
                </PrivateUser>
              }
            />

            {/* (OPSIONAL) PROFILE */}
            <Route
              path="/profile"
              element={
                <PrivateUser>
                  <div>
                    <h2 className="text-2xl font-bold">
                      Profile Pelanggan
                    </h2>
                    <p className="text-sm text-gray-600">
                      Halaman profile / riwayat pesanan
                    </p>
                  </div>
                </PrivateUser>
              }
            />

            <Route
              path="*"
              element={<div>404 — Halaman tidak ditemukan</div>}
            />
          </Routes>
        </main>
      )}
    </div>
  );
}
