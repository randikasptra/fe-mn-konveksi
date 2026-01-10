// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MdInventory,
  MdPendingActions,
  MdFactory,
  MdAttachMoney,
  MdAdd,
  MdBarChart,
  MdTrendingUp,
  MdTrendingDown,
  MdCalendarToday,
  MdCheckCircle,
  MdOutlinePayment,
  MdOutlineRefresh,
  MdOutlineArrowForward,
} from "react-icons/md";
import {
  FiUsers,
  FiPackage,
  FiDollarSign,
  FiActivity,
} from "react-icons/fi";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
} from "recharts";

/* ================= UTIL ================= */
const formatIDR = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

/* ================= COLOR SCHEME ================= */
const COLORS = {
  // Primary Colors
  primary: {
    light: "#3b82f6", // Blue-500
    dark: "#1d4ed8",  // Blue-700
    gradient: "from-blue-500 to-indigo-600",
  },
  
  // Status Colors
  status: {
    pending: {
      light: "#f59e0b", // Yellow-500
      dark: "#d97706",  // Yellow-600
      gradient: "from-amber-500 to-orange-500",
    },
    processing: {
      light: "#3b82f6", // Blue-500
      dark: "#1d4ed8",  // Blue-700
      gradient: "from-blue-500 to-cyan-500",
    },
    completed: {
      light: "#10b981", // Green-500
      dark: "#059669",  // Green-600
      gradient: "from-emerald-500 to-teal-500",
    },
    revenue: {
      light: "#8b5cf6", // Purple-500
      dark: "#7c3aed",  // Purple-600
      gradient: "from-purple-500 to-violet-600",
    },
  },
  
  // Card Colors
  card: {
    blue: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100",
    green: "bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100",
    purple: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100",
    amber: "bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100",
    gray: "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-100",
  },
  
  // Text Colors
  text: {
    primary: "text-gray-900",
    secondary: "text-gray-600",
    muted: "text-gray-500",
    white: "text-white",
    blue: "text-blue-600",
    green: "text-emerald-600",
    purple: "text-purple-600",
    amber: "text-amber-600",
  },
};

