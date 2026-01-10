// src/components/admin/OrderFilters.jsx
import React from "react";
import { MdSearch } from "react-icons/md";

const FilterButton = ({ children, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
      active
        ? 'bg-indigo-600 text-white shadow-sm'
        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }`}
  >
    {children}
  </button>
);

const OrderFilters = ({ 
  filter, 
  setFilter, 
  search, 
  setSearch, 
  stats 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="flex-1 relative">
        <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Cari ID pesanan, produk, customer, atau catatan..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        <FilterButton active={filter === "all"} onClick={() => setFilter("all")}>
          Semua ({stats.total})
        </FilterButton>
        <FilterButton active={filter === "pending"} onClick={() => setFilter("pending")}>
          Baru ({stats.pending})
        </FilterButton>
        <FilterButton active={filter === "waiting_dp"} onClick={() => setFilter("waiting_dp")}>
          Menunggu DP ({stats.waitingDP})
        </FilterButton>
        <FilterButton active={filter === "waiting_payment"} onClick={() => setFilter("waiting_payment")}>
          Menunggu Lunas ({stats.waitingPayment})
        </FilterButton>
        <FilterButton active={filter === "processing"} onClick={() => setFilter("processing")}>
          Diproses ({stats.processing})
        </FilterButton>
        <FilterButton active={filter === "completed"} onClick={() => setFilter("completed")}>
          Selesai ({stats.completed})
        </FilterButton>
        <FilterButton active={filter === "cancelled"} onClick={() => setFilter("cancelled")}>
          Dibatalkan ({stats.cancelled})
        </FilterButton>
      </div>
    </div>
  );
};

export default OrderFilters;