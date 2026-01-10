// src/pages/admin/OrdersAdmin.jsx
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { MdRefresh } from "react-icons/md";
import OrderService from "../../services/orderService";
import OrderStatsCards from "../../components/admin/OrderStatsCards";
import OrderFilters from "../../components/admin/OrderFilters";
import OrderTable from "../../components/admin/OrderTable";
import OrderDetailModal from "../../components/admin/OrderDetailModal";

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    waitingDP: 0,
    waitingPayment: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0,
  });

  const loadOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("mn_token");
      
      if (!token) {
        toast.error("Token tidak ditemukan. Silakan login kembali.");
        return;
      }

      const result = await OrderService.fetchAllOrders(token);
      
      if (result.success) {
        const data = result.data;
        setOrders(Array.isArray(data) ? data : []);
        
        const statsCalc = OrderService.getStatistics(data);
        setStats(statsCalc);
      } else {
        toast.error(result.error || "Gagal memuat pesanan");
        setOrders([]);
      }
    } catch (error) {
      console.error("Error loading orders:", error);
      toast.error("Gagal memuat pesanan");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // Refresh every 30 seconds for real-time updates
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id_pesanan, status_pesanan) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("mn_token");
      
      const result = await OrderService.updateOrderStatus(id_pesanan, status_pesanan, token);
      
      if (result.success) {
        toast.success(result.message);
        await loadOrders();
        setSelectedOrder(null);
      } else {
        toast.error(result.error || "Gagal mengubah status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Gagal mengubah status");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteOrder = async (id_pesanan) => {
    try {
      const token = localStorage.getItem("mn_token");
      const result = await OrderService.deleteOrder(id_pesanan, token);
      
      if (result.success) {
        toast.success(result.message);
        await loadOrders();
        if (selectedOrder?.id_pesanan === id_pesanan) {
          setSelectedOrder(null);
        }
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      throw new Error(error.message || "Gagal menghapus pesanan");
    }
  };

  const filteredOrders = OrderService.filterOrders(orders, filter, search);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Manajemen Pesanan
          </h2>
          <p className="text-sm text-gray-500">
            Total {stats.total} pesanan • {stats.waitingDP} menunggu DP
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={loadOrders}
            disabled={loading || updating}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <MdRefresh size={18} />
            {loading ? "Memuat..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* STATS CARDS */}
      <OrderStatsCards stats={stats} />

      {/* FILTERS & SEARCH */}
      <OrderFilters 
        filter={filter}
        setFilter={setFilter}
        search={search}
        setSearch={setSearch}
        stats={stats}
      />

      {/* TABLE */}
      <OrderTable 
        orders={filteredOrders}
        loading={loading}
        search={search}
        setSearch={setSearch}
        onSelectOrder={setSelectedOrder}
        orderService={OrderService}
      />

      {/* ORDER DETAIL MODAL */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          orderService={OrderService}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onDelete={handleDeleteOrder}
        />
      )}
    </div>
  );
}