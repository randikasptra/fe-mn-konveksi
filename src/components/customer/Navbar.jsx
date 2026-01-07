// src/components/customer/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  ShoppingBagIcon, 
  UserCircleIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  XMarkIcon 
} from "@heroicons/react/24/outline";
import LoginModal from "../auth/LoginModal";
import RegisterModal from "../auth/RegisterModal";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartRef = useRef(null);
  const profileRef = useRef(null);

  // State untuk modals
  const [openLogin, setOpenLogin] = useState(false);
  const [openRegister, setOpenRegister] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State untuk user
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false); // 🔴 PERBAIKI: Hapus satu = di sini

  // State untuk cart
  const [cartOpen, setCartOpen] = useState(false);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");

  // State untuk search
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ================= AUTH CHECK ================= */
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("mn_token");
      const userRaw = localStorage.getItem("mn_user");

      if (token && userRaw) {
        try {
          const user = JSON.parse(userRaw);
          setIsLoggedIn(true);
          setUserName(user?.nama || "Pelanggan");
          setUserEmail(user?.email || "");
          fetchPendingOrders(token);
        } catch (err) {
          console.error("Error parsing user data:", err);
          clearAuth();
        }
      } else {
        clearAuth();
      }
    };

    checkAuth();

    // Listen for auth changes
    window.addEventListener("authChanged", checkAuth);
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("authChanged", checkAuth);
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  /* ================= FETCH PENDING ORDERS ================= */
  async function fetchPendingOrders(token) {
    try {
      const res = await fetch(`${API_BASE}/pesanan/me`, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const json = await res.json();
      const pending = (json.data || []).filter((o) =>
        ["MENUNGGU_DP", "MENUNGGU_PELUNASAN"].includes(o.status_pesanan)
      );

      setPendingOrders(pending);
      setCartCount(pending.length);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setPendingOrders([]);
      setCartCount(0);
    }
  }

  /* ================= ORDER CREATED EVENT ================= */
  useEffect(() => {
    function handleOrderCreated() {
      const token = localStorage.getItem("mn_token");
      if (token) {
        fetchPendingOrders(token);
        showNotificationMessage("🎉 Pesanan berhasil ditambahkan!");
      }
    }

    function showNotificationMessage(message) {
      setNotificationMessage(message);
      setShowNotification(true);
      setTimeout(() => {
        setShowNotification(false);
      }, 3000);
    }

    window.addEventListener("orderCreated", handleOrderCreated);

    // Auto show notification on certain pages
    if (location.pathname.includes("/checkout")) {
      showNotificationMessage("✅ Checkout berhasil! Lihat status pesanan Anda.");
    }

    return () => {
      window.removeEventListener("orderCreated", handleOrderCreated);
    };
  }, [location]);

  /* ================= CLOSE DROPDOWNS ON CLICK OUTSIDE ================= */
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= CLEAR AUTH ================= */
  function clearAuth() {
    setIsLoggedIn(false);
    setUserName("");
    setUserEmail("");
    setPendingOrders([]);
    setCartCount(0);
  }

  /* ================= LOGOUT ================= */
  function handleLogout() {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    clearAuth();
    window.dispatchEvent(new Event("authChanged"));
    navigate("/");
    
    // Show logout notification
    setNotificationMessage("👋 Berhasil logout. Sampai jumpa!");
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  }

  /* ================= HANDLE SEARCH ================= */
  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produk?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  /* ================= NAVIGATION LINKS ================= */
  const navLinks = [
    { name: "Beranda", path: "/" },
    { name: "Produk", path: "/produk" },
    { name: "Layanan", path: "/layanan" },
    { name: "Tentang Kami", path: "/tentang" },
    { name: "Kontak", path: "/kontak" },
  ];

  const profileLinks = [
    { name: "Profil Saya", path: "/profil", icon: "👤" },
    { name: "Pesanan Saya", path: "/pesanan-saya", icon: "📦" },
    { name: "Favorit", path: "/favorit", icon: "❤️" },
    { name: "Pengaturan", path: "/pengaturan", icon: "⚙️" },
  ];

  // 🔴 PERBAIKI: Hapus bagian CSS injection dan ganti dengan style inline atau CSS modules

  return (
    <>
      {/* ================= NOTIFICATION TOAST ================= */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in">
          <div className="bg-[#57595B] text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
            <span>{notificationMessage}</span>
            <button 
              onClick={() => setShowNotification(false)}
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ================= NAVBAR ================= */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          {/* ===== TOP BAR ===== */}
          <div className="flex items-center justify-between h-16">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#57595B] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">MN</span>
              </div>
              <span className="text-xl font-serif font-bold text-[#57595B]">
                MN Konveksi
              </span>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-colors ${
                    location.pathname === link.path
                      ? "text-[#57595B] border-b-2 border-[#57595B]"
                      : "text-gray-600 hover:text-[#57595B]"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-4">
              {/* SEARCH BUTTON */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 text-gray-600 hover:text-[#57595B]"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>

              {/* CART */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setCartOpen(!cartOpen)}
                  className="relative p-2 text-gray-600 hover:text-[#57595B]"
                >
                  <ShoppingBagIcon className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* CART DROPDOWN */}
                {cartOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-semibold text-gray-800">Pesanan Aktif</h3>
                      <p className="text-xs text-gray-500">Pesanan yang memerlukan tindakan</p>
                    </div>

                    <div className="max-h-72 overflow-y-auto">
                      {pendingOrders.length === 0 ? (
                        <div className="p-6 text-center">
                          <ShoppingBagIcon className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                          <p className="text-gray-500 text-sm">Belum ada pesanan aktif</p>
                          <Link
                            to="/produk"
                            className="inline-block mt-2 text-sm text-[#57595B] hover:underline"
                            onClick={() => setCartOpen(false)}
                          >
                            Lihat Produk
                          </Link>
                        </div>
                      ) : (
                        pendingOrders.map((order) => (
                          <div
                            key={order.id_pesanan}
                            className="p-4 border-b hover:bg-gray-50"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-sm">
                                  {order.produk?.nama_produk || "Produk"}
                                </h4>
                                <p className="text-xs text-gray-500 mt-1">
                                  ID: {order.id_pesanan}
                                </p>
                              </div>
                              <span className={`px-2 py-1 rounded text-xs ${
                                order.status_pesanan === "MENUNGGU_DP"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}>
                                {order.status_pesanan.replaceAll("_", " ")}
                              </span>
                            </div>
                            <div className="mt-2 flex justify-between items-center">
                              <span className="text-sm font-semibold">
                                Rp {order.total_harga?.toLocaleString() || "0"}
                              </span>
                              <Link
                                to={`/pesanan-saya/${order.id_pesanan}`}
                                className="text-xs text-[#57595B] hover:underline"
                                onClick={() => setCartOpen(false)}
                              >
                                Detail
                              </Link>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {pendingOrders.length > 0 && (
                      <div className="p-4 border-t">
                        <Link
                          to="/pesanan-saya"
                          className="block w-full text-center py-2 bg-[#57595B] text-white rounded-lg hover:bg-[#3a3c3e] transition-colors text-sm"
                          onClick={() => setCartOpen(false)}
                        >
                          Lihat Semua Pesanan
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* USER PROFILE / LOGIN */}
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100"
                  >
                    <UserCircleIcon className="w-6 h-6 text-gray-600" />
                    <span className="hidden md:inline text-sm font-medium">
                      {userName.split(" ")[0]}
                    </span>
                    <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                  </button>

                  {/* PROFILE DROPDOWN */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border z-50">
                      <div className="p-4 border-b">
                        <p className="font-semibold text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      </div>
                      
                      <div className="p-2">
                        {profileLinks.map((link) => (
                          <Link
                            key={link.path}
                            to={link.path}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-sm"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              setMobileMenuOpen(false);
                            }}
                          >
                            <span>{link.icon}</span>
                            <span>{link.name}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="p-3 border-t">
                        <button
                          onClick={() => {
                            setProfileMenuOpen(false);
                            handleLogout();
                          }}
                          className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-3"
                        >
                          <span>🚪</span>
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setOpenLogin(true)}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#57595B] text-white rounded-lg hover:bg-[#3a3c3e] transition-colors"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Masuk</span>
                </button>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="w-6 h-6" />
                ) : (
                  <Bars3Icon className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>

          {/* ===== SEARCH BAR ===== */}
          {searchOpen && (
            <div className="py-4 border-t">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari produk (contoh: kemeja, jaket, seragam)..."
                  className="w-full px-4 py-3 pr-12 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#57595B]"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-[#57595B]"
                >
                  <MagnifyingGlassIcon className="w-5 h-5" />
                </button>
              </form>
            </div>
          )}

          {/* ===== MOBILE MENU ===== */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t py-4">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                      location.pathname === link.path
                        ? "bg-[#57595B] text-white"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                {!isLoggedIn ? (
                  <div className="px-4 pt-4 border-t">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setOpenLogin(true);
                      }}
                      className="w-full py-3 bg-[#57595B] text-white rounded-lg mb-2"
                    >
                      Masuk
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setOpenRegister(true);
                      }}
                      className="w-full py-3 border border-[#57595B] text-[#57595B] rounded-lg"
                    >
                      Daftar
                    </button>
                  </div>
                ) : (
                  <div className="px-4 pt-4 border-t">
                    <div className="flex items-center gap-3 mb-4 p-2">
                      <UserCircleIcon className="w-10 h-10 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-800">{userName}</p>
                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                      </div>
                    </div>
                    
                    {profileLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.name}</span>
                      </Link>
                    ))}
                    
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 text-sm flex items-center gap-3 mt-2"
                    >
                      <span className="text-lg">🚪</span>
                      <span>Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ================= MODALS ================= */}
      <LoginModal
        open={openLogin}
        onClose={() => setOpenLogin(false)}
        role="user"
        onOpenRegister={() => {
          setOpenLogin(false);
          setOpenRegister(true);
        }}
        onSuccess={() => {
          setIsLoggedIn(true);
          const userRaw = localStorage.getItem("mn_user");
          if (userRaw) {
            try {
              const user = JSON.parse(userRaw);
              setUserName(user?.nama || "Pelanggan");
              setUserEmail(user?.email || "");
            } catch (err) {
              console.error("Error parsing user data:", err);
            }
          }
        }}
      />

      <RegisterModal
        open={openRegister}
        onClose={() => setOpenRegister(false)}
        onOpenLogin={() => {
          setOpenRegister(false);
          setOpenLogin(true);
        }}
        onSuccess={() => {
          setOpenRegister(false);
          setOpenLogin(true);
        }}
      />

      {/* 🔴 PERBAIKI: Tambahkan style inline untuk animasi */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}