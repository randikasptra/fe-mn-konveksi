import React, { useMemo, useState } from "react";

/* ===================== Helpers ===================== */
const formatIDR = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(v || 0);

/* ===================== Main Page ===================== */
export default function LaporanAdmin() {
  /* ===== STATE FILTER ===== */
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("Semua");

  /* ===== MOCK DATA (nanti bisa diganti fetch API) ===== */
  const reports = [
    {
      id: 1,
      date: "2025-12-08",
      code: "ORD-20251208-001",
      customer: "Budi Setiawan",
      product: "Seragam Kantor",
      total: 2500000,
      status: "Selesai",
      payment: "Transfer Bank",
    },
    {
      id: 2,
      date: "2025-12-07",
      code: "ORD-20251207-004",
      customer: "Sari Dewi",
      product: "Jaket Komunitas",
      total: 1750000,
      status: "Selesai",
      payment: "Virtual Account",
    },
    {
      id: 3,
      date: "2025-12-06",
      code: "ORD-20251206-010",
      customer: "Rama Pratama",
      product: "PDL Perusahaan",
      total: 4200000,
      status: "Dibatalkan",
      payment: "Transfer Bank",
    },
  ];

  /* ===== FILTER DATA ===== */
  const filtered = useMemo(() => {
    return reports.filter((r) => {
      if (status !== "Semua" && r.status !== status) return false;
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });
  }, [reports, startDate, endDate, status]);

  /* ===== STATS ===== */
  const stats = useMemo(() => {
    const total = filtered.length;
    const selesai = filtered.filter((r) => r.status === "Selesai").length;
    const batal = filtered.filter((r) => r.status === "Dibatalkan").length;
    const pendapatan = filtered
      .filter((r) => r.status === "Selesai")
      .reduce((sum, r) => sum + r.total, 0);

    return { total, selesai, batal, pendapatan };
  }, [filtered]);

  /* ===== HANDLER ===== */
  function handleExport(type) {
    alert(`Export ${type} (mock)`);
  }

  /* ===================== RENDER ===================== */
  return (
    <div className="space-y-6">
      {/* ================= Filter ================= */}
      <div className="bg-white border rounded-lg shadow-sm p-5">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Filter Periode Laporan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option>Semua</option>
            <option>Selesai</option>
            <option>Dibatalkan</option>
          </select>

          <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 text-sm">
            Tampilkan Laporan
          </button>
        </div>
      </div>

      {/* ================= Statistik ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Pesanan" value={stats.total} />
        <StatCard
          title="Pesanan Selesai"
          value={stats.selesai}
          color="text-green-600"
        />
        <StatCard
          title="Pesanan Dibatalkan"
          value={stats.batal}
          color="text-red-500"
        />
        <StatCard
          title="Total Pendapatan"
          value={formatIDR(stats.pendapatan)}
          color="text-green-600"
        />
      </div>

      {/* ================= Table ================= */}
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="text-sm font-semibold text-gray-700">
            Detail Laporan Transaksi
          </h3>

          <div className="flex gap-2">
            <button
              onClick={() => handleExport("PDF")}
              className="border rounded-md px-3 py-1 text-xs hover:bg-gray-50"
            >
              Export PDF
            </button>
            <button
              onClick={() => handleExport("Excel")}
              className="border rounded-md px-3 py-1 text-xs hover:bg-gray-50"
            >
              Export Excel
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 border-b">
              <tr>
                <th className="px-5 py-3 text-left">Tanggal</th>
                <th className="text-left">Kode Pesanan</th>
                <th className="text-left">Pelanggan</th>
                <th className="text-left">Produk</th>
                <th className="text-left">Total</th>
                <th className="text-left">Status</th>
                <th className="text-left">Metode Bayar</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="px-5 py-3">{r.date}</td>
                  <td>{r.code}</td>
                  <td>{r.customer}</td>
                  <td>{r.product}</td>
                  <td>{formatIDR(r.total)}</td>
                  <td>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${
                        r.status === "Selesai"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td>{r.payment}</td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-6 text-gray-500">
                    Tidak ada data laporan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ===================== Components ===================== */
function StatCard({ title, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="text-xs text-gray-500">{title}</div>
      <div className={`text-xl font-semibold mt-2 ${color}`}>{value}</div>
    </div>
  );
}
