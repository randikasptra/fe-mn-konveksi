// src/pages/admin/Dashboard.jsx
import React, { useEffect, useState } from "react";
import {
  MdInventory,
  MdPendingActions,
  MdFactory,
  MdAttachMoney,
  MdAdd,
  MdBarChart,
} from "react-icons/md";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

/* ================= UTIL ================= */
const formatIDR = (val) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);

/* ================= PAGE ================= */
export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("mn_user") || "{}");

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH DASHBOARD ================= */
  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("mn_token");

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

  if (loading) return <div className="text-gray-500">Memuat dashboard...</div>;
  if (!stats) return <div className="text-red-500">Data tidak tersedia</div>;

  /* ================= DATA GRAFIK ================= */

  // Grafik status pesanan
  const statusData = [
    { name: "Menunggu DP", value: stats.menunggu_dp },
    { name: "Diproses", value: stats.diproses },
    { name: "Pelunasan", value: stats.menunggu_pelunasan },
    { name: "Selesai", value: stats.selesai },
  ];

  // Grafik pendapatan (dummy jika BE belum kirim per bulan)
  const revenueData = stats.revenue_bulanan || [
    { bulan: "Jan", total: 12000000 },
    { bulan: "Feb", total: 18000000 },
    { bulan: "Mar", total: 24000000 },
    { bulan: "Apr", total: stats.total_pendapatan },
  ];

  return (
    <div className="max-w-screen-xl mx-auto w-full space-y-8">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500">
            Ringkasan aktivitas pesanan & penjualan
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Admin:{" "}
          <span className="font-medium text-gray-800">
            {user.nama || "Admin"}
          </span>
        </div>
      </div>

      {/* ================= STAT CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Pesanan"
          value={stats.total_pesanan}
          subtitle="Semua pesanan"
          icon={<MdInventory size={44} />}
        />
        <StatCard
          title="Menunggu DP"
          value={stats.menunggu_dp}
          subtitle="Pembayaran DP"
          icon={<MdPendingActions size={44} />}
          accent="text-orange-600"
        />
        <StatCard
          title="Diproses"
          value={stats.diproses}
          subtitle="Dalam produksi"
          icon={<MdFactory size={44} />}
        />
        <StatCard
          title="Pendapatan"
          value={formatIDR(stats.total_pendapatan)}
          subtitle="Bulan berjalan"
          icon={<MdAttachMoney size={44} />}
          accent="text-green-600"
          big
        />
      </div>

      {/* ================= GRAFIK ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grafik Status Pesanan */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Grafik Status Pesanan
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Grafik Pendapatan */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            Grafik Pendapatan
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip formatter={(v) => formatIDR(v)} />
              <Line
                type="monotone"
                dataKey="total"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ================= RINGKASAN ================= */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 max-w-md">
        <h3 className="font-semibold text-gray-800">
          Ringkasan Status Pesanan
        </h3>

        <div className="mt-4 space-y-3 text-sm">
          <Row label="Menunggu Pelunasan" value={stats.menunggu_pelunasan} />
          <Row label="Pesanan Selesai" value={stats.selesai} />
          <Row
            label="Total Pendapatan"
            value={formatIDR(stats.total_pendapatan)}
            highlight
          />
        </div>

        <div className="mt-6 flex gap-3">
          <button className="flex-1 bg-black text-white rounded-full px-4 py-2 text-sm flex items-center justify-center gap-2">
            <MdAdd /> Tambah Produk
          </button>
          <button className="border border-gray-300 rounded-full px-4 py-2 text-sm flex items-center gap-2">
            <MdBarChart /> Laporan
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ title, value, subtitle, icon, accent, big }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-md">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-4 flex justify-between items-center">
        <div>
          <div
            className={`${big ? "text-2xl" : "text-3xl"} font-semibold ${
              accent || "text-gray-900"
            }`}
          >
            {value}
          </div>
          <div className={`text-xs mt-1 ${accent || "text-gray-400"}`}>
            {subtitle}
          </div>
        </div>
        <div className="text-gray-300">{icon}</div>
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-medium ${highlight ? "text-green-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}
