// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@iconify/react";
import { adminService } from "../../services/admin/dashboardService";
import { authService } from "../../services/api";

/* ================= UTIL FUNCTIONS ================= */
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
  primary: {
    gradient: "from-indigo-600 to-purple-600",
  },
  status: {
    pending: {
      gradient: "from-amber-500 to-orange-500",
      text: "text-amber-600",
      bg: "bg-amber-50",
    },
    processing: {
      gradient: "from-blue-500 to-cyan-500",
      text: "text-blue-600",
      bg: "bg-blue-50",
    },
    completed: {
      gradient: "from-emerald-500 to-teal-500",
      text: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    revenue: {
      gradient: "from-purple-500 to-violet-600",
      text: "text-purple-600",
      bg: "bg-purple-50",
    },
  },
  card: {
    blue: "bg-white border border-gray-200",
    green: "bg-white border border-gray-200",
    purple: "bg-white border border-gray-200",
    amber: "bg-white border border-gray-200",
  },
};

/* ================= PAGE COMPONENT ================= */
export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ================= FETCH DATA ================= */
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch user data
      try {
        const userData = await authService.me();
        setUser(userData.data);
      } catch (err) {
        console.log("Using cached user data");
        const storedUser = localStorage.getItem("mn_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }

      // Fetch dashboard stats
      const statsData = await adminService.getDashboardStats();
      setStats(statsData.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Gagal memuat data dashboard. Silakan refresh halaman.");

      // Fallback data untuk development
      setStats({
        total_pesanan: 124,
        menunggu_pembayaran: 12,
        diproses: 8,
        selesai: 24,
        total_pendapatan: 35200000,
        revenue_bulanan: [
          { bulan: "Jan", total: 12000000 },
          { bulan: "Feb", total: 18000000 },
          { bulan: "Mar", total: 24000000 },
          { bulan: "Apr", total: 35200000 },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  /* ================= ERROR STATE ================= */
  if (error) {
    return (
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon icon="mdi:alert-circle" className="text-white text-2xl" />
          </div>
          <h2 className="text-xl font-semibold text-red-700 mb-2">
            Terjadi Kesalahan
          </h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-shadow"
          >
            <Icon icon="mdi:refresh" className="text-lg" />
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  /* ================= DATA PREPARATION ================= */
  const statusData = [
    {
      name: "Menunggu Pembayaran",
      value: stats?.menunggu_pembayaran || 0,
      color: "#f59e0b",
      gradient: COLORS.status.pending.gradient,
    },
    {
      name: "Diproses",
      value: stats?.diproses || 0,
      color: "#3b82f6",
      gradient: COLORS.status.processing.gradient,
    },
    {
      name: "Selesai",
      value: stats?.selesai || 0,
      color: "#10b981",
      gradient: COLORS.status.completed.gradient,
    },
  ];

  const revenueData = stats?.revenue_bulanan || [
    { bulan: "Jan", total: 12000000 },
    { bulan: "Feb", total: 18000000 },
    { bulan: "Mar", total: 24000000 },
    { bulan: "Apr", total: stats?.total_pendapatan || 0 },
  ];

  /* ================= STAT CARDS ================= */
  const statCards = [
    {
      title: "Total Pesanan",
      value: stats?.total_pesanan || 0,
      change: "+12%",
      trend: "up",
      icon: "mdi:package-variant",
      gradient: COLORS.status.processing.gradient,
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/admin/orders",
    },
    {
      title: "Menunggu Pembayaran",
      value: stats?.menunggu_pembayaran || 0,
      change: "-5%",
      trend: "down",
      icon: "mdi:clock-outline",
      gradient: COLORS.status.pending.gradient,
      textColor: "text-amber-600",
      bgColor: "bg-amber-50",
      link: "/admin/orders?status=menunggu_pembayaran",
    },
    {
      title: "Dalam Produksi",
      value: stats?.diproses || 0,
      change: "+8%",
      trend: "up",
      icon: "mdi:factory",
      gradient: COLORS.primary.gradient,
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
      link: "/admin/orders?status=diproses",
    },
    {
      title: "Total Pendapatan",
      value: formatIDR(stats?.total_pendapatan || 0),
      change: "+18%",
      trend: "up",
      icon: "mdi:cash-multiple",
      gradient: COLORS.status.revenue.gradient,
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50",
      link: "/admin/laporan",
    },
  ];

  /* ================= QUICK ACTIONS ================= */
  const quickActions = [
    {
      title: "Tambah Produk",
      description: "Buat produk baru",
      icon: "mdi:plus-circle",
      gradient: COLORS.primary.gradient,
      link: "/admin/products/new",
    },
    {
      title: "Buat Laporan",
      description: "Generate laporan bulanan",
      icon: "mdi:chart-box",
      gradient: COLORS.status.revenue.gradient,
      link: "/admin/laporan",
    },
    {
      title: "Kelola Pesanan",
      description: "Lihat semua pesanan",
      icon: "mdi:clipboard-list",
      gradient: COLORS.status.processing.gradient,
      link: "/admin/orders",
    },
    {
      title: "Kelola Pengguna",
      description: "Lihat data pengguna",
      icon: "mdi:account-cog",
      gradient: COLORS.status.pending.gradient,
      link: "/admin/users",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Admin MN Konveksi
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Selamat datang,{" "}
            <span className="font-semibold text-indigo-600">
              {user?.nama || "Admin"}
            </span>
            ! 👋
            <span className="ml-3 px-3 py-1 bg-indigo-50 text-indigo-600 text-xs rounded-full font-medium">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </p>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              </div>
              <div
                className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} text-white shadow-md`}
              >
                <Icon icon={card.icon} className="text-xl" />
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <div
                  className={`px-2 py-1 rounded-lg ${card.bgColor} ${card.textColor} text-xs font-medium flex items-center gap-1`}
                >
                  {card.trend === "up" ? (
                    <Icon icon="mdi:trending-up" className="text-xs" />
                  ) : (
                    <Icon icon="mdi:trending-down" className="text-xs" />
                  )}
                  {card.change}
                </div>
                <span className="text-xs text-gray-500">vs bulan lalu</span>
              </div>
              <Link
                to={card.link}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                Detail
                <Icon icon="mdi:arrow-right" className="text-sm" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Pendapatan Bulanan
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Total: {formatIDR(stats?.total_pendapatan || 0)}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <span className="text-xs px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full font-medium">
                Bulan Berjalan
              </span>
            </div>
          </div>
          <div className="h-72 min-h-[288px] flex items-center justify-center">
            {/* Simple Bar Chart Implementation tanpa recharts */}
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 flex items-end justify-between px-4">
                {revenueData.map((item, index) => {
                  const maxValue = Math.max(...revenueData.map((d) => d.total));
                  const heightPercentage = (item.total / maxValue) * 100;

                  return (
                    <div key={index} className="flex flex-col items-center">
                      <div className="text-xs text-gray-500 mb-2">
                        {item.bulan}
                      </div>
                      <div className="relative">
                        <div
                          className="w-12 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all duration-500"
                          style={{
                            height: `${heightPercentage}%`,
                            minHeight: "20px",
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-700">
                            {formatNumber(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="h-px bg-gray-200 mt-4"></div>
            </div>
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
                Total: {stats?.total_pesanan || 0} pesanan
              </p>
            </div>
          </div>
          <div className="h-72 min-h-[288px]">
            {/* Simple Pie Chart Implementation */}
            <div className="flex flex-col lg:flex-row items-center justify-center h-full">
              {/* Pie Chart Visualization */}
              <div className="relative w-48 h-48 mb-6 lg:mb-0 lg:mr-8">
                {statusData.map((item, index, array) => {
                  const total = array.reduce((sum, d) => sum + d.value, 0);
                  const percentage = total > 0 ? (item.value / total) * 100 : 0;
                  const startAngle = array
                    .slice(0, index)
                    .reduce(
                      (sum, d) =>
                        sum + (total > 0 ? (d.value / total) * 360 : 0),
                      0
                    );

                  return (
                    <div
                      key={index}
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(${
                          item.color
                        } ${startAngle}deg, ${item.color} ${
                          startAngle + percentage * 3.6
                        }deg, transparent ${
                          startAngle + percentage * 3.6
                        }deg, transparent 360deg)`,
                        clipPath: `circle(50% at 50% 50%)`,
                      }}
                    />
                  );
                })}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
                    <span className="text-lg font-bold text-gray-900">
                      {stats?.total_pesanan || 0}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-4">
                {statusData.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {item.value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${
                              (item.value / (stats?.total_pesanan || 1)) * 100
                            }%`,
                            backgroundColor: item.color,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <Icon icon="mdi:lightning-bolt" className="text-gray-400 text-xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Link
                key={index}
                to={action.link}
                className="group p-4 rounded-xl border border-gray-200 hover:border-transparent hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`bg-gradient-to-r ${action.gradient} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md`}
                  >
                    <Icon icon={action.icon} className="text-xl" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 group-hover:text-indigo-600">
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

        {/* System Status */}
        <div className="bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 rounded-2xl p-6 text-white shadow-lg">
          <h3 className="text-lg font-semibold mb-6">Status Sistem</h3>
          <div className="space-y-4">
            {[
              {
                label: "API Server",
                status: "Online",
                icon: "mdi:server",
                color: "bg-emerald-500",
              },
              {
                label: "Database",
                status: "Online",
                icon: "mdi:database",
                color: "bg-emerald-500",
              },
              {
                label: "Storage",
                status: "85%",
                icon: "mdi:harddisk",
                color: "bg-amber-500",
              },
              {
                label: "Cache",
                status: "Optimal",
                icon: "mdi:memory",
                color: "bg-blue-500",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white/10 rounded-lg backdrop-blur-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                    <Icon icon={item.icon} className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-gray-300">{item.status}</p>
                  </div>
                </div>
                <div
                  className={`w-3 h-3 ${item.color} rounded-full animate-pulse`}
                ></div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-300">Pesanan/hari</span>
              <span className="font-semibold">
                {Math.round((stats?.total_pesanan || 0) / 30)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
