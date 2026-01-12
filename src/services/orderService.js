// src/services/orderService.js
import API from "./api";

const OrderService = {
  // ================= STATUS MAPPING =================
  // Mapping antara frontend dan backend status
  mapStatusToFrontend(backendStatus) {
    const mapping = {
      "MENUNGGU_PEMBAYARAN": "MENUNGGU_DP", // Default ke MENUNGGU_DP di frontend
      "DIPROSES": "DIPROSES",
      "SELESAI": "SELESAI",
      "DIBATALKAN": "DIBATALKAN",
    };
    return mapping[backendStatus] || backendStatus;
  },

  mapStatusToBackend(frontendStatus) {
    const mapping = {
      "DIBUAT": "MENUNGGU_PEMBAYARAN",
      "MENUNGGU_DP": "MENUNGGU_PEMBAYARAN",
      "MENUNGGU_PELUNASAN": "MENUNGGU_PEMBAYARAN",
      "DIPROSES": "DIPROSES",
      "SELESAI": "SELESAI",
      "DIBATALKAN": "DIBATALKAN",
    };
    return mapping[frontendStatus] || frontendStatus;
  },

  // ================= STATUS METADATA =================
  getStatusMeta(status) {
    const frontendStatus = this.mapStatusToFrontend(status);
    
    const meta = {
      DIBUAT: {
        label: "Menunggu Konfirmasi",
        color: "bg-gray-100 text-gray-700 border-gray-300",
        icon: "inventory",
        description: "Pesanan dibuat, menunggu konfirmasi admin",
      },
      MENUNGGU_DP: {
        label: "Menunggu DP",
        color: "bg-yellow-100 text-yellow-700 border-yellow-300",
        icon: "payment",
        description: "Menunggu pembayaran DP 50% dari customer",
      },
      MENUNGGU_PELUNASAN: {
        label: "Menunggu Pelunasan",
        color: "bg-orange-100 text-orange-700 border-orange-300",
        icon: "hourglass",
        description: "DP sudah dibayar, menunggu pelunasan",
      },
      DIPROSES: {
        label: "Sedang Diproduksi",
        color: "bg-blue-100 text-blue-700 border-blue-300",
        icon: "factory",
        description: "Pesanan sedang dalam proses produksi",
      },
      SELESAI: {
        label: "Selesai",
        color: "bg-green-100 text-green-700 border-green-300",
        icon: "check",
        description: "Pesanan telah selesai dan siap diambil/dikirim",
      },
      DIBATALKAN: {
        label: "Dibatalkan",
        color: "bg-red-100 text-red-700 border-red-300",
        icon: "cancel",
        description: "Pesanan telah dibatalkan",
      },
    };
    return meta[frontendStatus] || meta.DIBUAT;
  },

  // ================= STATUS VALIDATION =================
  validateStatusChange(currentStatus, newStatus) {
    const validTransitions = {
      DIBUAT: ["MENUNGGU_DP", "DIBATALKAN"],
      MENUNGGU_DP: ["DIPROSES", "MENUNGGU_PELUNASAN", "DIBATALKAN"],
      MENUNGGU_PELUNASAN: ["DIPROSES", "DIBATALKAN"],
      DIPROSES: ["SELESAI", "DIBATALKAN"],
      SELESAI: [],
      DIBATALKAN: [],
    };

    const frontendCurrent = this.mapStatusToFrontend(currentStatus);
    const frontendNew = this.mapStatusToFrontend(newStatus);

    if (!validTransitions[frontendCurrent]?.includes(frontendNew)) {
      throw new Error(
        `Tidak dapat mengubah status dari ${this.getStatusLabel(currentStatus)} ke ${this.getStatusLabel(newStatus)}`
      );
    }

    return true;
  },

  // ================= STATUS LABELS =================
  getStatusLabel(status) {
    const frontendStatus = this.mapStatusToFrontend(status);
    const statusLabels = {
      DIBUAT: "Dibuat",
      MENUNGGU_DP: "Menunggu DP",
      MENUNGGU_PELUNASAN: "Menunggu Pelunasan",
      DIPROSES: "Diproses",
      SELESAI: "Selesai",
      DIBATALKAN: "Dibatalkan",
    };
    return statusLabels[frontendStatus] || frontendStatus;
  },

  getStatusDescription(status) {
    return this.getStatusMeta(status).description;
  },

  // ================= CHECK PAYMENT STATUS =================
  checkPaymentStatus(order) {
    if (!order.transaksi || order.transaksi.length === 0) {
      return { 
        hasPayment: false, 
        isPaid: false, 
        isPending: false,
        totalPaid: 0,
        isFullyPaid: false,
        remaining: order.total_harga || 0
      };
    }

    const pending = order.transaksi.some(t => t.midtrans_status === "pending");
    const settled = order.transaksi.filter(t => t.midtrans_status === "settlement");
    const totalPaid = settled.reduce((sum, t) => sum + (t.nominal || 0), 0);
    
    return {
      hasPayment: true,
      isPending: pending,
      isPaid: settled.length > 0,
      totalPaid,
      isFullyPaid: totalPaid >= (order.total_harga || 0),
      remaining: (order.total_harga || 0) - totalPaid,
    };
  },

  // ================= GET NEXT VALID STATUS =================
  getNextValidStatus(order) {
    const currentStatus = this.mapStatusToFrontend(order.status_pesanan);
    const paymentStatus = this.checkPaymentStatus(order);
    
    if (paymentStatus.isPending) {
      return ["MENUNGGU_DP", "MENUNGGU_PELUNASAN", "DIBATALKAN"];
    }

    switch (currentStatus) {
      case "DIBUAT":
        return ["MENUNGGU_DP", "DIBATALKAN"];
      
      case "MENUNGGU_DP":
        if (paymentStatus.isPaid && !paymentStatus.isFullyPaid) {
          return ["MENUNGGU_PELUNASAN", "DIPROSES", "DIBATALKAN"];
        }
        return ["DIPROSES", "DIBATALKAN"];
      
      case "MENUNGGU_PELUNASAN":
        if (paymentStatus.isFullyPaid) {
          return ["DIPROSES", "DIBATALKAN"];
        }
        return ["DIBATALKAN"];
      
      case "DIPROSES":
        return ["SELESAI", "DIBATALKAN"];
      
      case "SELESAI":
      case "DIBATALKAN":
        return [];
      
      default:
        return [];
    }
  },

  // ================= CAN UPDATE STATUS =================
  canUpdateStatus(order, newStatus) {
    try {
      const backendNewStatus = this.mapStatusToBackend(newStatus);
      this.validateStatusChange(order.status_pesanan, backendNewStatus);
      
      const paymentStatus = this.checkPaymentStatus(order);
      
      if (newStatus === "DIPROSES" && !paymentStatus.isPaid) {
        throw new Error("Tidak bisa mulai produksi tanpa pembayaran DP");
      }
      
      if (newStatus === "SELESAI" && !paymentStatus.isFullyPaid) {
        throw new Error("Tidak bisa menyelesaikan pesanan yang belum lunas");
      }
      
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        message: error.message
      };
    }
  },

  // ================= API METHODS =================
  async fetchAllOrders(token) {
    try {
      const response = await fetch("https://be-mn-konveksi.vercel.app/api/pesanan", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      return {
        success: true,
        data: json.data || json || [],
        error: null
      };
    } catch (error) {
      return {
        success: false,
        data: [],
        error: error.message || "Gagal memuat pesanan"
      };
    }
  },

  async updateOrderStatus(id_pesanan, status_pesanan, token) {
    try {
      const backendStatus = this.mapStatusToBackend(status_pesanan);
      
      const response = await fetch(`https://be-mn-konveksi.vercel.app/api/pesanan/${id_pesanan}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status_pesanan: backendStatus }),
      });

      const json = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: json,
          message: `Status berhasil diubah ke ${this.getStatusLabel(status_pesanan)}`
        };
      } else {
        throw new Error(json.message || "Gagal mengubah status");
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Gagal mengubah status"
      };
    }
  },

  async deleteOrder(id_pesanan, token) {
    try {
      const response = await fetch(`https://be-mn-konveksi.vercel.app/api/pesanan/${id_pesanan}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: json,
          message: "Pesanan berhasil dihapus"
        };
      } else {
        throw new Error(json.message || "Gagal menghapus pesanan");
      }
    } catch (error) {
      return {
        success: false,
        error: error.message || "Gagal menghapus pesanan"
      };
    }
  },

  // ================= FILTER ORDERS =================
  filterOrders(orders, filter, search = "") {
    let filtered = orders;

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(order => 
        order.id_pesanan?.toLowerCase().includes(searchLower) ||
        order.produk?.nama_produk?.toLowerCase().includes(searchLower) ||
        order.user?.nama?.toLowerCase().includes(searchLower) ||
        order.user?.email?.toLowerCase().includes(searchLower) ||
        order.catatan?.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filter === "all") return filtered;
    
    return filtered.filter(order => {
      const frontendStatus = this.mapStatusToFrontend(order.status_pesanan);
      
      switch (filter) {
        case "pending":
          return frontendStatus === "DIBUAT";
        case "waiting_dp":
          return frontendStatus === "MENUNGGU_DP";
        case "waiting_payment":
          return frontendStatus === "MENUNGGU_PELUNASAN";
        case "processing":
          return frontendStatus === "DIPROSES";
        case "completed":
          return frontendStatus === "SELESAI";
        case "cancelled":
          return frontendStatus === "DIBATALKAN";
        default:
          return true;
      }
    });
  },

  // ================= GET STATISTICS =================
  getStatistics(orders) {
    let stats = {
      total: 0,
      pending: 0,
      waitingDP: 0,
      waitingPayment: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
    };

    orders.forEach(order => {
      stats.total++;
      
      const frontendStatus = this.mapStatusToFrontend(order.status_pesanan);
      
      switch (frontendStatus) {
        case "DIBUAT":
          stats.pending++;
          break;
        case "MENUNGGU_DP":
          stats.waitingDP++;
          break;
        case "MENUNGGU_PELUNASAN":
          stats.waitingPayment++;
          break;
        case "DIPROSES":
          stats.processing++;
          break;
        case "SELESAI":
          stats.completed++;
          stats.revenue += order.total_harga || 0;
          break;
        case "DIBATALKAN":
          stats.cancelled++;
          break;
      }
    });

    return stats;
  },

  // ================= FORMATTERS =================
  formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  },

  formatDate(dateString) {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },
};

export default OrderService;