import React, { useEffect, useState, useMemo } from "react";
import { toast } from "react-toastify";
import pesananService from "../../services/orderService";
import OrderKelolaModal from "../../components/admin/OrderKelolaModal";

// Icons
import {
  FaBox,
  FaClock,
  FaCog,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaFilter,
  FaSync,
  FaUser,
  FaCalendar,
  FaShoppingCart,
  FaMoneyBillWave,
  FaArrowRight,
  FaMoneyBill,
  FaSpinner,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [paymentFilter, setPaymentFilter] = useState("ALL");

  // ================= FETCH DATA =================
  async function fetchOrders() {
    setLoading(true);
    setError("");

    const res = await pesananService.getAllPesanan();
    if (!res.success) {
      setError(res.message || "Gagal memuat pesanan");
      toast.error(res.message || "Gagal memuat pesanan");
      setLoading(false);
      return;
    }

    setOrders(res.data || []);
    setLoading(false);
  }

  useEffect(() => {
    fetchOrders();
  }, []);

  // ================= FILTER LOGIC =================
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const matchesSearch =
        searchTerm === "" ||
        order.user?.nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.produk?.nama_produk
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        order.id_pesanan?.toString().includes(searchTerm);

      // Status filter
      const matchesStatus =
        statusFilter === "ALL" || order.status_pesanan === statusFilter;

      // Payment filter
      const paymentLabel = getPaymentLabel(order);
      const matchesPayment =
        paymentFilter === "ALL" || paymentLabel === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [orders, searchTerm, statusFilter, paymentFilter]);

  // ================= STATISTICS =================
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(
      (o) => o.status_pesanan === "MENUNGGU_PEMBAYARAN"
    ).length;
    const processing = orders.filter(
      (o) => o.status_pesanan === "DIPROSES"
    ).length;
    const completed = orders.filter(
      (o) => o.status_pesanan === "SELESAI"
    ).length;
    const cancelled = orders.filter(
      (o) => o.status_pesanan === "DIBATALKAN"
    ).length;

    const unpaid = orders.filter(
      (o) => getPaymentLabel(o) === "BELUM BAYAR"
    ).length;
    const dpOnly = orders.filter(
      (o) => getPaymentLabel(o) === "DP SAJA"
    ).length;
    const paid = orders.filter((o) => getPaymentLabel(o) === "LUNAS").length;

    const totalRevenue = orders
      .filter((o) => o.status_pesanan === "SELESAI")
      .reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);

    return {
      total,
      pending,
      processing,
      completed,
      cancelled,
      unpaid,
      dpOnly,
      paid,
      totalRevenue,
    };
  }, [orders]);

  // ================= HELPER FUNCTIONS =================
  function formatRupiah(num) {
    return new Intl.NumberFormat("id-ID").format(num || 0);
  }

  function getStatusLabel(status) {
    switch (status) {
      case "MENUNGGU_PEMBAYARAN":
        return "Menunggu Pembayaran";
      case "DIPROSES":
        return "Diproses";
      case "SELESAI":
        return "Selesai";
      case "DIBATALKAN":
        return "Dibatalkan";
      default:
        return status;
    }
  }

  function getStatusIcon(status) {
    switch (status) {
      case "MENUNGGU_PEMBAYARAN":
        return <FaClock className="text-blue-500" />;
      case "DIPROSES":
        return <FaCog className="text-orange-500" />;
      case "SELESAI":
        return <FaCheckCircle className="text-green-500" />;
      case "DIBATALKAN":
        return <FaTimesCircle className="text-red-500" />;
      default:
        return <FaBox />;
    }
  }

  function formatDateShort(date) {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function getSisaTagihan(order) {
    if (!order.transaksi || order.transaksi.length === 0) {
      return order.total_harga;
    }

    const paid = order.transaksi.reduce(
      (sum, t) => sum + (Number(t.jumlah) || 0),
      0
    );

    return Math.max(0, order.total_harga - paid);
  }

  function getPaymentLabel(order) {
    if (order.status_pesanan === "SELESAI") {
      return "LUNAS";
    }

    const transaksi = order.transaksi || [];

    if (transaksi.length === 0) {
      return "BELUM BAYAR";
    }

    const totalPaid = transaksi
      .filter((t) => t.midtrans_status === "settlement")
      .reduce((sum, t) => sum + (Number(t.jumlah) || 0), 0);

    const hasPending = transaksi.some((t) => t.midtrans_status === "pending");

    if (totalPaid >= order.total_harga) {
      return "LUNAS";
    }

    if (totalPaid > 0 && totalPaid < order.total_harga) {
      return "DP SAJA";
    }

    if (hasPending) {
      return "MENUNGGU PEMBAYARAN";
    }

    return "BELUM BAYAR";
  }

  function getPaymentColor(paymentLabel) {
    switch (paymentLabel) {
      case "LUNAS":
        return "bg-green-50 text-green-700";
      case "DP SAJA":
        return "bg-yellow-50 text-yellow-700";
      case "MENUNGGU PEMBAYARAN":
        return "bg-blue-50 text-blue-700";
      case "BELUM BAYAR":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  function getStatusColor(status) {
    switch (status) {
      case "SELESAI":
        return "bg-green-50 text-green-700";
      case "DIPROSES":
        return "bg-orange-50 text-orange-700";
      case "MENUNGGU_PEMBAYARAN":
        return "bg-blue-50 text-blue-700";
      case "DIBATALKAN":
        return "bg-red-50 text-red-700";
      default:
        return "bg-gray-50 text-gray-700";
    }
  }

  function canKelola(order) {
    return ["MENUNGGU_PEMBAYARAN", "DIPROSES"].includes(order.status_pesanan);
  }

  function handleKelola(order) {
    setSelectedOrder(order);
  }

  // ================= RENDER =================
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data pesanan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 rounded-xl p-6 max-w-2xl mx-auto">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 text-xl mr-4" />
            <div>
              <h3 className="text-red-800 font-medium text-lg">
                Gagal memuat data
              </h3>
              <p className="text-red-600 mt-1">{error}</p>
              <button
                onClick={fetchOrders}
                className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4">
                <FaBox className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Pesanan
              </h1>
            </div>
            <p className="text-gray-600 ml-14">
              Kelola semua pesanan pelanggan dari satu tempat
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="flex items-center px-5 py-2.5 bg-white text-gray-700 rounded-xl hover:bg-gray-50 active:scale-95 transition-all duration-200 font-medium"
          >
            <FaSync className="mr-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl flex items-center justify-center">
              <FaShoppingCart className="text-blue-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.total}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Pesanan</h3>
          <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex-1 text-center">
              <div className="text-gray-900 font-bold">{stats.processing}</div>
              <div className="text-gray-500 text-xs mt-1">Berjalan</div>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex-1 text-center">
              <div className="text-gray-900 font-bold">{stats.completed}</div>
              <div className="text-gray-500 text-xs mt-1">Selesai</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-50 rounded-xl flex items-center justify-center">
              <FaMoneyBillWave className="text-green-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.paid}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">
            Pembayaran Lunas
          </h3>
          <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
            <div className="flex-1 text-center">
              <div className="text-gray-900 font-bold">{stats.unpaid}</div>
              <div className="text-red-500 text-xs mt-1">Belum Bayar</div>
            </div>
            <div className="w-px h-8 bg-gray-100"></div>
            <div className="flex-1 text-center">
              <div className="text-gray-900 font-bold">{stats.dpOnly}</div>
              <div className="text-yellow-500 text-xs mt-1">DP Saja</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-xl flex items-center justify-center">
              <FaClock className="text-orange-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              {stats.pending}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Pending</h3>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-gray-900 font-bold">{stats.processing}</div>
            <div className="text-gray-500 text-xs mt-1">Diproses</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl flex items-center justify-center">
              <FaMoneyBill className="text-purple-600 text-lg" />
            </div>
            <span className="text-2xl font-bold text-gray-900">
              Rp {formatRupiah(stats.totalRevenue)}
            </span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-gray-900 font-bold">{stats.cancelled}</div>
            <div className="text-gray-500 text-xs mt-1">Dibatalkan</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari pesanan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-5 py-4 bg-white rounded-2xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 transition-all"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-12 pr-10 py-4 bg-white rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 appearance-none"
              >
                <option value="ALL">Semua Status</option>
                <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                <option value="DIPROSES">Diproses</option>
                <option value="SELESAI">Selesai</option>
                <option value="DIBATALKAN">Dibatalkan</option>
              </select>
            </div>

            <div className="relative">
              <FaMoneyBillWave className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="pl-12 pr-10 py-4 bg-white rounded-2xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-20 appearance-none"
              >
                <option value="ALL">Semua Pembayaran</option>
                <option value="LUNAS">Lunas</option>
                <option value="DP SAJA">DP Saja</option>
                <option value="MENUNGGU PEMBAYARAN">Menunggu Pembayaran</option>
                <option value="BELUM BAYAR">Belum Bayar</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results count */}
        <div className="text-gray-500 text-sm">
          Menampilkan{" "}
          <span className="font-medium text-gray-900">
            {filteredOrders.length}
          </span>{" "}
          dari{" "}
          <span className="font-medium text-gray-900">{orders.length}</span>{" "}
          pesanan
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-5 px-7 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Pesanan
                </th>
                <th className="text-left py-5 px-7 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Customer
                </th>
                <th className="text-left py-5 px-7 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Produk
                </th>
                <th className="text-left py-5 px-7 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Total
                </th>
                <th className="text-left py-5 px-7 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left py-5 px-7 font-medium text-gray-500 text-sm uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-16 px-7 text-center">
                    <div className="text-gray-400 max-w-md mx-auto">
                      <FaBox className="text-5xl mx-auto mb-5 opacity-20" />
                      <p className="text-lg font-medium text-gray-500 mb-2">
                        Tidak ada pesanan ditemukan
                      </p>
                      <p className="text-gray-400">
                        Coba ubah filter pencarian atau pastikan data tersedia
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const paymentLabel = getPaymentLabel(order);
                  const sisa = getSisaTagihan(order);

                  return (
                    <tr
                      key={order.id_pesanan}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-5 px-7">
                        <div>
                          <div className="font-bold text-gray-900 mb-1">
                            #{order.id_pesanan}
                          </div>
                          <div className="flex items-center text-gray-500 text-sm">
                            <FaCalendar className="mr-2" />
                            {formatDateShort(order.tanggal_pesan)}
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-7">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-4">
                            <FaUser className="text-gray-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {order.user?.nama || "-"}
                            </div>
                            <div className="text-gray-500 text-sm">
                              Qty: {order.qty}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-5 px-7">
                        <div className="font-medium text-gray-900">
                          {order.produk?.nama_produk || "-"}
                        </div>
                        <div className="text-gray-500 text-sm mt-1">
                          Rp {formatRupiah(order.harga_satuan)}/pcs
                        </div>
                      </td>

                      <td className="py-5 px-7">
                        <div className="space-y-2">
                          <div className="font-bold text-gray-900 text-lg">
                            Rp {formatRupiah(order.total_harga)}
                          </div>
                          <div
                            className={`text-xs px-3 py-1 rounded-full ${getPaymentColor(
                              paymentLabel
                            )}`}
                          >
                            <div className="flex items-center">
                              <FaMoneyBillWave className="mr-2" />
                              {paymentLabel}
                            </div>
                          </div>
                          {paymentLabel === "DP SAJA" && (
                            <div className="text-xs text-red-600">
                              Sisa: Rp {formatRupiah(sisa)}
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-5 px-7">
                        <div
                          className={`text-sm px-4 py-2 rounded-full inline-flex items-center ${getStatusColor(
                            order.status_pesanan
                          )}`}
                        >
                          {getStatusIcon(order.status_pesanan)}
                          <span className="ml-3 font-medium">
                            {getStatusLabel(order.status_pesanan)}
                          </span>
                        </div>
                      </td>

                      <td className="py-5 px-7">
                        <button
                          onClick={() => handleKelola(order)}
                          disabled={!canKelola(order)}
                          className={`flex items-center px-5 py-2.5 rounded-xl transition-all ${
                            canKelola(order)
                              ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/25"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <span className="mr-3">Kelola</span>
                          <FaArrowRight />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* OrderKelolaModal */}
      {selectedOrder && (
        <OrderKelolaModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onBatalkan={async (order) => {
            const confirmCancel = window.confirm(
              `Batalkan pesanan #${order.id_pesanan}?\nPesanan ini akan dibatalkan.`
            );

            if (!confirmCancel) return;

            const res = await pesananService.updateStatusPesanan(
              order.id_pesanan,
              "DIBATALKAN"
            );

            if (!res.success) {
              toast.error(res.message || "Gagal membatalkan pesanan");
              return;
            }

            toast.success("Pesanan berhasil dibatalkan");

            setOrders((prev) =>
              prev.map((o) =>
                o.id_pesanan === order.id_pesanan
                  ? { ...o, status_pesanan: "DIBATALKAN" }
                  : o
              )
            );

            setSelectedOrder(null);
          }}
          onSelesaikan={async (order) => {
            const confirmFinish = window.confirm(
              `Selesaikan pesanan #${order.id_pesanan}?\nAksi ini tidak dapat dibatalkan.`
            );

            if (!confirmFinish) return;

            const res = await pesananService.updateStatusPesanan(
              order.id_pesanan,
              "SELESAI"
            );

            if (!res.success) {
              toast.error(res.message || "Gagal menyelesaikan pesanan");
              return;
            }

            toast.success("Pesanan berhasil diselesaikan");

            setOrders((prev) =>
              prev.map((o) =>
                o.id_pesanan === order.id_pesanan
                  ? { ...o, status_pesanan: "SELESAI" }
                  : o
              )
            );

            setSelectedOrder(null);
          }}
          formatCurrency={(v) =>
            `Rp ${new Intl.NumberFormat("id-ID").format(v || 0)}`
          }
          formatDate={formatDateShort}
        />
      )}
    </div>
  );
}
