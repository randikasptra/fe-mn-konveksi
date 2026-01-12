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

// Helper functions
const getJenisPembayaran = (order) => {
  const transaksi = order.transaksi || [];
  const settledTransactions = transaksi.filter(
    (t) => t.midtrans_status === "settlement"
  );

  if (settledTransactions.length === 0) {
    return "DP";
  }

  const totalPaid = settledTransactions.reduce(
    (sum, t) => sum + (t.jumlah || t.nominal || 0),
    0
  );

  if (totalPaid < order.total_harga) {
    return "PELUNASAN";
  }

  return null;
};

const getAmountToPay = (order) => {
  const transaksi = order.transaksi || [];
  const settledTransactions = transaksi.filter(
    (t) => t.midtrans_status === "settlement"
  );

  if (settledTransactions.length === 0) {
    // Belum ada pembayaran -> DP 50%
    return order.dp_wajib || Math.ceil(order.total_harga * 0.5);
  }

  const totalPaid = settledTransactions.reduce(
    (sum, t) => sum + (t.jumlah || t.nominal || 0),
    0
  );

  if (totalPaid < order.total_harga) {
    // Sudah bayar DP tapi belum lunas
    return order.total_harga - totalPaid;
  }

  return 0; // Sudah lunas
};

const getPendingTransaksi = (order) => {
  return order.transaksi?.find((t) => t.midtrans_status === "pending");
};

const getSettledTransaksi = (order) => {
  return (
    order.transaksi?.filter((t) => t.midtrans_status === "settlement") || []
  );
};

const getTotalPaid = (order) => {
  const settledTrans = getSettledTransaksi(order);
  return settledTrans.reduce((sum, t) => sum + (t.jumlah || t.nominal || 0), 0);
};

// Fungsi untuk mendapatkan status pembayaran berdasarkan pelunasan_status
const getPaymentStatus = (order) => {
  const totalPaid = getTotalPaid(order);
  const dpAmount = order.dp_wajib || Math.ceil(order.total_harga * 0.5);
  const remainingPayment = Math.max(0, order.total_harga - totalPaid);

  // Cek dari backend status
  if (order.pelunasan_status === "VALID") {
    return {
      type: "LUNAS",
      text: "Pembayaran Lunas",
      description: "Semua pembayaran sudah diselesaikan",
      color: "green",
      icon: "mdi:check-circle",
    };
  }

  if (order.pelunasan_status === "BELUM" && order.dp_status === "VALID") {
    return {
      type: "DP_ONLY",
      text: "Sudah Bayar DP 50%",
      description: `DP Rp ${formatIDR(dpAmount)} sudah dibayar`,
      color: "blue",
      icon: "mdi:cash-clock",
    };
  }

  if (order.dp_status === "BELUM") {
    return {
      type: "NO_PAYMENT",
      text: "Belum Ada Pembayaran",
      description: "Bayar DP 50% untuk memulai produksi",
      color: "yellow",
      icon: "mdi:cash-remove",
    };
  }

  // Fallback berdasarkan transaksi
  if (totalPaid >= order.total_harga) {
    return {
      type: "LUNAS",
      text: "Pembayaran Lunas",
      description: "Semua pembayaran sudah diselesaikan",
      color: "green",
      icon: "mdi:check-circle",
    };
  }

  if (totalPaid > 0) {
    return {
      type: "PARTIAL",
      text: "Pembayaran Sebagian",
      description: `Sudah dibayar: Rp ${formatIDR(totalPaid)}`,
      color: "blue",
      icon: "mdi:cash-partial",
    };
  }

  return {
    type: "NO_PAYMENT",
    text: "Belum Ada Pembayaran",
    description: "Bayar DP 50% untuk memulai produksi",
    color: "yellow",
    icon: "mdi:cash-remove",
  };
};

