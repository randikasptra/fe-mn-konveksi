// src/components/admin/OrderDetailModal.jsx
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  MdInfo,
  MdAttachMoney,
  MdDelete,
  MdClose,
  MdHourglassBottom,
  MdCalendarToday,
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
  const [dpInfo, setDpInfo] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  
  const paymentStatus = orderService.checkPaymentStatus(order);
  const frontendStatus = orderService.mapStatusToFrontend(order.status_pesanan);
  
  // ========== GET DP INFORMATION ==========
  useEffect(() => {
    const calculateDpInfo = () => {
      const dpAmount = order.dp_wajib || Math.ceil(order.total_harga * 0.5);
      const pelunasanAmount = order.total_harga - dpAmount;
      
      // Hitung DP yang sudah dibayar dari transaksi settlement DP
      const dpTransactions = order.transaksi?.filter(t => 
        t.midtrans_status === "settlement" && 
        (t.jenis_pembayaran === "DP" || t.jenis_pembayaran === "FULL")
      ) || [];
      
      const dpPaid = dpTransactions.reduce((sum, t) => sum + (t.nominal || t.jumlah || 0), 0);
      
      // Hitung pelunasan yang sudah dibayar
      const pelunasanTransactions = order.transaksi?.filter(t => 
        t.midtrans_status === "settlement" && 
        t.jenis_pembayaran === "PELUNASAN"
      ) || [];
      
      const pelunasanPaid = pelunasanTransactions.reduce((sum, t) => sum + (t.nominal || t.jumlah || 0), 0);

      return {
        dpAmount,
        dpPaid,
        pelunasanAmount,
        pelunasanPaid,
        isDpValid: order.dp_status === "VALID",
        isPelunasanValid: order.pelunasan_status === "VALID",
        dpPercentage: Math.round((dpPaid / dpAmount) * 100) || 0,
        pelunasanPercentage: Math.round((pelunasanPaid / pelunasanAmount) * 100) || 0,
      };
    };

    setDpInfo(calculateDpInfo());
  }, [order]);

  // ========== GET AVAILABLE STATUS OPTIONS ==========
  useEffect(() => {
    const getStatusOptions = () => {
      const currentStatus = order.status_pesanan;
      const options = [];

      // Status yang tersedia berdasarkan status saat ini dan kondisi pembayaran
      switch (currentStatus) {
        case "MENUNGGU_PEMBAYARAN":
          // Bisa ke DIPROSES jika sudah lunas atau FULL payment
          if (paymentStatus.isFullyPaid) {
            options.push({
              status: "DIPROSES",
              label: "Mulai Produksi",
              description: "Pesanan sudah lunas, siap untuk diproses",
              color: "bg-blue-500 hover:bg-blue-600",
            });
          }
          // Bisa ke DIBATALKAN jika belum ada pembayaran settlement
          if (!paymentStatus.hasSettlementPayment) {
            options.push({
              status: "DIBATALKAN",
              label: "Batalkan Pesanan",
              description: "Batalkan pesanan ini",
              color: "bg-red-500 hover:bg-red-600",
            });
          }
          break;

        case "DIPROSES":
          options.push({
            status: "SELESAI",
            label: "Selesaikan Pesanan",
            description: "Tandai pesanan sudah selesai diproduksi",
            color: "bg-green-500 hover:bg-green-600",
          });
          break;

        case "SELESAI":
          // Tidak ada aksi selanjutnya
          break;

        case "DIBATALKAN":
          // Tidak bisa diubah dari DIBATALKAN
          break;

        default:
          break;
      }

      // Tambahkan aksi manual jika admin ingin override (khusus untuk testing)
      if (process.env.NODE_ENV === "development") {
        options.push({
          status: "MENUNGGU_PEMBAYARAN",
          label: "Reset ke Menunggu Pembayaran",
          description: "Hanya untuk testing",
          color: "bg-yellow-500 hover:bg-yellow-600",
        });
      }

      return options;
    };

    setStatusOptions(getStatusOptions());
  }, [order.status_pesanan, paymentStatus]);

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
    const totalPaid = settledTransactions.reduce((sum, t) => sum + (t.nominal || 0), 0);
    
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
      "DIPROSES": `✅ Yakin ingin memulai produksi pesanan ini?\n\nEstimasi: ${order.estimasi_hari} hari\nTotal: ${orderService.formatCurrency(order.total_harga)}\nStatus Pembayaran: ${paymentStatus.isFullyPaid ? 'LUNAS' : 'BELUM LUNAS'}`,
      "SELESAI": "✅ Yakin pesanan sudah selesai diproduksi?",
      "DIBATALKAN": `⚠️ PERINGATAN!\n\nYakin ingin membatalkan pesanan ini?\n\nPesanan yang dibatalkan tidak dapat dikembalikan.`,
    };

    return messages[next] || `Yakin ingin mengubah status ke ${orderService.getStatusLabel(next)}?`;
  };

  const handleDelete = async () => {
    const deleteCheck = canDeleteOrder(order);
    
    if (!deleteCheck.allowed) {
      toast.error(deleteCheck.reason);
      return;
    }

    const transaksi = order.transaksi || [];
    const settledTransactions = transaksi.filter(t => t.midtrans_status === "settlement");
    const totalPaid = settledTransactions.reduce((sum, t) => sum + (t.nominal || 0), 0);

    let confirmMessage = "Yakin ingin menghapus pesanan ini? Tindakan ini tidak dapat dibatalkan.";
    
    if (totalPaid > 0) {
      confirmMessage = `⚠️ PERINGATAN!\n\nPesanan ini sudah menerima pembayaran sebesar ${orderService.formatCurrency(totalPaid)}.\n\nJika dihapus, customer mungkin perlu refund manual!\n\nYakin ingin melanjutkan?`;
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

  const InfoRow = ({ label, value, className = "" }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <span className={`text-sm font-medium text-gray-900 text-right max-w-[200px] break-words ${className}`}>
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
            <div>
              <h3 className="text-xl font-bold text-gray-900">Detail Pesanan</h3>
              <p className="text-sm text-gray-500 mt-1">ID: {order.id_pesanan}</p>
            </div>
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
                <InfoRow label="Tanggal Pesan" value={orderService.formatDate(order.tanggal_pesan)} />
                <InfoRow label="Produk" value={order.produk?.nama_produk || "-"} />
                <InfoRow label="Bahan" value={order.produk?.bahan || "-"} />
                <InfoRow label="Qty" value={`${order.qty} pcs`} />
                <InfoRow label="Harga Satuan" value={orderService.formatCurrency(order.harga_satuan)} />
                {order.estimasi_hari && (
                  <InfoRow 
                    label="Estimasi Produksi" 
                    value={`${order.estimasi_hari} hari`}
                    className="text-blue-600"
                  />
                )}
                <div className="pt-2">
                  <span className="text-sm text-gray-600 block mb-1">Catatan</span>
                  <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                    {order.catatan || "Tidak ada catatan"}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment & DP Info */}
            <div className="space-y-6">
              {/* Total Price */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <MdAttachMoney className="text-green-500" />
                  Ringkasan Pembayaran
                </h4>
                <div className="p-4 bg-gray-50 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-gray-600 block text-sm">Total Harga</span>
                      <span className="text-2xl font-bold text-gray-900">
                        {orderService.formatCurrency(order.total_harga)}
                      </span>
                    </div>
                    <MdAttachMoney className="text-gray-400 text-2xl" />
                  </div>

                  {/* DP Information */}
                  {dpInfo && (
                    <div className="space-y-3 pt-3 border-t border-gray-200">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">DP Wajib (50%)</span>
                          <span className={`text-sm font-bold ${dpInfo.isDpValid ? 'text-green-600' : 'text-yellow-600'}`}>
                            {orderService.formatCurrency(dpInfo.dpAmount)}
                          </span>
                        </div>
                        {dpInfo.dpPaid > 0 && (
                          <div className="text-xs text-gray-600 flex items-center justify-between">
                            <span>Sudah dibayar:</span>
                            <span className="font-medium">{orderService.formatCurrency(dpInfo.dpPaid)}</span>
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${dpInfo.isDpValid ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: `${Math.min(dpInfo.dpPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Status: <span className={dpInfo.isDpValid ? 'text-green-600 font-medium' : 'text-yellow-600'}>
                            {dpInfo.isDpValid ? 'VALID ✓' : 'BELUM'}
                          </span>
                        </div>
                      </div>

                      {/* Pelunasan Information */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Pelunasan</span>
                          <span className={`text-sm font-bold ${dpInfo.isPelunasanValid ? 'text-green-600' : 'text-blue-600'}`}>
                            {orderService.formatCurrency(dpInfo.pelunasanAmount)}
                          </span>
                        </div>
                        {dpInfo.pelunasanPaid > 0 && (
                          <div className="text-xs text-gray-600 flex items-center justify-between">
                            <span>Sudah dibayar:</span>
                            <span className="font-medium">{orderService.formatCurrency(dpInfo.pelunasanPaid)}</span>
                          </div>
                        )}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${dpInfo.isPelunasanValid ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(dpInfo.pelunasanPercentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 text-center">
                          Status: <span className={dpInfo.isPelunasanValid ? 'text-green-600 font-medium' : 'text-blue-600'}>
                            {dpInfo.isPelunasanValid ? 'VALID ✓' : 'BELUM'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment History */}
              {paymentStatus.hasPayment && (
                <div>
                  <h5 className="text-sm font-medium text-gray-600 mb-2">Riwayat Transaksi</h5>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {order.transaksi?.map((trans, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium capitalize">
                            {trans.jenis_pembayaran.toLowerCase()}
                          </span>
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
                            {orderService.formatCurrency(trans.nominal || trans.jumlah || 0)}
                          </div>
                          <div className="text-xs text-gray-500 capitalize">
                            {trans.midtrans_status}
                          </div>
                        </div>
                      </div>
                    )) || <p className="text-sm text-gray-500">Belum ada transaksi</p>}
                  </div>
                </div>
              )}
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
                    width: order.status_pesanan === 'SELESAI' ? '100%' :
                           order.status_pesanan === 'DIPROSES' ? '75%' :
                           order.status_pesanan === 'MENUNGGU_PEMBAYARAN' ? '50%' : '25%'
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
                <div className="text-xs text-gray-500 bg-gray-100 px-3 py-2 rounded-lg max-w-xs">
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
              {statusOptions.map((option) => (
                <button
                  key={option.status}
                  onClick={() => handleStatusChange(option.status)}
                  disabled={updating || deleting}
                  className={`px-4 py-2 text-white rounded-xl font-medium transition-colors ${option.color} disabled:opacity-50`}
                  title={option.description}
                >
                  {updating ? "Memproses..." : option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;