import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  ShoppingBagIcon,
} from "@heroicons/react/24/outline";

import LoginModal from "./LoginModal";
import RegisterModal from "./RegisterModal";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

export default function Header() {
  const navigate = useNavigate();
  const cartRef = useRef(null);

  const [openUserLogin, setOpenUserLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  /* ===== KERANJANG ===== */
  const [cartOpen, setCartOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [showToast, setShowToast] = useState(false);

  /* ===================== AUTH CHECK ===================== */
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("mn_token");
      const userRaw = localStorage.getItem("mn_user");

      if (token && userRaw) {
        const user = JSON.parse(userRaw);
        setIsLoggedIn(true);
        setUserName(user?.nama || "User");
        fetchPendingOrders(token);
      } else {
        setIsLoggedIn(false);
        setUserName("");
        setPendingOrders([]);
      }
    };

    checkAuth();

    window.addEventListener("authChanged", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("authChanged", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  /* ================= FETCH PESANAN ================= */
  async function fetchPendingOrders(token) {
    try {
      const res = await fetch(`${API_BASE}/pesanan/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) return;

      const pending = (json.data || []).filter((o) =>
        ["MENUNGGU_DP", "MENUNGGU_PELUNASAN"].includes(o.status_pesanan)
      );

      setPendingOrders(pending);
    } catch (err) {
      console.error(err);
    }
  }

  /* ================= EVENT: PESANAN BARU ================= */
  useEffect(() => {
    function onOrderCreated() {
      const token = localStorage.getItem("mn_token");
      if (!token) return;

      fetchPendingOrders(token);
      setCartOpen(true);      // 🔥 buka popup otomatis
      setShowToast(true);     // 🔔 tampilkan notifikasi

      setTimeout(() => setShowToast(false), 3000);
    }

    window.addEventListener("orderCreated", onOrderCreated);
    return () =>
      window.removeEventListener("orderCreated", onOrderCreated);
  }, []);

  /* ================= CLOSE POPUP ================= */
  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setCartOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= LOGOUT ================= */
  function handleLogout() {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    window.dispatchEvent(new Event("authChanged"));
    navigate("/", { replace: true });
  }

  return (
    <header className="bg-[#57595B] border-b border-gray-500 w-full">
      {/* ================= TOP BAR ================= */}
      <div className="w-full px-4 md:px-6 py-3 flex items-center relative">
        <Link to="/" className="text-2xl font-serif text-white">
          MN KONVEKSI
        </Link>

        <div className="flex-1" />

        <div className="flex items-center gap-4 text-gray-200 relative">
          {!isLoggedIn ? (
            <button onClick={() => setOpenUserLogin(true)}>
              Login
            </button>
          ) : (
            <>
              {/* 🛒 KERANJANG */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setCartOpen((v) => !v)}
                  className="relative"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  {pendingOrders.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {pendingOrders.length}
                    </span>
                  )}
                </button>

                {/* POPUP MINI */}
                {cartOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border z-50 text-gray-800">
                    <div className="p-4 border-b font-semibold text-sm">
                      Pesanan Masuk
                    </div>

                    {pendingOrders.length === 0 ? (
                      <div className="p-4 text-sm text-gray-400">
                        Tidak ada pesanan
                      </div>
                    ) : (
                      <ul className="max-h-56 overflow-y-auto">
                        {pendingOrders.map((o) => (
                          <li
                            key={o.id_pesanan}
                            className="p-4 border-b text-sm"
                          >
                            <div className="font-medium">
                              {o.produk?.nama_produk}
                            </div>
                            <div className="text-xs text-gray-500">
                              Status: {o.status_pesanan.replaceAll("_", " ")}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="p-3 border-t">
                      <button
                        onClick={() => navigate("/pesanan-saya")}
                        className="w-full text-sm bg-black text-white py-2 rounded-lg"
                      >
                        Lihat Pesanan Saya
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <span className="text-sm">
                Halo, <strong>{userName}</strong>
              </span>

              <button onClick={handleLogout}>
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* 🔔 TOAST */}
      {showToast && (
        <div className="fixed top-20 right-6 bg-black text-white px-4 py-2 rounded-lg shadow-lg text-sm z-50">
          ✅ Pesanan berhasil masuk ke keranjang
        </div>
      )}

      {/* ================= MODALS ================= */}
      <LoginModal
        open={openUserLogin}
        onClose={() => setOpenUserLogin(false)}
        role="user"
        onOpenRegister={() => {
          setOpenUserLogin(false);
          setOpenRegister(true);
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        onOpenLogin={() => {
          setOpenRegister(false);
          setOpenUserLogin(true);
        }}
      />
    </header>
  );
}