// 🔥 FUNGSI BARU: Tentukan apakah tombol pelunasan harus muncul
const shouldShowPelunasanButton = (order) => {
  const totalPaid = getTotalPaid(order);
  const dpAmount = order.dp_wajib || Math.ceil(order.total_harga * 0.5);

  // Kondisi untuk menampilkan tombol pelunasan:
  // 1. Sudah bayar DP (dp_status = "VALID")
  // 2. Belum lunas (pelunasan_status = "BELUM")
  // 3. Status pesanan DIPROSES (sudah dikonfirmasi admin)
  // 4. Masih ada sisa pembayaran
  const hasPaidDP = order.dp_status === "VALID";
  const notFullyPaid = order.pelunasan_status === "BELUM";
  const isProcessing = order.status_pesanan === "DIPROSES";
  const hasRemaining = totalPaid < order.total_harga;

  return hasPaidDP && notFullyPaid && isProcessing && hasRemaining;
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
  onCancelPayment,
  canDelete = false,
  processingId,
  deletingId,
  cancellingId,
}) {
  const pending = getPendingTransaksi(order);
  const settledTrans = getSettledTransaksi(order);
  const totalPaid = getTotalPaid(order);
  const remainingPayment = Math.max(0, order.total_harga - totalPaid);
  const jenisPembayaran = getJenisPembayaran(order);
  const canPay = jenisPembayaran && remainingPayment > 0;
  const deleteBlockedReason = getDeleteBlockedReason(order);

  // Hitung jumlah yang harus dibayar
  const amountToPay = getAmountToPay(order);

  // DP amount
  const dpAmount = order.dp_wajib || Math.ceil(order.total_harga * 0.5);

  // Status pembayaran
  const paymentStatus = getPaymentStatus(order);

  // Cek apakah sudah lunas
  const isFullyPaid =
    order.pelunasan_status === "VALID" || totalPaid >= order.total_harga;

  // 🔥 LOGIKA BARU: Tampilkan tombol pelunasan hanya jika status DIPROSES
  const showPelunasanButton = shouldShowPelunasanButton(order);
  const showDPButton =
    order.dp_status === "BELUM" &&
    order.status_pesanan === "MENUNGGU_PEMBAYARAN";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Icon
                  icon="mdi:package-variant"
                  className="text-indigo-600 text-2xl"
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {order.produk?.nama_produk || "Produk"}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>
                    ID:{" "}
                    <span className="font-mono font-medium">
                      {order.id_pesanan}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{formatDate(order.tanggal_pesan)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={order.status_pesanan}
              transaksi={order.transaksi}
              order={order}
            />

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
            ) : (
              deleteBlockedReason && (
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
                      <Icon
                        icon="mdi:information-outline"
                        className="flex-shrink-0 mt-0.5"
                      />
                      <span>{deleteBlockedReason}</span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              Detail Pesanan
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Kuantitas</span>
                <span className="font-semibold">{order.qty} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bahan</span>
                <span className="font-semibold">
                  {order.produk?.bahan || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Catatan</span>
                <span
                  className="font-semibold text-right max-w-[200px] truncate"
                  title={order.catatan}
                >
                  {order.catatan || "-"}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">
              Informasi Pembayaran
            </h4>
            <div className="space-y-4">
              {/* Status Pembayaran Card */}
              <div
                className={`p-4 rounded-xl border ${
                  paymentStatus.color === "green"
                    ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200"
                    : paymentStatus.color === "blue"
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
                    : "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      paymentStatus.color === "green"
                        ? "bg-green-100 text-green-600"
                        : paymentStatus.color === "blue"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-yellow-100 text-yellow-600"
                    }`}
                  >
                    <Icon icon={paymentStatus.icon} className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <h5
                      className={`font-bold ${
                        paymentStatus.color === "green"
                          ? "text-green-700"
                          : paymentStatus.color === "blue"
                          ? "text-blue-700"
                          : "text-yellow-700"
                      }`}
                    >
                      {paymentStatus.text}
                    </h5>
                    <p className="text-sm text-gray-600 mt-1">
                      {paymentStatus.description}
                    </p>
                    {/* Tambahkan status pesanan */}
                    <div className="mt-2 text-xs text-gray-500">
                      Status Pesanan: {order.status_pesanan}
                    </div>
                  </div>
                </div>
              </div>

              {/* Rincian Pembayaran */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-3">
                  Rincian Pembayaran:
                </h5>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-700">Total Pesanan:</span>
                    <span className="font-bold text-gray-900">
                      {formatIDR(order.total_harga)}
                    </span>
                  </div>

                  {/* Tampilkan DP wajib */}
                  <div className="flex justify-between">
                    <span className="text-gray-700">DP (50%):</span>
                    <span className="font-bold text-blue-700">
                      {formatIDR(dpAmount)}
                    </span>
                  </div>

                  {/* Untuk yang sudah bayar DP */}
                  {order.dp_status === "VALID" &&
                    order.pelunasan_status === "BELUM" && (
                      <>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                          <span className="text-gray-700 font-medium">
                            DP Dibayar:
                          </span>
                          <span className="font-bold text-green-600">
                            ✅ {formatIDR(dpAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-medium">
                            Sisa Pelunasan:
                          </span>
                          <span className="font-bold text-red-600">
                            {formatIDR(dpAmount)}{" "}
                            {/* Sama dengan DP karena pelunasan = 50% */}
                          </span>
                        </div>
                        <div className="pt-2 border-t border-gray-200 mt-2">
                          <div className="flex justify-between">
                            <span className="text-gray-700 font-semibold">
                              Yang Harus Dibayar:
                            </span>
                            <span className="text-lg font-bold text-red-700">
                              {formatIDR(dpAmount)}
                            </span>
                          </div>
                        </div>
                      </>
                    )}

                  {/* Untuk yang sudah LUNAS */}
                  {order.pelunasan_status === "VALID" && (
                    <>
                      <div className="flex justify-between pt-2 border-t border-gray-200">
                        <span className="text-gray-700 font-medium">
                          DP Dibayar:
                        </span>
                        <span className="font-bold text-green-600">
                          ✅ {formatIDR(dpAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-medium">
                          Pelunasan Dibayar:
                        </span>
                        <span className="font-bold text-green-600">
                          ✅ {formatIDR(dpAmount)}
                        </span>
                      </div>
                      <div className="pt-2 border-t border-green-200 mt-2">
                        <div className="flex justify-between">
                          <span className="text-gray-700 font-semibold">
                            Total Dibayar:
                          </span>
                          <span className="text-lg font-bold text-green-700">
                            {formatIDR(order.total_harga)}
                          </span>
                        </div>
                        <div className="mt-1 text-sm text-green-600 flex items-center gap-1">
                          <Icon icon="mdi:check-circle" />
                          <span>Pembayaran sudah lunas</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Untuk yang belum bayar sama sekali */}
                  {order.dp_status === "BELUM" && (
                    <div className="pt-2 border-t border-yellow-200 mt-2">
                      <div className="flex justify-between">
                        <span className="text-gray-700 font-semibold">
                          Yang Harus Dibayar (DP):
                        </span>
                        <span className="text-lg font-bold text-yellow-700">
                          {formatIDR(dpAmount)}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-yellow-600">
                        Bayar DP 50% untuk memulai produksi
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Info untuk pesanan yang bisa dihapus */}
              {canDelete && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                    <Icon icon="mdi:check-circle" />
                    Pesanan dapat dihapus
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Belum diproses & belum ada pembayaran berhasil
                  </p>
                </div>
              )}

              {/* Tombol Batalkan Pembayaran untuk transaksi pending */}
              {pending && onCancelPayment && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        Pembayaran tertunda
                      </p>
                      <p className="text-xs text-orange-600">
                        Token: {pending.snap_token?.substring(0, 20)}...
                      </p>
                    </div>
                    <button
                      onClick={() => onCancelPayment(order, pending)}
                      disabled={cancellingId === order.id_pesanan}
                      className="px-3 py-1.5 bg-white text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-colors text-sm flex items-center gap-1"
                    >
                      {cancellingId === order.id_pesanan ? (
                        <>
                          <Icon icon="mdi:loading" className="animate-spin" />
                          Membatalkan...
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:close-circle" />
                          Batalkan
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <ProgressTracker
          status={order.status_pesanan}
          transaksi={order.transaksi}
          order={order}
        />
      </div>

      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            {pending && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                <Icon
                  icon="mdi:alert-circle"
                  className="text-purple-600 text-xl"
                />
                <div>
                  <p className="text-sm font-medium text-purple-700">
                    Pembayaran Tertunda
                  </p>
                  <p className="text-xs text-purple-600">
                    Selesaikan pembayaran segera untuk melanjutkan proses
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {/* 🔥 TOMBOL DP - hanya muncul jika status MENUNGGU_PEMBAYARAN */}
            {showDPButton && (
              <button
                disabled={processingId === order.id_pesanan}
                onClick={() => onPay && onPay(order, "DP")}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 font-semibold rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === order.id_pesanan ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin text-xl" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:cash" className="text-xl" />
                    Bayar DP: {formatIDR(dpAmount)}
                  </>
                )}
              </button>
            )}

            {/* 🔥 TOMBOL PELUNASAN - hanya muncul jika status DIPROSES */}
            {showPelunasanButton && (
              <button
                disabled={processingId === order.id_pesanan}
                onClick={() => onPay && onPay(order, "PELUNASAN")}
                className="inline-flex items-center justify-center gap-3 px-6 py-3 font-semibold rounded-xl bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === order.id_pesanan ? (
                  <>
                    <Icon icon="mdi:loading" className="animate-spin text-xl" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:cash-multiple" className="text-xl" />
                    Bayar Pelunasan: {formatIDR(dpAmount)}
                  </>
                )}
              </button>
            )}

            {/* Info jika sudah lunas */}
            {isFullyPaid && (
              <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
                <Icon
                  icon="mdi:check-circle"
                  className="text-emerald-600 text-xl"
                />
                <div>
                  <p className="text-sm font-medium text-emerald-700">
                    ✅ Pembayaran Lunas
                  </p>
                  <p className="text-xs text-emerald-600">
                    Semua pembayaran sudah diselesaikan
                  </p>
                </div>
              </div>
            )}

            {/* Info jika menunggu admin */}
            {order.dp_status === "VALID" &&
              order.pelunasan_status === "BELUM" &&
              order.status_pesanan !== "DIPROSES" && (
                <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
                  <Icon
                    icon="mdi:clock-outline"
                    className="text-blue-600 text-xl"
                  />
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Menunggu Konfirmasi Admin
                    </p>
                    <p className="text-xs text-blue-600">
                      DP sudah dibayar, tunggu admin untuk melanjutkan
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* Status info cards */}
          {order.status_pesanan === "SELESAI" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <Icon
                icon="mdi:check-circle"
                className="text-emerald-600 text-xl"
              />
              <div>
                <p className="text-sm font-medium text-emerald-700">
                  Pesanan Selesai
                </p>
                <p className="text-xs text-emerald-600">
                  Terima kasih telah memesan di MN Konveksi
                </p>
              </div>
            </div>
          )}

          {order.status_pesanan === "DIPROSES" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <Icon icon="mdi:factory" className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-blue-700">
                  Sedang Diproses
                </p>
                <p className="text-xs text-blue-600">
                  {isFullyPaid
                    ? "Pesanan Anda sedang dalam proses produksi"
                    : "Selesaikan pelunasan untuk melanjutkan produksi"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
