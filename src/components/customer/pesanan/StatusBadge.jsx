import React from "react";
import { Icon } from "@iconify/react";

export default function StatusBadge({ status, transaksi, order }) {
  const settledTrans = (transaksi || []).filter(t => t.midtrans_status === "settlement");
  const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
  
  let displayLabel = "";
  let color = "";
  let icon = "";
  
  switch(status) {
    case "MENUNGGU_PEMBAYARAN":
      if (settledTrans.length === 0) {
        displayLabel = "Menunggu Pembayaran DP";
        color = "bg-yellow-100 text-yellow-700";
        icon = "mdi:cash-clock";
      } else {
        displayLabel = "Menunggu Pelunasan";
        color = "bg-orange-100 text-orange-700";
        icon = "mdi:cash-multiple";
      }
      break;
      
    case "DIPROSES":
      displayLabel = "Sedang Diproses";
      color = "bg-blue-100 text-blue-700";
      icon = "mdi:factory";
      
      if (totalPaid > 0 && totalPaid < (order?.total_harga || 0)) {
        displayLabel = "Diproses (Menunggu Pelunasan)";
        color = "bg-blue-100 text-blue-700";
        icon = "mdi:factory";
      }
      break;
      
    case "SELESAI":
      displayLabel = "Selesai";
      color = "bg-green-100 text-green-700";
      icon = "mdi:check-circle";
      break;
      
    case "DIBATALKAN":
      displayLabel = "Dibatalkan";
      color = "bg-red-100 text-red-700";
      icon = "mdi:cancel";
      break;
      
    default:
      displayLabel = status.replaceAll("_", " ");
      color = "bg-gray-100 text-gray-700";
      icon = "mdi:information";
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${color} font-medium`}>
        <Icon icon={icon} className="text-lg" />
        <span>{displayLabel}</span>
      </div>
      {settledTrans.length > 0 && (
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
          {settledTrans.length === 1 ? "DP Terbayar" : "Lunas"}
        </span>
      )}
    </div>
  );
}