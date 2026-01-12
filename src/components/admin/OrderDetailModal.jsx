// src/components/admin/OrderDetailModal.jsx
import React, { useState } from "react";
import { toast } from "react-toastify";
import {
  MdInfo,
  MdAttachMoney,
  MdDelete,
  MdClose,
  MdHourglassBottom,
} from "react-icons/md";
import OrderStatusBadge from "./OrderStatusBadge";

const OrderDetailModal = ({ 
  order, 
  orderService, 
  onClose, 
  onUpdateStatus, 
  onDelete 
}) => {
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const paymentStatus = orderService.checkPaymentStatus(order);
  const frontendStatus = orderService.mapStatusToFrontend(order.status_pesanan);
  
  // ========== GET NEXT VALID STATUS (SMART LOGIC) ==========
  const getSmartNextStatuses = (order) => {
    const paymentStatus = orderService.checkPaymentStatus(order);
    const currentStatus = order.status_pesanan;

    // Jika ada pembayaran pending, tidak ada aksi
    if (paymentStatus.isPending) {
      return [];
    }

    // Logika status berdasarkan kondisi pembayaran
    switch (currentStatus) {
      case "DIBUAT":
        return ["MENUNGGU_DP", "DIBATALKAN"];

      case "MENUNGGU_DP":
        // Jika sudah ada DP (settlement), bisa ke MENUNGGU_PELUNASAN atau DIBATALKAN
        if (paymentStatus.isPaid && !paymentStatus.isFullyPaid) {
          return ["MENUNGGU_PELUNASAN", "DIBATALKAN"];
        }
        // Jika belum bayar sama sekali
        return ["DIBATALKAN"];

      case "MENUNGGU_PELUNASAN":
        // Jika sudah lunas, bisa langsung DIPROSES
        if (paymentStatus.isFullyPaid) {
          return ["DIPROSES", "DIBATALKAN"];
        }
        // Jika belum lunas, hanya bisa dibatalkan
        return ["DIBATALKAN"];

      case "DIPROSES":
        return ["SELESAI"];

      case "SELESAI":
        return [];

      case "DIBATALKAN":
        return [];

      default:
        return [];
    }
  };

  const nextStatuses = getSmartNextStatuses(order);

  // ========== LOGIKA HAPUS PESANAN (ADMIN) ==========
  const canDeleteOrder = (order) => {
    // ❌ Tidak bisa hapus jika sudah DIPROSES atau SELESAI
    if (["DIPROSES", "SELESAI"].includes(order.status_pesanan)) {
      return { 
        allowed: false, 
        reason: "Pesanan yang sudah diproses atau selesai tidak dapat dihapus" 
      };
    }

    // Cek status pembayaran
    const transaksi = order.transaksi || [];
    const settledTransactions = transaksi.filter(t => t.midtrans_status === "settlement");
    const totalPaid = settledTransactions.reduce((sum, t) => sum + t.nominal, 0);
    
    // ❌ Tidak bisa hapus jika sudah LUNAS
    if (totalPaid >= order.total_harga) {
      return { 
        allowed: false, 
        reason: "Pesanan yang sudah lunas tidak dapat dihapus" 
      };
    }

    // ✅ Bisa dihapus jika:
    // 1. Belum ada pembayaran sama sekali
    // 2. Sudah DP tapi belum lunas
    return { 
      allowed: true, 
      reason: totalPaid > 0 
        ? "Pesanan ini bisa dihapus (DP sudah dibayar, belum lunas)" 
        : "Pesanan ini bisa dihapus (belum ada pembayaran)"
    };
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdating(true);
      
      // Validasi khusus untuk status DIPROSES
      if (newStatus === "DIPROSES") {
        if (!paymentStatus.isFullyPaid) {
          toast.error("❌ Pesanan harus LUNAS (100%) sebelum bisa diproses!");
          return;
        }
      }

      // Validasi khusus untuk status MENUNGGU_PELUNASAN
      if (newStatus === "MENUNGGU_PELUNASAN") {
        if (!paymentStatus.isPaid) {
          toast.error("❌ DP harus dibayar dulu sebelum menunggu pelunasan!");
          return;
        }
        if (paymentStatus.isFullyPaid) {
          toast.error("❌ Pesanan sudah lunas! Langsung ubah ke DIPROSES.");
          return;
        }
      }

      const confirmMessage = getConfirmationMessage(frontendStatus, newStatus, paymentStatus);
      if (!window.confirm(confirmMessage)) {
        return;
      }

      await onUpdateStatus(order.id_pesanan, newStatus);
    } catch (error) {
      toast.error(error.message || "Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const getConfirmationMessage = (current, next, paymentStatus) => {
    const messages = {
      "DIBUAT→MENUNGGU_DP": "✅ Yakin ingin mengirim permintaan DP 50% ke customer?",
      "MENUNGGU_DP→MENUNGGU_PELUNASAN": `✅ DP sudah diterima (Rp ${orderService.formatCurrency(paymentStatus.totalPaid)}).\n\nYakin ingin ubah status ke MENUNGGU PELUNASAN?\n\nCustomer harus bayar sisa: Rp ${orderService.formatCurrency(paymentStatus.remaining)}`,
      "MENUNGGU_PELUNASAN→DIPROSES": `✅ Pembayaran LUNAS (Rp ${orderService.formatCurrency(paymentStatus.totalPaid)}).\n\nYakin ingin MULAI PRODUKSI?`,
      "DIPROSES→SELESAI": "✅ Yakin pesanan sudah selesai diproduksi?",
      "→DIBATALKAN": "⚠️ Yakin ingin membatalkan pesanan ini?",
    };

    const key = `${current}→${next}`;
    return messages[key] || messages[`→${next}`] || `Yakin ingin mengubah status ke ${orderService.getStatusLabel(next)}?`;
  };

  const handleDelete = async () => {
    const deleteCheck = canDeleteOrder(order);
    
    if (!deleteCheck.allowed) {
      toast.error(deleteCheck.reason);
      return;
    }

    const transaksi = order.transaksi || [];
    const settledTransactions = transaksi.filter(t => t.midtrans_status === "settlement");
    const totalPaid = settledTransactions.reduce((sum, t) => sum + t.nominal, 0);

    let confirmMessage = "Yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.";
    
    if (totalPaid > 0) {
      confirmMessage = `⚠️ PERINGATAN!\n\nPesanan ini sudah menerima pembayaran DP sebesar Rp ${totalPaid.toLocaleString()}.\n\nJika dihapus, customer mungkin perlu refund manual!\n\nYakin ingin melanjutkan?`;
    }

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setDeleting(true);
      await onDelete(order.id_pesanan);
      toast.success("Pesanan berhasil dihapus");
      onClose();
    } catch (error) {
      toast.error(error.message || "Gagal menghapus pesanan");
    } finally {
      setDeleting(false);
    }
  };

  const getButtonConfig = (status) => {
    const configs = {
      MENUNGGU_DP: {
        label: "Minta DP",
        color: "bg-yellow-500 hover:bg-yellow-600",
      },
      MENUNGGU_PELUNASAN: {
        label: "Set Menunggu Pelunasan",
        color: "bg-orange-500 hover:bg-orange-600",
      },
      DIPROSES: {
        label: "Mulai Produksi",
        color: "bg-blue-500 hover:bg-blue-600",
      },
      SELESAI: {
        label: "Selesaikan",
        color: "bg-green-500 hover:bg-green-600",
      },
      DIBATALKAN: {
        label: "Batalkan",
        color: "bg-red-500 hover:bg-red-600",
      },
    };
    return configs[status] || { label: orderService.getStatusLabel(status), color: "bg-gray-500 hover:bg-gray-600" };
  };

  const InfoRow = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right max-w-[200px] break-words">
        {value}
      </span>
    </div>
  );

  const deleteCheck = canDeleteOrder(order);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Detail Pesanan</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
            >
              <MdClose size={20} />
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Order Info */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MdInfo className="text-blue-500" />
                Informasi Pesanan
              </h4>
              <div className="space-y-3">
                <InfoRow label="ID Pesanan" value={order.id_pesanan} />
                <InfoRow label="Tanggal Pesan" value={orderService.formatDate(order.tanggal_pesan)} />
                <InfoRow label="Produk" value={order.produk?.nama_produk || "-"} />
                <InfoRow label="Bahan" value={order.produk?.bahan || "-"} />
                <InfoRow label="Qty" value={`${order.qty} pcs`} />
                <InfoRow label="Harga Satuan" value={orderService.formatCurrency(order.harga_satuan)} />
                <InfoRow label="Catatan" value={order.catatan || "Tidak ada catatan"} />
              </div>
            </div>

            {/* Payment Info */}
            <div>
              <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MdAttachMoney className="text-green-500" />
                Informasi Pembayaran
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                  <div>
                    <span className="text-gray-600 block text-sm">Total Harga</span>
                    <span className="text-2xl font-bold text-gray-900">
                      {orderService.formatCurrency(order.total_harga)}
                    </span>
                  </div>
                  <MdAttachMoney className="text-gray-400 text-2xl" />
                </div>
                
                {paymentStatus.hasPayment && (
                  <div className="pt-4 border-t border-gray-200 space-y-3">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <span className="text-gray-700 font-medium">Total Dibayar</span>
                      <span className="text-lg font-bold text-green-600">
                        {orderService.formatCurrency(paymentStatus.totalPaid)}
                      </span>
                    </div>
                    
                    {!paymentStatus.isFullyPaid && (
                      <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                        <span className="text-gray-700 font-medium">Sisa Pembayaran</span>
                        <span className="text-lg font-bold text-orange-600">
                          {orderService.formatCurrency(paymentStatus.remaining)}
                        </span>
                      </div>
                    )}

                    {/* Detail Transaksi */}
                    <div className="mt-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Riwayat Transaksi</h5>
                      <div className="space-y-2">
                        {order.transaksi?.map((trans, index) => (
                          <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <span className="text-sm font-medium">{trans.jenis_pembayaran}</span>
                              <div className="text-xs text-gray-500">
                                {orderService.formatDate(trans.created_at)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-sm font-medium ${
                                trans.midtrans_status === 'settlement' ? 'text-green-600' :
                                trans.midtrans_status === 'pending' ? 'text-yellow-600' :
                                'text-red-600'
                              }`}>
                                {orderService.formatCurrency(trans.nominal)}
                              </div>
                              <div className="text-xs text-gray-500 capitalize">
                                {trans.midtrans_status}
                              </div>
                            </div>
                          </div>
                        )) || <p className="text-sm text-gray-500">Belum ada transaksi</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Info */}
          {order.user && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold text-gray-700 mb-3">Informasi Customer</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <InfoRow label="Nama" value={order.user.nama || "-"} />
                <InfoRow label="Email" value={order.user.email || "-"} />
                <InfoRow label="Telepon" value={order.user.no_hp || "-"} />
                <InfoRow label="Alamat" value={order.user.alamat || "-"} />
              </div>
            </div>
          )}

          {/* Payment Status Warning */}
          {!paymentStatus.isFullyPaid && paymentStatus.isPaid && (
            <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
              <div className="flex items-start gap-3">
                <MdHourglassBottom className="text-orange-600 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-orange-900 mb-1">Menunggu Pelunasan</h4>
                  <p className="text-sm text-orange-700">
                    DP sudah dibayar: <strong>{orderService.formatCurrency(paymentStatus.totalPaid)}</strong><br />
                    Sisa yang harus dibayar: <strong>{orderService.formatCurrency(paymentStatus.remaining)}</strong>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Status Section */}
          <div className="mb-6 p-4 bg-gray-50 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-1">Status Pesanan</h4>
                <p className="text-sm text-gray-500">
                  {orderService.getStatusDescription(order.status_pesanan)}
                </p>
              </div>
              <OrderStatusBadge 
                status={frontendStatus} 
                paymentStatus={paymentStatus}
              />
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progres Pesanan</span>
                <span className="text-sm font-medium text-gray-900">
                  {orderService.getStatusLabel(order.status_pesanan)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{
                    width: frontendStatus === 'SELESAI' ? '100%' :
                           frontendStatus === 'DIPROSES' ? '75%' :
                           frontendStatus === 'MENUNGGU_PELUNASAN' ? '50%' :
                           frontendStatus === 'MENUNGGU_DP' ? '25%' : '10%'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="space-y-2">
              {paymentStatus.isPending && (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                  <MdHourglassBottom size={18} />
                  <span className="text-sm">Menunggu pembayaran customer selesai</span>
                </div>
              )}
              
              {/* Delete Button dengan Validasi */}
              {deleteCheck.allowed ? (
                <button
                  onClick={handleDelete}
                  disabled={updating || deleting}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm disabled:opacity-50 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <MdDelete size={16} />
                  {deleting ? "Menghapus..." : "Hapus Pesanan"}
                </button>
              ) : (
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg">
                  ℹ️ {deleteCheck.reason}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Tutup
              </button>
              
              {/* Status Action Buttons */}
              {nextStatuses.map((status) => {
                const config = getButtonConfig(status);
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={updating || deleting}
                    className={`px-4 py-2 text-white rounded-xl font-medium transition-colors ${config.color} disabled:opacity-50`}
                  >
                    {updating ? "Memproses..." : config.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;