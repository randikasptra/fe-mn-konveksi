import React from "react";
import { Icon } from "@iconify/react";

export default function ProgressTracker({ status, transaksi, order }) {
  const settledTrans = (transaksi || []).filter(t => t.midtrans_status === "settlement");
  const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
  const orderTotal = order?.total_harga || 0;
  
  const getSteps = () => {
    if (status === "SELESAI") {
      return [
        { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
        { id: "DP_PAID", label: "DP Dibayar", icon: "mdi:cash-check" },
        { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
        { id: "FULL_PAYMENT", label: "Pelunasan", icon: "mdi:cash-multiple" },
        { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
      ];
    }
    
    if (status === "DIPROSES") {
      if (totalPaid >= orderTotal) {
        return [
          { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
          { id: "DP_PAID", label: "DP Dibayar", icon: "mdi:cash-check" },
          { id: "FULL_PAYMENT", label: "Lunas", icon: "mdi:cash-multiple" },
          { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
          { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
        ];
      } else {
        return [
          { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
          { id: "DP_PAID", label: "DP Dibayar", icon: "mdi:cash-check" },
          { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
          { id: "FULL_PAYMENT", label: "Pelunasan", icon: "mdi:cash-multiple" },
          { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
        ];
      }
    }
    
    if (settledTrans.length === 0) {
      return [
        { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
        { id: "DP_PAID", label: "Bayar DP", icon: "mdi:cash" },
        { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
        { id: "FULL_PAYMENT", label: "Pelunasan", icon: "mdi:cash-multiple" },
        { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
      ];
    } else {
      return [
        { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
        { id: "DP_PAID", label: "DP Terbayar", icon: "mdi:cash-check" },
        { id: "FULL_PAYMENT", label: "Bayar Pelunasan", icon: "mdi:cash-multiple" },
        { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
        { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
      ];
    }
  };
  
  const steps = getSteps();
  
  let currentStep = 0;
  
  if (status === "SELESAI") {
    currentStep = 4;
  } else if (status === "DIPROSES") {
    currentStep = totalPaid >= orderTotal ? 3 : 2;
  } else if (status === "MENUNGGU_PEMBAYARAN") {
    currentStep = settledTrans.length === 0 ? 1 : 2;
  }
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Status Pengerjaan</h3>
        <span className="text-sm font-medium text-gray-900">
          {steps[currentStep]?.label || "Pesanan Dibuat"}
        </span>
      </div>
      
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
        <div 
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
                  ${isCurrent ? 'scale-110 ring-4 ring-indigo-100' : ''}
                `}>
                  <Icon icon={step.icon} className="text-xl" />
                </div>
                <span className={`text-xs font-medium text-center ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}