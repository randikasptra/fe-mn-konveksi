// src/components/admin/OrderStatusBadge.jsx
import React from "react";
import {
  MdInventory,
  MdPendingActions,
  MdHourglassBottom,
  MdFactory,
  MdCheckCircle,
  MdCancel,
  MdPayment,
} from "react-icons/md";

const OrderStatusBadge = ({ status, paymentStatus }) => {
  const getStatusMeta = (status) => {
    const meta = {
      DIBUAT: {
        label: "Menunggu Konfirmasi",
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: <MdInventory size={18} />,
      },
      MENUNGGU_DP: {
        label: "Menunggu DP",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: <MdPayment size={18} />,
      },
      MENUNGGU_PELUNASAN: {
        label: "Menunggu Pelunasan",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: <MdHourglassBottom size={18} />,
      },
      DIPROSES: {
        label: "Sedang Diproduksi",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: <MdFactory size={18} />,
      },
      SELESAI: {
        label: "Selesai",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: <MdCheckCircle size={18} />,
      },
      DIBATALKAN: {
        label: "Dibatalkan",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: <MdCancel size={18} />,
      },
    };
    return meta[status] || meta.DIBUAT;
  };

  const meta = getStatusMeta(status);
  
  // Jika ada pembayaran pending
  const displayMeta = paymentStatus?.isPending ? {
    label: "Pembayaran Diproses",
    color: "bg-purple-100 text-purple-700 border-purple-300",
    icon: <MdPayment size={18} />,
  } : meta;

  return (
    <div className="flex flex-col gap-1">
      <span
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border ${displayMeta.color}`}
      >
        {displayMeta.icon}
        {displayMeta.label}
      </span>
      
      {paymentStatus?.isPending && (
        <span className="text-xs text-orange-600 font-medium">
          ⏳ Menunggu pembayaran customer
        </span>
      )}
      
      {paymentStatus?.isPaid && !paymentStatus?.isFullyPaid && (
        <span className="text-xs text-green-600 font-medium">
          ✅ DP sudah dibayar
        </span>
      )}
      
      {paymentStatus?.isFullyPaid && (
        <span className="text-xs text-emerald-600 font-medium">
          ✅ Lunas
        </span>
      )}
    </div>
  );
};

export default OrderStatusBadge;