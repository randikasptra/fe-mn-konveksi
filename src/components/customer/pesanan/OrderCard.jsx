import React from "react";
import { Icon } from "@iconify/react";
import StatusBadge from "./StatusBadge";
import ProgressTracker from "./ProgressTracker";

// Utility functions
const formatIDR = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v || 0);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const getJenisPembayaran = (order) => {
  const transaksi = order.transaksi || [];
  const settledTransactions = transaksi.filter(t => t.midtrans_status === "settlement");
  
  if (settledTransactions.length === 0) {
    return "DP";
  }
  
  const totalPaid = settledTransactions.reduce((sum, t) => sum + t.nominal, 0);
  
  if (totalPaid < order.total_harga) {
    return "PELUNASAN";
  }
  
  return null;
};

const getPendingTransaksi = (order) => {
  return order.transaksi?.find((t) => t.midtrans_status === "pending");
};

const getSettledTransaksi = (order) => {
  return order.transaksi?.filter((t) => t.midtrans_status === "settlement") || [];
};

// Fungsi untuk mendapatkan status transaksi yang ramah dibaca
const getPaymentStatusText = (order) => {
  if (!order.transaksi || order.transaksi.length === 0) {
    return "Belum ada transaksi";
  }

  const settled = getSettledTransaksi(order);
  if (settled.length > 0) {
    return "Sudah ada pembayaran berhasil";
  }

  const pending = getPendingTransaksi(order);
  if (pending) {
    return "Menunggu pembayaran";
  }

  const expired = order.transaksi.find(t => t.midtrans_status === "expire");
  if (expired) {
    return "Pembayaran telah kadaluarsa";
  }

  const cancelled = order.transaksi.find(t => t.midtrans_status === "cancel");
  if (cancelled) {
    return "Pembayaran dibatalkan";
  }

  const denied = order.transaksi.find(t => t.midtrans_status === "deny");
  if (denied) {
    return "Pembayaran ditolak";
  }

  return "Status pembayaran tidak diketahui";
};

// Fungsi untuk mendapatkan pesan kenapa tidak bisa dihapus
const getDeleteBlockedReason = (order) => {
  // Cek status pesanan
  if (["DIPROSES", "SELESAI"].includes(order.status_pesanan)) {
    return "Pesanan sudah diproses atau selesai";
  }

  // Cek transaksi settlement
  const hasSettlement = order.transaksi?.some(
    (t) => t.midtrans_status === "settlement"
  );
  if (hasSettlement) {
    return "Sudah ada pembayaran berhasil";
  }

  // Cek status transaksi lainnya
  const validStatuses = ["pending", "expire", "cancel", "deny"];
  const hasInvalidPayment = order.transaksi?.some((t) => {
    if (!t.midtrans_status) return false;
    return !validStatuses.includes(t.midtrans_status);
  });

  if (hasInvalidPayment) {
    return "Status pembayaran tidak memungkinkan penghapusan";
  }

  return null;
};

