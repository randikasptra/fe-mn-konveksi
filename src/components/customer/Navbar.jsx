// src/components/customer/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

export default function CustomerNavbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const cartRef = useRef(null);
  const profileRef = useRef(null);
  const searchRef = useRef(null);

  // State untuk modals
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // State untuk user
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

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
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        const json = await res.json();
        const pending = (json.data || []).filter((o) =>
          ["MENUNGGU_DP", "MENUNGGU_PELUNASAN"].includes(o.status_pesanan)
        );
        setPendingOrders(pending);
        setCartCount(pending.length);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
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
      setTimeout(() => setShowNotification(false), 3000);
    }

    window.addEventListener("orderCreated", handleOrderCreated);

    if (location.pathname.includes("/checkout")) {
      showNotificationMessage(
        "✅ Checkout berhasil! Lihat status pesanan Anda."
      );
    }

    return () => {
      window.removeEventListener("orderCreated", handleOrderCreated);
    };
  }, [location]);

  /* ================= CLICK OUTSIDE HANDLER ================= */
  useEffect(() => {
    function handleClickOutside(event) {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setCartOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
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

    setNotificationMessage("👋 Berhasil logout. Sampai jumpa!");
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  }

  /* ================= SEARCH ================= */
  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/produk?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  }

  /* ================= NAVIGATION ================= */
  const navLinks = [
    { name: "Beranda", path: "/", icon: "mdi:home" },
    { name: "Produk", path: "/produk", icon: "mdi:tshirt-crew" },
    { name: "Layanan", path: "/layanan", icon: "mdi:toolbox" },
    { name: "Tentang", path: "/tentang", icon: "mdi:information" },
    { name: "Kontak", path: "/kontak", icon: "mdi:phone" },
  ];
const profileLinks = [
  { name: "Profil Saya", path: "/profil", icon: "mdi:account" },
  {
    name: "Pesanan Saya",
    path: "/pesanan-saya",
    icon: "mdi:package-variant",
  },];
  return (
    <>
      {/* NOTIFICATION TOAST */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl shadow-2xl backdrop-blur-sm bg-white/10 flex items-center gap-3">
            <span>{notificationMessage}</span>
            <button
              onClick={() => setShowNotification(false)}
              className="text-white/80 hover:text-white"
            >
              <Icon icon="mdi:close" />
            </button>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          {/* TOP BAR */}
          <div className="flex items-center justify-between h-20">
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Icon icon="mdi:needle" className="text-white text-xl" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="hidden md:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-700 to-purple-700 bg-clip-text text-transparent">
                  MN KONVEKSI
                </h1>
                <p className="text-xs text-gray-500">Premium Tailoring</p>
              </div>
            </Link>

            {/* DESKTOP NAVIGATION */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    location.pathname === link.path
                      ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100"
                      : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon icon={link.icon} className="text-lg" />
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              {/* SEARCH */}
              <div className="relative" ref={searchRef}>
                {searchOpen ? (
                  <form
                    onSubmit={handleSearch}
                    className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border p-2"
                  >
                    <div className="relative">
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Cari produk atau layanan..."
                        className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        autoFocus
                      />
                      <Icon
                        icon="mdi:magnify"
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
                      />
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl"
                  >
                    <Icon icon="mdi:magnify" className="text-xl" />
                  </button>
                )}
              </div>

              {/* CART */}
              <div className="relative" ref={cartRef}>
                <button
                  onClick={() => setCartOpen(!cartOpen)}
                  className="relative p-2.5 text-gray-500 hover:text-indigo-600 hover:bg-gray-100 rounded-xl"
                >
                  <Icon icon="mdi:shopping-outline" className="text-xl" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                      {cartCount}
                    </span>
                  )}
                </button>

                {/* CART DROPDOWN */}
                {cartOpen && (
                  <div className="absolute right-0 mt-2 w-96 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">Pesanan Aktif</h3>
                        <Icon icon="mdi:package-variant" className="text-xl" />
                      </div>
                      <p className="text-indigo-100 text-sm">
                        Pesanan yang memerlukan tindakan
                      </p>
                    </div>

                    <div className="max-h-80 overflow-y-auto">
                      {pendingOrders.length === 0 ? (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Icon
                              icon="mdi:package-variant-closed"
                              className="text-gray-400 text-2xl"
                            />
                          </div>
                          <p className="text-gray-500">
                            Belum ada pesanan aktif
                          </p>
                          <button
                            onClick={() => {
                              navigate("/produk");
                              setCartOpen(false);
                            }}
                            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                          >
                            Jelajahi Produk
                          </button>
                        </div>
                      ) : (
                        pendingOrders.map((order) => (
                          <div
                            key={order.id_pesanan}
                            className="p-4 border-b hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                                <Icon
                                  icon="mdi:package-variant"
                                  className="text-indigo-600"
                                />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium text-gray-900">
                                      {order.produk?.nama_produk || "Produk"}
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">
                                      ID: {order.id_pesanan}
                                    </p>
                                  </div>
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                                      order.status_pesanan === "MENUNGGU_DP"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-blue-100 text-blue-800"
                                    }`}
                                  >
                                    {order.status_pesanan.replaceAll("_", " ")}
                                  </span>
                                </div>
                                <div className="mt-3 flex justify-between items-center">
                                  <span className="text-sm font-bold text-gray-900">
                                    Rp{" "}
                                    {order.total_harga?.toLocaleString() || "0"}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigate(
                                        `/pesanan-saya/${order.id_pesanan}`
                                      );
                                      setCartOpen(false);
                                    }}
                                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                                  >
                                    Lihat Detail
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {pendingOrders.length > 0 && (
                      <div className="p-4 border-t">
                        <button
                          onClick={() => {
                            navigate("/pesanan-saya");
                            setCartOpen(false);
                          }}
                          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                        >
                          Lihat Semua Pesanan
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* USER PROFILE */}
              {isLoggedIn ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {userName.split(" ")[0]}
                      </p>
                      <p className="text-xs text-gray-500 truncate w-32">
                        {userEmail}
                      </p>
                    </div>
                    <Icon icon="mdi:chevron-down" className="text-gray-400" />
                  </button>

                  {/* PROFILE DROPDOWN */}
                  {profileMenuOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border z-50 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                            {userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">
                              {userName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {userEmail}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        {profileLinks.map((link) => (
                          <button
                            key={link.path}
                            onClick={() => {
                              navigate(link.path);
                              setProfileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-sm text-gray-700 transition-colors"
                          >
                            <Icon
                              icon={link.icon}
                              className="text-gray-500 text-lg"
                            />
                            <span>{link.name}</span>
                          </button>
                        ))}
                      </div>

                      <div className="p-3 border-t">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg text-sm transition-colors"
                        >
                          <Icon icon="mdi:logout" className="text-lg" />
                          <span>Keluar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden lg:flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-5 py-2.5 text-gray-700 hover:text-indigo-600 font-medium"
                  >
                    Masuk
                  </button>
                  <button
                    onClick={() => navigate("/register")}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
                  >
                    Daftar
                  </button>
                </div>
              )}

              {/* MOBILE MENU BUTTON */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2.5 text-gray-500 hover:text-indigo-600"
              >
                <Icon
                  icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"}
                  className="text-2xl"
                />
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t">
              <div className="space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => {
                      navigate(link.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${
                      location.pathname === link.path
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-100"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon icon={link.icon} className="text-xl" />
                    <span className="font-medium">{link.name}</span>
                  </button>
                ))}

                {!isLoggedIn ? (
                  <div className="px-4 pt-6 border-t space-y-3">
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/login");
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium"
                    >
                      Masuk ke Akun
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        navigate("/register");
                      }}
                      className="w-full py-3.5 border-2 border-indigo-600 text-indigo-600 rounded-xl font-medium"
                    >
                      Daftar Akun Baru
                    </button>
                  </div>
                ) : (
                  <div className="px-4 pt-6 border-t">
                    <div className="flex items-center gap-3 mb-6 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {userName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{userName}</p>
                        <p className="text-sm text-gray-500">{userEmail}</p>
                      </div>
                    </div>

                    <div className="space-y-1">
                      {profileLinks.map((link) => (
                        <button
                          key={link.path}
                          onClick={() => {
                            navigate(link.path);
                            setMobileMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-gray-700"
                        >
                          <Icon
                            icon={link.icon}
                            className="text-gray-500 text-xl"
                          />
                          <span>{link.name}</span>
                        </button>
                      ))}

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-red-600 mt-4"
                      >
                        <Icon icon="mdi:logout" className="text-xl" />
                        <span>Keluar</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}