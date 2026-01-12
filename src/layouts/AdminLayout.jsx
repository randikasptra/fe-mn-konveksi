import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HomeIcon,
  ShoppingBagIcon,
  CubeIcon,
  ChartBarIcon,
  UsersIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: "Pesanan baru #ORD-001", time: "2 menit lalu", read: false },
    { id: 2, message: "Pelunasan diterima #ORD-005", time: "1 jam lalu", read: false },
    { id: 3, message: "Stok produk 'Kaos Polos' hampir habis", time: "3 jam lalu", read: true },
  ]);
  const location = useLocation();
  const navigate = useNavigate();

  // Get user data from localStorage
  const user = JSON.parse(localStorage.getItem("mn_user") || "{}");

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard", icon: HomeIcon },
    { name: "Pesanan", href: "/admin/orders", icon: ShoppingBagIcon },
    { name: "Produk", href: "/admin/products", icon: CubeIcon },
    { name: "Pelanggan", href: "/admin/users", icon: UsersIcon },
    { name: "Laporan", href: "/admin/laporan", icon: ChartBarIcon },
    { name: "Transaksi", href: "/admin/transactions", icon: CurrencyDollarIcon },
    { name: "Pengaturan", href: "/admin/settings", icon: Cog6ToothIcon },
  ];

  const handleLogout = () => {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    navigate("/login");
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })));
  };

  // Close mobile sidebar when clicking outside
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const currentPage = navigation.find((nav) => nav.href === location.pathname)?.name || "Dashboard";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HTML Head Metadata untuk Icons */}
      <head>
        {/* Favicon untuk berbagai ukuran */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#4f46e5" />
        <meta name="msapplication-TileColor" content="#4f46e5" />
        <meta name="theme-color" content="#ffffff" />
        
        {/* Open Graph Tags untuk social media */}
        <meta property="og:title" content="MN Konveksi - Admin Panel" />
        <meta property="og:description" content="Sistem manajemen konveksi dan produksi" />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:url" content="https://admin.mnkonveksi.com" />
        <meta name="twitter:card" content="summary_large_image" />
        
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Apple Touch Icons */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="MN Konveksi" />
      </head>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar untuk Desktop & Mobile */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:inset-auto`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">MN</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">MN Konveksi</h1>
                <p className="text-xs text-gray-500">Admin Panel</p>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 border-r-4 border-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? "text-indigo-600" : "text-gray-500"}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-indigo-600 font-semibold">
                  {user?.nama?.charAt(0) || "A"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.nama || "Admin"}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Keluar"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:pl-64 transition-all duration-300 ${sidebarOpen ? "" : ""}`}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden text-gray-500 hover:text-gray-700 mr-3"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              {/* Breadcrumb */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-gray-400">/</span>
                <span className="text-sm font-medium text-gray-900">{currentPage}</span>
              </div>

              {/* Search Bar */}
              <div className="hidden md:block ml-6">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari pesanan, produk, pelanggan..."
                    className="pl-10 pr-4 py-2 w-64 lg:w-80 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                  className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <BellIcon className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {unreadCount > 0 && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">Notifikasi</h3>
                        <button
                          onClick={markAllAsRead}
                          className="text-sm text-indigo-600 hover:text-indigo-800"
                        >
                          Tandai semua terbaca
                        </button>
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0 ${
                            !notification.read ? "bg-blue-50" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                        </div>
                      ))}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100">
                      <Link
                        to="/admin/notifications"
                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Lihat semua notifikasi
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="hidden lg:flex items-center space-x-4 text-sm">
                <div className="px-3 py-1.5 bg-green-50 text-green-700 rounded-lg">
                  <span className="font-semibold">12</span> Pesanan Baru
                </div>
                <div className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg">
                  <span className="font-semibold">Rp 5.2jt</span> Pendapatan
                </div>
              </div>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
                    <span className="text-white font-semibold text-sm">
                      {user?.nama?.charAt(0) || "A"}
                    </span>
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.nama || "Admin"}
                    </p>
                    <p className="text-xs text-gray-500">Administrator</p>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="font-medium text-gray-900">{user?.nama || "Admin"}</p>
                      <p className="text-sm text-gray-500 truncate">{user?.email || "admin@example.com"}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/admin/profile"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <UserGroupIcon className="w-4 h-4" />
                        Profil Saya
                      </Link>
                      <Link
                        to="/admin/settings"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <Cog6ToothIcon className="w-4 h-4" />
                        Pengaturan
                      </Link>
                      <div className="border-t border-gray-100 my-1"></div>
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        Keluar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{currentPage}</h1>
            <p className="text-gray-600">
              {currentPage === "Dashboard" && "Ringkasan aktivitas dan statistik sistem"}
              {currentPage === "Pesanan" && "Kelola semua pesanan dan transaksi pelanggan"}
              {currentPage === "Produk" && "Kelola katalog produk dan stok"}
              {currentPage === "Pelanggan" && "Data pelanggan dan riwayat transaksi"}
              {currentPage === "Laporan" && "Analisis dan laporan penjualan"}
              {currentPage === "Transaksi" && "Riwayat pembayaran dan transaksi keuangan"}
              {currentPage === "Pengaturan" && "Konfigurasi sistem dan preferensi"}
            </p>
          </div>

          {/* Page Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[calc(100vh-200px)]">
            {children}
          </div>

          {/* Footer */}
          <footer className="mt-8 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} MN Konveksi Admin Panel v1.0 • 
              <span className="mx-2">•</span>
              <Link to="/admin/help" className="text-indigo-600 hover:text-indigo-800">
                Bantuan
              </Link>
              <span className="mx-2">•</span>
              <Link to="/admin/privacy" className="text-indigo-600 hover:text-indigo-800">
                Kebijakan Privasi
              </Link>
              <span className="mx-2">•</span>
              <Link to="/admin/terms" className="text-indigo-600 hover:text-indigo-800">
                Syarat & Ketentuan
              </Link>
            </p>
          </footer>
        </main>
      </div>

      {/* Floating Action Button untuk Mobile */}
      <button
        onClick={() => setMobileSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
    </div>
  );
};

export default AdminLayout;