/* ================= PAGE ================= */
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH USER DATA ================= */
  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("mn_token");
        
        const userRes = await fetch(
          "https://be-mn-konveksi.vercel.app/api/auth/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        
        if (userRes.ok) {
          const userData = await userRes.json();
          setUser(userData.data);
          localStorage.setItem("mn_user", JSON.stringify(userData.data));
        }
      } catch (err) {
        console.error("Gagal fetch user:", err);
        const storedUser = JSON.parse(localStorage.getItem("mn_user") || "{}");
        setUser(storedUser);
      }
    }

    fetchUserData();
  }, []);

  /* ================= FETCH DASHBOARD ================= */
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("mn_token");

        // Fetch dashboard stats
        const res = await fetch(
          "https://be-mn-konveksi.vercel.app/api/pesanan/admin/summary",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal fetch dashboard");

        const json = await res.json();
        setStats(json.data);

      } catch (err) {
        console.error(err);
        setStats(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  /* ================= LOADING & ERROR STATES ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-screen-xl mx-auto w-full">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 text-center">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Data tidak tersedia</h2>
          <p className="text-red-600 mb-4">Gagal memuat data dashboard</p>
          <button 
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <MdOutlineRefresh size={18} />
            Muat Ulang
          </button>
        </div>
      </div>
    );
  }

  /* ================= DATA GRAFIK ================= */
  const statusData = [
    { 
      name: "Menunggu Pembayaran", 
      value: stats.menunggu_pembayaran || 0, 
      color: COLORS.status.pending.light,
      gradient: COLORS.status.pending.gradient
    },
    { 
      name: "Diproses", 
      value: stats.diproses || 0, 
      color: COLORS.status.processing.light,
      gradient: COLORS.status.processing.gradient
    },
    { 
      name: "Selesai", 
      value: stats.selesai || 0, 
      color: COLORS.status.completed.light,
      gradient: COLORS.status.completed.gradient
    },
  ];

  const revenueData = stats.revenue_bulanan || [
    { bulan: "Jan", total: 12000000 },
    { bulan: "Feb", total: 18000000 },
    { bulan: "Mar", total: 24000000 },
    { bulan: "Apr", total: stats.total_pendapatan || 0 },
  ];

  /* ================= STATISTICS ================= */
  const statCards = [
    {
      title: "Total Pesanan",
      value: stats.total_pesanan || 0,
      change: "+12%",
      trend: "up",
      icon: <FiPackage className="text-blue-600" size={24} />,
      color: COLORS.card.blue,
      textColor: COLORS.text.blue,
      iconBg: "bg-blue-100",
      link: "/admin/orders",
    },
    {
      title: "Menunggu Pembayaran",
      value: stats.menunggu_pembayaran || 0,
      change: "-5%",
      trend: "down",
      icon: <MdOutlinePayment className="text-amber-600" size={24} />,
      color: COLORS.card.amber,
      textColor: COLORS.text.amber,
      iconBg: "bg-amber-100",
      link: "/admin/orders",
    },
    {
      title: "Dalam Produksi",
      value: stats.diproses || 0,
      change: "+8%",
      trend: "up",
      icon: <MdFactory className="text-purple-600" size={24} />,
      color: COLORS.card.purple,
      textColor: COLORS.text.purple,
      iconBg: "bg-purple-100",
      link: "/admin/orders",
    },
    {
      title: "Total Pendapatan",
      value: formatIDR(stats.total_pendapatan || 0),
      change: "+18%",
      trend: "up",
      icon: <FiDollarSign className="text-emerald-600" size={24} />,
      color: COLORS.card.green,
      textColor: COLORS.text.green,
      iconBg: "bg-emerald-100",
      link: "/admin/laporan",
    },
  ];

  /* ================= QUICK ACTIONS ================= */
  const quickActions = [
    {
      title: "Tambah Produk",
      description: "Tambah produk baru",
      icon: <MdAdd size={20} />,
      color: `bg-gradient-to-r ${COLORS.primary.gradient}`,
      link: "/admin/products/new",
    },
    {
      title: "Buat Laporan",
      description: "Generate laporan bulanan",
      icon: <MdBarChart size={20} />,
      color: `bg-gradient-to-r ${COLORS.status.revenue.gradient}`,
      link: "/admin/laporan",
    },
    {
      title: "Kelola Pesanan",
      description: "Lihat semua pesanan",
      icon: <MdInventory size={20} />,
      color: `bg-gradient-to-r ${COLORS.status.processing.gradient}`,
      link: "/admin/orders",
    },
    {
      title: "Kelola Pengguna",
      description: "Lihat data pengguna",
      icon: <FiUsers size={20} />,
      color: `bg-gradient-to-r ${COLORS.status.pending.gradient}`,
      link: "/admin/users",
    },
  ];

  return (
    <div className="max-w-screen-xl mx-auto w-full space-y-6 p-4 sm:p-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Selamat datang, {user?.nama || "Admin"}! 👋
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full font-medium">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-3 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold text-sm">
                {user?.nama?.charAt(0) || "A"}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {user?.nama || user?.username || "Admin MN"}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[150px]">
                {user?.email || "admin@mnkonveksi.com"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, index) => (
          <div 
            key={index}
            className={`${card.color} rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold ${card.textColor}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg}`}>
                {card.icon}
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-1">
                {card.trend === "up" ? (
                  <MdTrendingUp className="text-emerald-500" size={16} />
                ) : (
                  <MdTrendingDown className="text-red-500" size={16} />
                )}
                <span className={`text-sm font-medium ${
                  card.trend === "up" ? "text-emerald-600" : "text-red-600"
                }`}>
                  {card.change}
                </span>
                <span className="text-xs text-gray-500 ml-1">dari bulan lalu</span>
              </div>
              <Link 
                to={card.link}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                Lihat
                <MdOutlineArrowForward size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHART SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pendapatan Bulanan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total: {formatIDR(stats.total_pendapatan || 0)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-xs px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
                Bulan Berjalan
              </span>
            </div>
          </div>
          <div className="h-72 min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="bulan" />
                <YAxis tickFormatter={(v) => formatNumber(v)} />
                <Tooltip 
                  formatter={(v) => formatIDR(v)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Status Pesanan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total: {stats.total_pesanan || 0} pesanan
              </p>
            </div>
          </div>
          <div className="h-72 min-h-[288px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} pesanan`, 'Jumlah']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[8, 8, 0, 0]}
                  shape={({ x, y, width, height, index }) => {
                    const colors = statusData.map(item => item.color);
                    return (
                      <g>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={colors[index]} stopOpacity={0.9}/>
                            <stop offset="100%" stopColor={colors[index]} stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <rect 
                          x={x} 
                          y={y} 
                          width={width} 
                          height={height} 
                          fill={`url(#gradient-${index})`}
                          rx={8}
                        />
                      </g>
                    );
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= QUICK ACTIONS & SUMMARY ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Quick Actions
            </h3>
            <FiActivity className="text-gray-400" size={20} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group p-4 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className={`${action.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md`}>
                    {action.icon}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-blue-600">
                      {action.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gradient-to-br from-slate-900 to-gray-800 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-6">Ringkasan Pesanan</h3>
          <div className="space-y-4">
            {[
              { 
                label: "Menunggu Pembayaran", 
                value: stats.menunggu_pembayaran || 0, 
                color: COLORS.status.pending.gradient,
                icon: <MdOutlinePayment size={18} />
              },
              { 
                label: "Dalam Produksi", 
                value: stats.diproses || 0, 
                color: COLORS.status.processing.gradient,
                icon: <MdFactory size={18} />
              },
              { 
                label: "Total Pendapatan", 
                value: formatIDR(stats.total_pendapatan || 0), 
                color: COLORS.status.revenue.gradient,
                icon: <FiDollarSign size={18} />
              },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-r ${item.color} rounded-lg flex items-center justify-center shadow-md`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-2xl font-bold mt-1">{item.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Rata-rata pesanan/hari</span>
              <span className="font-semibold">{Math.round((stats.total_pesanan || 0) / 30)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}