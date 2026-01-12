import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import OrderService from "../../services/orderService";
import OrderCard from "../../components/customer/pesanan/OrderCard";

/* ================= MAIN COMPONENT ================= */
export default function PesananSaya() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, order: null });
  const [cancelPaymentModal, setCancelPaymentModal] = useState({
    show: false,
    order: null,
    transaksi: null,
  });

  async function loadOrders() {
    try {
      setError(null);
      const ordersData = await OrderService.getOrders();
      setOrders(ordersData);
    } catch (error) {
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  function openSnap(snapToken) {
    if (typeof window.snap !== "undefined") {
      window.snap.pay(snapToken, {
        onSuccess: function () {
          loadOrders();
        },
        onPending: function () {
          loadOrders();
        },
        onError: function () {
          showToast("error", "Pembayaran gagal, silakan coba lagi");
        },
        onClose: function () {
          loadOrders();
        },
      });
    } else {
      showToast(
        "error",
        "Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman."
      );
    }
  }

  async function handlePay(order, jenis) {
    const pending = order.transaksi?.find(
      (t) => t.midtrans_status === "pending"
    );

    if (pending?.snap_token) {
      openSnap(pending.snap_token);
      return;
    }

    if (!jenis) {
      const transaksi = order.transaksi || [];
      const settledTransactions = transaksi.filter(
        (t) => t.midtrans_status === "settlement"
      );

      if (settledTransactions.length === 0) {
        jenis = "DP";
      } else {
        const totalPaid = settledTransactions.reduce(
          (sum, t) => sum + t.nominal,
          0
        );
        if (totalPaid < order.total_harga) {
          jenis = "PELUNASAN";
        }
      }
    }

    if (!jenis) {
      showToast("error", "Pesanan ini tidak memerlukan pembayaran");
      return;
    }

    try {
      setProcessingId(order.id_pesanan);

      // Hitung nominal berdasarkan jenis
      let nominal;
      if (jenis === "DP") {
        nominal = order.dp_wajib || Math.ceil(order.total_harga * 0.5);
      } else if (jenis === "PELUNASAN") {
        const settledTransactions = (order.transaksi || []).filter(
          (t) => t.midtrans_status === "settlement"
        );
        const totalPaid = settledTransactions.reduce(
          (sum, t) => sum + t.nominal,
          0
        );
        nominal = order.total_harga - totalPaid;
      }

      console.log(`Membuat pembayaran: ${jenis} = Rp ${nominal}`);

      const snapToken = await OrderService.createPayment({
        id_pesanan: order.id_pesanan,
        jenis_pembayaran: jenis,
        order,
      });

      openSnap(snapToken);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setProcessingId(null);
    }
  }

  async function handlePay(order, jenis) {
    const pending = order.transaksi?.find(
      (t) => t.midtrans_status === "pending"
    );

    if (pending?.snap_token) {
      openSnap(pending.snap_token);
      return;
    }

    if (!jenis) {
      const transaksi = order.transaksi || [];
      const settledTransactions = transaksi.filter(
        (t) => t.midtrans_status === "settlement"
      );

      if (settledTransactions.length === 0) {
        jenis = "DP";
      } else {
        const totalPaid = settledTransactions.reduce(
          (sum, t) => sum + t.nominal,
          0
        );
        if (totalPaid < order.total_harga) {
          jenis = "PELUNASAN";
        }
      }
    }

    if (!jenis) {
      showToast("error", "Pesanan ini tidak memerlukan pembayaran");
      return;
    }

    try {
      setProcessingId(order.id_pesanan);
      const snapToken = await OrderService.createPayment({
        id_pesanan: order.id_pesanan,
        jenis_pembayaran: jenis,
        order,
      });
      openSnap(snapToken);
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setProcessingId(null);
    }
  }

  // Helper untuk toast notification
  const showToast = (type, message) => {
    const notification = document.createElement("div");
    notification.className = "fixed top-6 right-6 z-50 animate-slide-in";

    const colors = {
      success: "from-green-600 to-emerald-600",
      error: "from-red-600 to-pink-600",
    };

    const icons = {
      success:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>',
      error:
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>',
    };

    notification.innerHTML = `
      <div class="bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${icons[type]}
        </svg>
        <span class="font-medium">${message}</span>
      </div>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  // Modal handlers untuk delete
  const openDeleteModal = (order) => {
    setDeleteModal({ show: true, order });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ show: false, order: null });
  };

  const handleDeleteOrder = async () => {
    if (!deleteModal.order) return;

    try {
      setDeletingId(deleteModal.order.id_pesanan);

      await OrderService.deleteOrder(deleteModal.order.id_pesanan);

      closeDeleteModal();
      await loadOrders();
      showToast("success", "Pesanan berhasil dihapus");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setDeletingId(null);
    }
  };

  // Modal handlers untuk cancel payment
  const openCancelPaymentModal = (order, transaksi) => {
    setCancelPaymentModal({ show: true, order, transaksi });
  };

  const closeCancelPaymentModal = () => {
    setCancelPaymentModal({ show: false, order: null, transaksi: null });
  };

  const handleCancelPayment = async () => {
    if (!cancelPaymentModal.transaksi) return;

    try {
      setCancellingId(cancelPaymentModal.order.id_pesanan);

      await OrderService.cancelPayment(
        cancelPaymentModal.transaksi.id_transaksi
      );

      closeCancelPaymentModal();
      await loadOrders();
      showToast("success", "Pembayaran berhasil dibatalkan");
    } catch (error) {
      showToast("error", error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const canDeleteOrder = (order) => {
    if (["DIPROSES", "SELESAI"].includes(order.status_pesanan)) {
      return false;
    }

    const hasSettlement = order.transaksi?.some(
      (t) => t.midtrans_status === "settlement"
    );
    if (hasSettlement) {
      return false;
    }

    const validStatuses = ["pending", "expire", "cancel", "deny"];

    if (!order.transaksi || order.transaksi.length === 0) {
      return true;
    }

    const hasInvalidPayment = order.transaksi?.some(
      (t) => t.midtrans_status && !validStatuses.includes(t.midtrans_status)
    );

    return !hasInvalidPayment;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-700">
              Memuat pesanan...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <Icon
              icon="mdi:alert-circle"
              className="text-red-500 text-6xl mx-auto mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="mt-6">
              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors mr-3"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => (window.location.href = "/login")}
                className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getSettledTransaksi = (order) => {
    return (
      order.transaksi?.filter((t) => t.midtrans_status === "settlement") || []
    );
  };

  const stats = {
    total: orders.length,
    waiting: orders.filter((order) => {
      const settledTrans = getSettledTransaksi(order);
      const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
      return (
        order.status_pesanan === "MENUNGGU_PEMBAYARAN" ||
        (order.status_pesanan === "DIPROSES" && totalPaid < order.total_harga)
      );
    }).length,
    processing: orders.filter((order) => {
      const settledTrans = getSettledTransaksi(order);
      const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
      return (
        order.status_pesanan === "DIPROSES" && totalPaid >= order.total_harga
      );
    }).length,
    completed: orders.filter((order) => order.status_pesanan === "SELESAI")
      .length,
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") {
      const settledTrans = getSettledTransaksi(order);
      const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
      return (
        order.status_pesanan === "MENUNGGU_PEMBAYARAN" ||
        (order.status_pesanan === "DIPROSES" && totalPaid < order.total_harga)
      );
    }
    if (activeTab === "processing") {
      return order.status_pesanan === "DIPROSES";
    }
    if (activeTab === "completed") return order.status_pesanan === "SELESAI";
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Icon
                icon="mdi:package-variant-closed"
                className="text-indigo-600 text-2xl"
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
              <p className="text-gray-600">
                Lacak status pesanan dan lakukan pembayaran
              </p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stats.total}
                  </p>
                </div>
                <Icon
                  icon="mdi:package-variant"
                  className="text-3xl text-indigo-500"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Menunggu Pembayaran</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.waiting}
                  </p>
                </div>
                <Icon
                  icon="mdi:cash-clock"
                  className="text-3xl text-yellow-500"
                />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sedang Diproses</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.processing}
                  </p>
                </div>
                <Icon icon="mdi:factory" className="text-3xl text-blue-500" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.completed}
                  </p>
                </div>
                <Icon
                  icon="mdi:check-circle"
                  className="text-3xl text-green-500"
                />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "pending"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Menunggu ({stats.waiting})
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "processing"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Diproses ({stats.processing})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "completed"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Selesai ({stats.completed})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:package-variant-remove"
                className="text-gray-400 text-4xl"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === "all" ? "Belum ada pesanan" : "Tidak ada pesanan"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "all"
                ? "Mulai pesan produk favorit Anda di halaman produk"
                : `Tidak ada pesanan dengan status ${
                    activeTab === "pending"
                      ? "menunggu pembayaran"
                      : activeTab === "processing"
                      ? "diproses"
                      : "selesai"
                  }`}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors"
              >
                Lihat Semua Pesanan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id_pesanan}
                order={order}
                onPay={handlePay}
                onDelete={openDeleteModal}
                onCancelPayment={openCancelPaymentModal}
                canDelete={canDeleteOrder(order)}
                processingId={processingId}
                deletingId={deletingId}
                cancellingId={cancellingId}
              />
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Butuh Bantuan?
              </h3>
              <p className="text-gray-600">
                Hubungi kami jika mengalami kendala dalam proses pesanan atau
                pembayaran.
              </p>
              <div className="mt-3 text-sm text-gray-500">
                <p className="mb-1">📞 Alur Pembayaran:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Bayar DP 50% untuk memulai produksi</li>
                  <li>
                    Pelunasan dapat dilakukan kapan saja sebelum pesanan selesai
                  </li>
                  <li>Produksi dimulai setelah DP diterima</li>
                </ol>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const phoneNumber = "6281234567890";
                  const message =
                    "Halo MN Konveksi, saya butuh bantuan dengan pesanan saya.";
                  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                    message
                  )}`;
                  window.open(url, "_blank");
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center gap-2"
              >
                <Icon icon="mdi:whatsapp" />
                WhatsApp
              </button>
              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-300 flex items-center gap-2"
              >
                <Icon icon="mdi:refresh" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Hapus */}
      {deleteModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="mdi:alert-circle-outline"
                    className="text-red-600 text-2xl"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Hapus Pesanan
                  </h3>
                  <p className="text-gray-600">
                    Konfirmasi penghapusan pesanan
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Apakah Anda yakin ingin menghapus pesanan ini?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    #{deleteModal.order?.id_pesanan}
                  </p>
                  <p className="text-gray-600">
                    {deleteModal.order?.produk?.nama_produk}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    Rp {deleteModal.order?.total_harga?.toLocaleString()}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>Status: {deleteModal.order?.status_pesanan}</p>
                    <p>
                      Tanggal:{" "}
                      {new Date(
                        deleteModal.order?.tanggal_pesan
                      ).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-red-600 mt-3">
                  <Icon
                    icon="mdi:information-outline"
                    className="inline mr-1"
                  />
                  Tindakan ini tidak dapat dibatalkan
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeDeleteModal}
                  disabled={deletingId}
                  className="px-5 py-2.5 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleDeleteOrder}
                  disabled={deletingId}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-xl hover:from-red-700 hover:to-pink-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {deletingId ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Menghapus...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:delete" />
                      Hapus Pesanan
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Cancel Payment */}
      {cancelPaymentModal.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Icon
                    icon="mdi:cash-remove"
                    className="text-orange-600 text-2xl"
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Batalkan Pembayaran
                  </h3>
                  <p className="text-gray-600">
                    Konfirmasi pembatalan transaksi
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Apakah Anda yakin ingin membatalkan pembayaran ini?
                </p>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium text-gray-900">
                    Pesanan #{cancelPaymentModal.order?.id_pesanan}
                  </p>
                  <p className="text-gray-600">
                    {cancelPaymentModal.order?.produk?.nama_produk}
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    Rp {cancelPaymentModal.transaksi?.nominal?.toLocaleString()}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">
                    <p>
                      Jenis: {cancelPaymentModal.transaksi?.jenis_pembayaran}
                    </p>
                    <p>Status: Pending</p>
                  </div>
                </div>
                <div className="mt-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm text-orange-700 flex items-start gap-2">
                    <Icon
                      icon="mdi:information-outline"
                      className="flex-shrink-0 mt-0.5"
                    />
                    <span>
                      Setelah dibatalkan, Anda dapat membuat pembayaran baru
                      untuk pesanan ini.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={closeCancelPaymentModal}
                  disabled={cancellingId}
                  className="px-5 py-2.5 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-300 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleCancelPayment}
                  disabled={cancellingId}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white font-medium rounded-xl hover:from-orange-700 hover:to-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {cancellingId ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Membatalkan...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:close-circle" />
                      Batalkan Pembayaran
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
