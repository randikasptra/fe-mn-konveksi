// src/components/admin/OrderTable.jsx
import React from "react";
import OrderStatusBadge from "./OrderStatusBadge";

const OrderTable = ({
  orders,
  loading,
  search,
  setSearch,
  onSelectOrder,
  orderService,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="py-12 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-gray-500">Memuat pesanan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="py-16 text-center">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-400 text-2xl">📦</span>
            </div>
            <p className="text-gray-500">
              {search
                ? "Tidak ditemukan pesanan dengan kata kunci tersebut"
                : "Belum ada pesanan"}
            </p>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Hapus pencarian
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Helper function untuk format pembayaran
  const formatPaymentInfo = (order) => {
    const paymentStatus = orderService.checkPaymentStatus(order);
    const dpAmount = order.dp_wajib || Math.ceil(order.total_harga * 0.5);
    const pelunasanAmount = order.total_harga - dpAmount;

    // Hitung total yang sudah dibayar dari transaksi settlement
    const settledTransactions =
      order.transaksi?.filter((t) => t.midtrans_status === "settlement") || [];
    const totalPaid = settledTransactions.reduce(
      (sum, t) => sum + (t.nominal || t.jumlah || 0),
      0
    );

    return {
      dpAmount,
      pelunasanAmount,
      totalPaid,
      remainingPayment: Math.max(0, order.total_harga - totalPaid),
      dpStatus: order.dp_status,
      pelunasanStatus: order.pelunasan_status,
      paymentStatus,
    };
  };

  // Helper untuk badge status pembayaran
  const getPaymentBadge = (status, amount, type = "dp") => {
    const baseClasses =
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";

    if (status === "VALID") {
      return (
        <span className={`${baseClasses} bg-green-50 text-green-700`}>
          <span className="text-xs">✓</span>
          <span>
            {type === "dp" ? "DP" : "Lunas"}:{" "}
            {orderService.formatCurrency(amount)}
          </span>
        </span>
      );
    }

    if (status === "BELUM" && type === "dp") {
      return (
        <span className={`${baseClasses} bg-yellow-50 text-yellow-700`}>
          <span>⏳</span>
          <span>DP: {orderService.formatCurrency(amount)}</span>
        </span>
      );
    }

    if (status === "BELUM" && type === "pelunasan") {
      return (
        <span className={`${baseClasses} bg-blue-50 text-blue-700`}>
          <span>💰</span>
          <span>Pelunasan: {orderService.formatCurrency(amount)}</span>
        </span>
      );
    }

    return (
      <span className={`${baseClasses} bg-gray-50 text-gray-600`}>
        <span>-</span>
        <span>
          {type === "dp" ? "DP" : "Pelunasan"}:{" "}
          {orderService.formatCurrency(amount)}
        </span>
      </span>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                Produk
              </th>
              <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">
                Customer
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                Qty
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                Total
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                DP / Pelunasan
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                Status
              </th>
              <th className="px-6 py-4 text-center text-sm font-medium text-gray-500">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => {
              const paymentInfo = formatPaymentInfo(order);

              return (
                <tr
                  key={order.id_pesanan}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          order.produk?.foto || "https://via.placeholder.com/60"
                        }
                        className="w-12 h-12 rounded-lg object-cover border"
                        alt={order.produk?.nama_produk}
                        onError={(e) => {
                          e.target.src = "https://via.placeholder.com/60";
                        }}
                      />
                      <div className="min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {order.produk?.nama_produk ||
                            "Produk tidak ditemukan"}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          {order.catatan || "Tidak ada catatan"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    {order.user ? (
                      <div>
                        <div className="font-medium text-gray-900 truncate">
                          {order.user.nama || "Tidak ada nama"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {order.user.email || "Tidak ada email"}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Data customer tidak ditemukan
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-medium text-lg">{order.qty}</span>
                      <div className="text-xs text-gray-500">pcs</div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-center">
                      <div className="font-bold text-gray-900">
                        {orderService.formatCurrency(order.total_harga)}
                      </div>
                      {paymentInfo.totalPaid > 0 && (
                        <div className="text-xs mt-1">
                          <div
                            className={`${
                              paymentInfo.paymentStatus.isFullyPaid
                                ? "text-green-600"
                                : "text-blue-600"
                            } font-medium`}
                          >
                            Dibayar:{" "}
                            {orderService.formatCurrency(paymentInfo.totalPaid)}
                          </div>
                          {paymentInfo.remainingPayment > 0 && (
                            <div className="text-red-600 text-xs">
                              Sisa:{" "}
                              {orderService.formatCurrency(
                                paymentInfo.remainingPayment
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Kolom DP & Pelunasan yang lebih sederhana */}
                  <td className="px-6 py-4">
                    <div className="space-y-2 min-w-[180px]">
                      {/* DP */}
                      <div>
                        {getPaymentBadge(
                          paymentInfo.dpStatus,
                          paymentInfo.dpAmount,
                          "dp"
                        )}
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          {paymentInfo.dpStatus === "VALID"
                            ? "✓ Sudah dibayar"
                            : paymentInfo.paymentStatus.isPending
                            ? "⏳ Menunggu pembayaran"
                            : "Belum dibayar"}
                        </div>
                      </div>

                      {/* Pelunasan */}
                      <div>
                        {getPaymentBadge(
                          paymentInfo.pelunasanStatus,
                          paymentInfo.pelunasanAmount,
                          "pelunasan"
                        )}
                        <div className="text-xs text-gray-500 mt-1 ml-1">
                          {paymentInfo.pelunasanStatus === "VALID"
                            ? "✓ Lunas"
                            : paymentInfo.dpStatus === "VALID"
                            ? "💰 Menunggu pelunasan"
                            : "Menunggu DP"}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex flex-col items-center">
                      <OrderStatusBadge
                        status={order.status_pesanan}
                        paymentStatus={paymentInfo.paymentStatus}
                      />
                      <div className="text-xs text-gray-500 mt-1.5">
                        {order.status_pesanan === "MENUNGGU_PEMBAYARAN" &&
                          "Menunggu pembayaran DP"}
                        {order.status_pesanan === "MENUNGGU_PELUNASAN" &&
                          "Menunggu pelunasan"}
                        {order.status_pesanan === "DIPROSES" &&
                          "Sedang diproses"}
                        {order.status_pesanan === "SELESAI" &&
                          "Selesai diproduksi"}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-center">
                      <button
                        onClick={() => onSelectOrder(order)}
                        className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                      >
                        Kelola
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;