export default function OrderCard({ 
  order, 
  onPay, 
  onDelete, 
  canDelete = false,
  processingId,
  deletingId 
}) {
  const pending = getPendingTransaksi(order);
  const settledTrans = getSettledTransaksi(order);
  const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
  const remainingPayment = order.total_harga - totalPaid;
  const jenisPembayaran = getJenisPembayaran(order);
  const canPay = jenisPembayaran && remainingPayment > 0;
  const paymentStatusText = getPaymentStatusText(order);
  const deleteBlockedReason = getDeleteBlockedReason(order);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:package-variant" className="text-indigo-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{order.produk?.nama_produk || "Produk"}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>ID: <span className="font-mono font-medium">{order.id_pesanan}</span></span>
                  <span>•</span>
                  <span>{formatDate(order.tanggal_pesan)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status_pesanan} transaksi={order.transaksi} order={order} />
            
            {/* Tombol Hapus - dengan tooltip jika tidak bisa dihapus */}
            {canDelete ? (
              <button
                onClick={() => onDelete && onDelete(order)}
                disabled={deletingId === order.id_pesanan}
                className="px-4 py-2 bg-red-50 text-red-600 font-medium rounded-xl hover:bg-red-100 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Hapus pesanan"
              >
                {deletingId === order.id_pesanan ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:delete-outline" />
                    Hapus
                  </>
                )}
              </button>
            ) : deleteBlockedReason && (
              <div className="relative group">
                <button
                  disabled
                  className="px-4 py-2 bg-gray-100 text-gray-400 font-medium rounded-xl cursor-not-allowed flex items-center gap-2"
                  title={deleteBlockedReason}
                >
                  <Icon icon="mdi:delete-off-outline" />
                  Tidak Bisa Dihapus
                </button>
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-lg">
                  <div className="flex items-start gap-2">
                    <Icon icon="mdi:information-outline" className="flex-shrink-0 mt-0.5" />
                    <span>{deleteBlockedReason}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Detail Pesanan</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Kuantitas</span>
                <span className="font-semibold">{order.qty} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bahan</span>
                <span className="font-semibold">{order.produk?.bahan || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Catatan</span>
                <span className="font-semibold text-right max-w-[200px] truncate" title={order.catatan}>
                  {order.catatan || "-"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Informasi Pembayaran</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Harga</span>
                <span className="text-xl font-bold text-indigo-600">{formatIDR(order.total_harga)}</span>
              </div>
              
              {/* Status pembayaran */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Status Pembayaran:</span>
                  <span className={`font-medium ${
                    settledTrans.length > 0 ? 'text-green-600' :
                    pending ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {paymentStatusText}
                  </span>
                </div>
              </div>
              
              {settledTrans.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Dibayar</span>
                    <span className="font-semibold text-green-600">{formatIDR(totalPaid)}</span>
                  </div>
                  
                  {remainingPayment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sisa Pembayaran</span>
                      <span className="font-semibold text-orange-600">{formatIDR(remainingPayment)}</span>
                    </div>
                  )}
                  
                  {jenisPembayaran && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">
                        {jenisPembayaran === "DP" 
                          ? "Bayar DP 50% untuk memulai produksi" 
                          : "Lunasi pembayaran untuk menyelesaikan pesanan"}
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              {/* Info untuk pesanan yang bisa dihapus */}
              {canDelete && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Icon icon="mdi:check-circle" />
                    Pesanan dapat dihapus
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Belum diproses & belum ada pembayaran berhasil
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <ProgressTracker status={order.status_pesanan} transaksi={order.transaksi} order={order} />
      </div>

      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {pending && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <Icon icon="mdi:alert-circle" className="text-purple-600 text-xl" />
                <div>
                  <p className="text-sm font-medium text-purple-700">Pembayaran Tertunda</p>
                  <p className="text-xs text-purple-600">
                    Selesaikan pembayaran segera untuk melanjutkan proses
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {canPay && (
              <button
                disabled={processingId === order.id_pesanan}
                onClick={() => onPay && onPay(order, jenisPembayaran)}
                className={`
                  inline-flex items-center justify-center gap-3
                  px-6 py-3 font-semibold rounded-xl
                  transition-all duration-300 shadow-md hover:shadow-lg
                  ${pending 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' 
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {processingId === order.id_pesanan ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin text-xl" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icon icon={pending ? "mdi:cash-fast" : "mdi:cash"} className="text-xl" />
                    {pending
                      ? "Lanjutkan Pembayaran"
                      : jenisPembayaran === "DP"
                      ? "Bayar DP 50%"
                      : "Bayar Pelunasan"}
                  </>
                )}
              </button>
            )}
          </div>
          
          {/* Status info cards */}
          {order.status_pesanan === "SELESAI" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <Icon icon="mdi:check-circle" className="text-emerald-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-emerald-700">Pesanan Selesai</p>
                <p className="text-xs text-emerald-600">Terima kasih telah memesan di MN Konveksi</p>
              </div>
            </div>
          )}
          
          {order.status_pesanan === "DIPROSES" && totalPaid >= order.total_harga && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <Icon icon="mdi:factory" className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-blue-700">Sedang Diproses</p>
                <p className="text-xs text-blue-600">
                  Pesanan Anda sedang dalam proses produksi
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}