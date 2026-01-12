import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  Calendar,
  Filter,
  FileText,
  FileSpreadsheet,
  Loader2,
  Download,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import laporanService from "../../services/laporanService";

// =====================
// UTIL
// =====================
const formatCurrency = (n) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(n || 0);

const LaporanAdmin = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState({ pdf: false, excel: false });

  const [summary, setSummary] = useState(null);
  const [list, setList] = useState([]);

  // =====================
  // LOAD LAPORAN
  // =====================
  const loadLaporan = async () => {
    if (!from || !to) {
      toast.error("Harap pilih rentang tanggal terlebih dahulu");
      return;
    }

    setLoading(true);

    try {
      const res = await laporanService.getLaporanPesananJson({
        from,
        to,
        status,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      setSummary(res.data.summary);
      setList(res.data.data);
      toast.success("Laporan berhasil dimuat");
    } catch (error) {
      toast.error("Gagal memuat laporan: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // EXPORT LAPORAN
  // =====================
  const exportLaporan = async (format) => {
    if (!from || !to) {
      toast.error("Pilih rentang tanggal terlebih dahulu");
      return;
    }

    const exportKey = format;
    setExporting((prev) => ({ ...prev, [exportKey]: true }));

    try {
      const res = await laporanService.cetakLaporanPesanan({
        from,
        to,
        status,
        format,
      });

      if (!res.success) {
        toast.error(res.message);
        return;
      }

      laporanService.downloadFile(
        res.data,
        `laporan-pesanan-${from}-${to}.${format === "pdf" ? "pdf" : "xlsx"}`
      );

      toast.success(`Laporan ${format.toUpperCase()} berhasil diunduh`);
    } catch (error) {
      toast.error("Gagal mengekspor laporan: " + error.message);
    } finally {
      setExporting((prev) => ({ ...prev, [exportKey]: false }));
    }
  };

  // =====================
  // RESET FILTER
  // =====================
  const resetFilter = () => {
    setFrom("");
    setTo("");
    setStatus("");
    setSummary(null);
    setList([]);
  };

  // =====================
  // FORMAT TANGGAL
  // =====================
  const formatDateDisplay = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-xl">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Laporan Pesanan
            </h1>
          </div>
          <p className="text-sm text-gray-500">
            Pantau dan analisis performa penjualan Anda
          </p>
        </div>

        <div className="flex items-center gap-2">
          {summary && (
            <span className="text-sm text-gray-500">
              {formatDateDisplay(from)} - {formatDateDisplay(to)}
            </span>
          )}
        </div>
      </div>

      {/* FILTER CARD */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Tanggal Mulai */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Mulai
              </div>
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Tanggal Akhir */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tanggal Akhir
              </div>
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
          </div>

          {/* Filter Status */}
          <div className="md:col-span-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter Status
              </div>
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
            >
              <option value="">Semua Status</option>
              <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
              <option value="DIPROSES">Diproses</option>
              <option value="SELESAI">Selesai</option>
              <option value="DIBATALKAN">Dibatalkan</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="md:col-span-3 flex items-end gap-2">
            <button
              onClick={loadLaporan}
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat...
                </>
              ) : (
                "Tampilkan Laporan"
              )}
            </button>

            <button
              onClick={resetFilter}
              className="p-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors"
              title="Reset filter"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <SummaryCard
            title="Total Pesanan"
            value={summary.total_pesanan}
            icon={<FileText className="w-5 h-5" />}
            color="bg-blue-50 text-blue-600"
            trend="total"
          />
          <SummaryCard
            title="Total Transaksi"
            value={summary.total_transaksi}
            icon={<BarChart3 className="w-5 h-5" />}
            color="bg-green-50 text-green-600"
          />
          <SummaryCard
            title="Nilai Pesanan"
            value={formatCurrency(summary.total_nilai_pesanan)}
            icon={<span className="text-lg">📦</span>}
            color="bg-purple-50 text-purple-600"
          />
          <SummaryCard
            title="Pendapatan"
            value={formatCurrency(summary.total_pendapatan)}
            icon={<span className="text-lg">💰</span>}
            color="bg-emerald-50 text-emerald-600"
            trend="revenue"
          />
          <SummaryCard
            title="Sisa Tagihan"
            value={formatCurrency(summary.total_sisa_tagihan)}
            icon={<span className="text-lg">📝</span>}
            color="bg-orange-50 text-orange-600"
          />
        </div>
      )}

      {/* EXPORT BUTTONS */}
      {(summary || list.length > 0) && (
        <div className="flex justify-end gap-3">
          <button
            onClick={() => exportLaporan("pdf")}
            disabled={exporting.pdf}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl transition-colors disabled:opacity-50 font-medium"
          >
            {exporting.pdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {exporting.pdf ? "Mengekspor..." : "PDF"}
          </button>

          <button
            onClick={() => exportLaporan("excel")}
            disabled={exporting.excel}
            className="flex items-center gap-2 px-4 py-2.5 bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 rounded-xl transition-colors disabled:opacity-50 font-medium"
          >
            {exporting.excel ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4" />
            )}
            {exporting.excel ? "Mengekspor..." : "Excel"}
          </button>
        </div>
      )}

      {/* DATA TABLE */}
      {list.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <Th>No</Th>
                  <Th>Customer</Th>
                  <Th>Produk</Th>
                  <Th className="text-center">Qty</Th>
                  <Th className="text-center">Total</Th>
                  <Th className="text-center">Pembayaran</Th>
                  <Th className="text-center">Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {list.map((item, i) => {
                  const bayar =
                    item.pembayaran?.jenis === "DP"
                      ? item.total / 2
                      : item.pembayaran?.jenis === "FULL"
                      ? item.pembayaran.jumlah
                      : 0;

                  return (
                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                      <Td className="text-gray-500">{i + 1}</Td>
                      <Td>
                        <div className="font-medium text-gray-900">
                          {item.customer}
                        </div>
                      </Td>
                      <Td>
                        <div className="font-medium text-gray-900">
                          {item.produk}
                        </div>
                      </Td>
                      <Td className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg font-medium">
                          {item.qty}
                        </span>
                      </Td>
                      <Td className="text-center font-bold text-gray-900">
                        {formatCurrency(item.total)}
                      </Td>
                      <Td>
                        <div className="text-center space-y-1">
                          <div
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              item.pembayaran?.jenis === "FULL"
                                ? "bg-green-50 text-green-700"
                                : item.pembayaran?.jenis === "DP"
                                ? "bg-blue-50 text-blue-700"
                                : item.pembayaran?.jenis === "PELUNASAN"
                                ? "bg-purple-50 text-purple-700"
                                : "bg-gray-50 text-gray-700"
                            }`}
                          >
                            {item.pembayaran?.jenis || "-"}
                          </div>
                          <div className="text-xs font-medium text-gray-700">
                            {formatCurrency(bayar)}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {item.pembayaran?.status || "-"}
                          </div>
                        </div>
                      </Td>
                      <Td className="text-center">
                        <StatusBadge status={item.status} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          {summary && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Menampilkan{" "}
                  <span className="font-semibold">{list.length}</span> pesanan
                </div>
                <div className="text-sm font-medium text-gray-900">
                  Total: {formatCurrency(summary.total_nilai_pesanan)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* EMPTY STATE */}
      {!loading && !summary && list.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Belum Ada Laporan
                </h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Pilih rentang tanggal dan klik "Tampilkan Laporan" untuk
                  melihat data
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// =====================
// KOMPONEN PENDUKUNG
// =====================
const SummaryCard = ({ title, value, icon, color, trend }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-2">
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <p className="text-sm text-gray-500 mb-1">{title}</p>
    <p className="text-xl font-bold text-gray-900">{value}</p>
    {trend && (
      <div className="mt-2 pt-2 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          {trend === "total"
            ? "Total semua pesanan"
            : trend === "revenue"
            ? "Pendapatan bersih"
            : ""}
        </span>
      </div>
    )}
  </div>
);

const Th = ({ children, className = "" }) => (
  <th
    className={`px-6 py-4 text-left text-sm font-medium text-gray-500 ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td className={`px-6 py-4 ${className}`}>{children}</td>
);

const StatusBadge = ({ status }) => {
  const statusConfig = {
    MENUNGGU_PEMBAYARAN: {
      bg: "bg-yellow-50",
      text: "text-yellow-700",
      label: "Menunggu Pembayaran",
    },
    DIPROSES: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      label: "Diproses",
    },
    SELESAI: {
      bg: "bg-green-50",
      text: "text-green-700",
      label: "Selesai",
    },
    DIBATALKAN: {
      bg: "bg-red-50",
      text: "text-red-700",
      label: "Dibatalkan",
    },
  };

  const config = statusConfig[status] || {
    bg: "bg-gray-50",
    text: "text-gray-700",
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default LaporanAdmin;
