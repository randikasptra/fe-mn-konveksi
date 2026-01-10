// src/components/admin/OrderStatsCards.jsx
import React from "react";
import {
  MdInventory,
  MdPayment,
  MdFactory,
  MdCheckCircle,
  MdCancel,
  MdAttachMoney,
} from "react-icons/md";

const OrderStatsCards = ({ stats }) => {
  const statCards = [
    {
      title: "Total Pesanan",
      value: stats.total,
      color: "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border-indigo-200",
      icon: <MdInventory className="text-indigo-600" size={24} />,
    },
    {
      title: "Menunggu DP",
      value: stats.waitingDP,
      color: "bg-gradient-to-r from-yellow-50 to-orange-50 text-yellow-700 border-yellow-200",
      icon: <MdPayment className="text-yellow-600" size={24} />,
    },
    {
      title: "Diproses",
      value: stats.processing,
      color: "bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border-blue-200",
      icon: <MdFactory className="text-blue-600" size={24} />,
    },
    {
      title: "Selesai",
      value: stats.completed,
      color: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border-green-200",
      icon: <MdCheckCircle className="text-green-600" size={24} />,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <div 
          key={index}
          className={`p-4 border rounded-xl ${card.color} hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium mb-1">{card.title}</p>
              <p className="text-2xl font-bold">{card.value}</p>
            </div>
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStatsCards;