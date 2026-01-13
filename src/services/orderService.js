// src/services/orderService.js
import { orderService as apiOrderService, paymentService } from "./api";

const OrderService = {
  // ================= HELPER: CHECK PAYMENT STATUS - ✅ FIXED =================
  checkPaymentStatus(order) {
    const transaksi = order.transaksi || [];

    const pendingTransactions = transaksi.filter(
      (t) => t.midtrans_status === "pending"
    );
    const settledTransactions = transaksi.filter(
      (t) => t.midtrans_status === "settlement"
    );

    // ✅ FIX: Gunakan field 'jumlah' dari backend, bukan 'nominal'
    const totalPaid = settledTransactions.reduce((sum, t) => {
      // Backend menggunakan field 'jumlah', bukan 'nominal'
      const amount = Number(t.jumlah || t.nominal || 0);

      console.log(`✅ Transaction ${t.id_transaksi}:`, {
        jenis: t.jenis_pembayaran,
        jumlah: t.jumlah,
        nominal: t.nominal,
        detected: amount,
        status: t.midtrans_status,
      });

      return sum + amount;
    }, 0);

    const remaining = Math.max(0, (order.total_harga || 0) - totalPaid);
    const isFullyPaid = totalPaid >= (order.total_harga || 0);

    console.log("💰 Payment Status Summary:", {
      orderId: order.id_pesanan,
      totalHarga: order.total_harga,
      totalPaid,
      remaining,
      isFullyPaid,
      percentage: ((totalPaid / order.total_harga) * 100).toFixed(1) + "%",
      settledCount: settledTransactions.length,
      pendingCount: pendingTransactions.length,
    });

    return {
      hasPayment: transaksi.length > 0,
      isPending: pendingTransactions.length > 0,
      isPaid: totalPaid > 0,
      isFullyPaid,
      totalPaid,
      remaining,
      pendingTransactions,
      settledTransactions,
    };
  },

  // ================= CUSTOMER: GET MY ORDERS =================
  async getOrders() {
    try {
      const token = localStorage.getItem("mn_token");

      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      const response = await apiOrderService.getMyOrders();
      console.log("OrderService.getOrders response:", response);

      let ordersData = [];

      if (response && response.success && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response && typeof response === "object") {
        for (const key in response) {
          if (Array.isArray(response[key])) {
            ordersData = response[key];
            break;
          }
        }
      }

      return ordersData.map((order) => {
        let status = order.status_pesanan || "";

        if (status === "DIBUAT") status = "MENUNGGU_PEMBAYARAN";
        if (status === "MENUNGGU_DP") status = "MENUNGGU_PEMBAYARAN";
        if (status === "MENUNGGU_PELUNASAN") status = "MENUNGGU_PEMBAYARAN";

        return {
          ...order,
          status_pesanan: status,
        };
      });
    } catch (error) {
      console.error("OrderService.getOrders error:", error);

      if (error.response?.status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      }
      throw new Error(
        error.response?.data?.message || error.message || "Gagal memuat pesanan"
      );
    }
  },

  // ================= ADMIN: GET ALL ORDERS =================
  async fetchAllOrders(token) {
    try {
      if (!token) {
        return {
          success: false,
          error: "Token tidak ditemukan. Silakan login kembali.",
        };
      }

      const response = await apiOrderService.getAllOrders(token);
      console.log("OrderService.fetchAllOrders response:", response);

      let ordersData = [];

      if (response && response.success && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      }

      return {
        success: true,
        data: ordersData,
      };
    } catch (error) {
      console.error("OrderService.fetchAllOrders error:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal memuat pesanan",
      };
    }
  },

  // ================= ADMIN: UPDATE ORDER STATUS =================
  async updateOrderStatus(id_pesanan, status_pesanan, token) {
    try {
      const backendStatus = this.mapStatusToBackend(status_pesanan);

      const response = await fetch(
        `https://be-mn-konveksi.vercel.app/api/pesanan/${id_pesanan}/status`,
        {
          method: "OUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status_pesanan: backendStatus }),
        }
      );

      const data = await response.json();
      console.log("OrderService.updateOrderStatus response:", data);

      if (data && data.success) {
        return {
          success: true,
          message: data.message || "Status pesanan berhasil diperbarui",
          data: data.data,
        };
      }

      return {
        success: true,
        message: "Status pesanan berhasil diperbarui",
      };
    } catch (error) {
      console.error("OrderService.updateOrderStatus error:", error);

      return {
        success: false,
        error:
          error.response?.data?.message ||
          error.message ||
          "Gagal mengubah status pesanan",
      };
    }
  },

  // ================= DELETE ORDER (CUSTOMER & ADMIN) =================
  async deleteOrder(id_pesanan, token = null) {
    try {
      console.log("OrderService.deleteOrder called for ID:", id_pesanan);

      const response = await apiOrderService.deleteOrder(id_pesanan, token);
      console.log("OrderService.deleteOrder response:", response);

      if (response && response.success) {
        return {
          success: true,
          message: response.message || "Pesanan berhasil dihapus",
        };
      }

      if (response && response.message) {
        return {
          success: true,
          message: response.message,
        };
      }

      return {
        success: true,
        message: "Pesanan berhasil dihapus",
      };
    } catch (error) {
      console.error("OrderService.deleteOrder error:", error);

      let errorMessage = "Gagal menghapus pesanan";

      if (error.response?.status === 400) {
        errorMessage =
          error.response.data?.message ||
          error.response.data?.error ||
          "Pesanan tidak dapat dihapus";
      } else if (error.response?.status === 403) {
        errorMessage = "Anda tidak diizinkan menghapus pesanan ini";
      } else if (error.response?.status === 404) {
        errorMessage = "Pesanan tidak ditemukan";
      } else if (error.response?.status === 401) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali.";
      } else {
        errorMessage =
          error.response?.data?.message || error.message || errorMessage;
      }

      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  // ================= CANCEL PAYMENT =================
  async cancelPayment(id_transaksi) {
    try {
      console.log("Cancelling payment:", id_transaksi);

      const response = await paymentService.cancelPayment(id_transaksi);
      console.log("Cancel payment response:", response);

      if (response && response.success) {
        return response.message || "Pembayaran berhasil dibatalkan";
      }

      return "Pembayaran berhasil dibatalkan";
    } catch (error) {
      console.error("Cancel payment error:", error);

      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error;
        throw new Error(errorMessage || "Pembayaran tidak dapat dibatalkan");
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Gagal membatalkan pembayaran"
      );
    }
  },

  // ================= CREATE PAYMENT =================
  async createPayment({ id_pesanan, jenis_pembayaran, order }) {
    try {
      // ✅ Hitung nominal berdasarkan jenis pembayaran
      let nominal;

      if (jenis_pembayaran === "DP") {
        // DP = 50% dari total
        nominal = order.dp_wajib || Math.ceil(order.total_harga * 0.5);
      } else if (jenis_pembayaran === "FULL") {
        // FULL = total harga
        nominal = order.total_harga;
      } else if (jenis_pembayaran === "PELUNASAN") {
        // PELUNASAN = total - DP yang sudah dibayar
        const settledTransactions = (order.transaksi || []).filter(
          (t) => t.midtrans_status === "settlement"
        );

        const totalPaid = settledTransactions.reduce((sum, t) => {
          return sum + Number(t.jumlah || t.nominal || 0);
        }, 0);

        nominal = order.total_harga - totalPaid;

        console.log("💰 Pelunasan calculation:", {
          totalHarga: order.total_harga,
          totalPaid,
          pelunasan: nominal,
        });
      }

      const response = await paymentService.createPayment({
        id_pesanan,
        jenis_pembayaran,
        nominal,
      });

      console.log("Create payment response:", response);

      if (response?.success && response.data?.snap_token) {
        return response.data.snap_token;
      }

      if (response?.snap_token) {
        return response.snap_token;
      }

      if (response?.data?.snap_token) {
        return response.data.snap_token;
      }

      throw new Error("Gagal mendapatkan token pembayaran");
    } catch (error) {
      console.error("Create payment error:", error);
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Gagal membuat pembayaran"
      );
    }
  },

  // ================= HELPER: MAP STATUS TO FRONTEND =================
  mapStatusToFrontend(backendStatus) {
    const statusMap = {
      MENUNGGU_PEMBAYARAN: "MENUNGGU_DP", // INI YANG SALAH!
      MENUNGGU_DP: "MENUNGGU_DP",
      MENUNGGU_PELUNASAN: "MENUNGGU_PELUNASAN",
      DIPROSES: "DIPROSES",
      SELESAI: "SELESAI",
      DIBATALKAN: "DIBATALKAN",
      DIBUAT: "DIBUAT",
    };

    return statusMap[backendStatus] || backendStatus;
  },

  // ================= HELPER: MAP STATUS TO BACKEND =================
  mapStatusToBackend(frontendStatus) {
    // KONVERSI KE FORMAT BACKEND
    const statusMap = {
      DIBUAT: "DIBUAT",
      MENUNGGU_DP: "MENUNGGU_PEMBAYARAN", // Ini yang benar!
      MENUNGGU_PELUNASAN: "MENUNGGU_PELUNASAN",
      DIPROSES: "DIPROSES",
      SELESAI: "SELESAI",
      DIBATALKAN: "DIBATALKAN",
    };

    return statusMap[frontendStatus] || frontendStatus;
  },

  // ================= HELPER: GET STATUS LABEL =================
  getStatusLabel(status) {
    const labels = {
      DIBUAT: "Menunggu Konfirmasi",
      MENUNGGU_DP: "Menunggu DP",
      MENUNGGU_PELUNASAN: "Menunggu Pelunasan",
      MENUNGGU_PEMBAYARAN: "Menunggu Pembayaran",
      DIPROSES: "Sedang Diproduksi",
      SELESAI: "Selesai",
      DIBATALKAN: "Dibatalkan",
    };

    return labels[status] || status;
  },

  // ================= HELPER: GET STATUS DESCRIPTION =================
  getStatusDescription(status) {
    const descriptions = {
      DIBUAT: "Pesanan baru dibuat, menunggu konfirmasi admin",
      MENUNGGU_DP: "Menunggu pembayaran DP 50% dari customer",
      MENUNGGU_PELUNASAN: "DP sudah dibayar, menunggu pelunasan 50%",
      MENUNGGU_PEMBAYARAN: "Menunggu pembayaran dari customer",
      DIPROSES: "Pesanan sedang dalam proses produksi",
      SELESAI: "Pesanan telah selesai diproduksi",
      DIBATALKAN: "Pesanan dibatalkan",
    };

    return descriptions[status] || status;
  },

  // ================= HELPER: CAN UPDATE STATUS =================
  canUpdateStatus(order, newStatus) {
    const paymentStatus = this.checkPaymentStatus(order);
    const currentStatus = order.status_pesanan;

    // Tidak bisa update jika ada pembayaran pending
    if (paymentStatus.isPending) {
      return {
        valid: false,
        message: "Tidak dapat mengubah status saat ada pembayaran pending",
      };
    }

    // Validasi transisi status
    const validTransitions = {
      DIBUAT: ["MENUNGGU_DP", "DIBATALKAN"],
      MENUNGGU_DP: ["MENUNGGU_PELUNASAN", "DIPROSES", "DIBATALKAN"],
      MENUNGGU_PELUNASAN: ["DIPROSES", "DIBATALKAN"],
      DIPROSES: ["SELESAI"],
      SELESAI: [],
      DIBATALKAN: [],
    };

    const allowedStatuses = validTransitions[currentStatus] || [];

    if (!allowedStatuses.includes(newStatus)) {
      return {
        valid: false,
        message: `Tidak dapat mengubah status dari ${this.getStatusLabel(
          currentStatus
        )} ke ${this.getStatusLabel(newStatus)}`,
      };
    }

    // Validasi pembayaran untuk DIPROSES
    if (newStatus === "DIPROSES" && !paymentStatus.isPaid) {
      return {
        valid: false,
        message: "Pesanan harus sudah dibayar (minimal DP) sebelum diproses",
      };
    }

    return { valid: true };
  },

  // ================= HELPER: GET NEXT VALID STATUS =================
  getNextValidStatus(order) {
    const paymentStatus = this.checkPaymentStatus(order);
    const currentStatus = order.status_pesanan;

    // Jika ada pembayaran pending, tidak ada aksi
    if (paymentStatus.isPending) {
      return [];
    }

    const nextStatuses = {
      DIBUAT: ["MENUNGGU_DP", "DIBATALKAN"],
      MENUNGGU_DP: paymentStatus.isPaid
        ? ["MENUNGGU_PELUNASAN", "DIPROSES", "DIBATALKAN"]
        : ["DIBATALKAN"],
      MENUNGGU_PELUNASAN: paymentStatus.isFullyPaid
        ? ["DIPROSES", "DIBATALKAN"]
        : ["DIBATALKAN"],
      DIPROSES: ["SELESAI"],
      SELESAI: [],
      DIBATALKAN: [],
    };

    return nextStatuses[currentStatus] || [];
  },

  // ================= ADMIN: GET STATISTICS =================
  getStatistics(orders) {
    const stats = {
      total: orders.length,
      pending: 0,
      waitingDP: 0,
      waitingPayment: 0,
      processing: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0,
    };

    orders.forEach((order) => {
      const paymentStatus = this.checkPaymentStatus(order);

      if (order.status_pesanan === "DIBUAT") {
        stats.pending++;
      } else if (order.status_pesanan === "MENUNGGU_DP") {
        stats.waitingDP++;
      } else if (order.status_pesanan === "MENUNGGU_PELUNASAN") {
        stats.waitingPayment++;
      } else if (order.status_pesanan === "DIPROSES") {
        stats.processing++;
      } else if (order.status_pesanan === "SELESAI") {
        stats.completed++;
      } else if (order.status_pesanan === "DIBATALKAN") {
        stats.cancelled++;
      }

      // Hitung revenue dari pesanan yang lunas
      if (paymentStatus.isFullyPaid) {
        stats.revenue += order.total_harga || 0;
      }
    });

    return stats;
  },

  // ================= ADMIN: FILTER ORDERS =================
  filterOrders(orders, filter, search) {
    let filtered = [...orders];

    // Filter by status
    if (filter !== "all") {
      filtered = filtered.filter((order) => {
        switch (filter) {
          case "pending":
            return order.status_pesanan === "DIBUAT";
          case "waiting_dp":
            return order.status_pesanan === "MENUNGGU_DP";
          case "waiting_payment":
            return order.status_pesanan === "MENUNGGU_PELUNASAN";
          case "processing":
            return order.status_pesanan === "DIPROSES";
          case "completed":
            return order.status_pesanan === "SELESAI";
          case "cancelled":
            return order.status_pesanan === "DIBATALKAN";
          default:
            return true;
        }
      });
    }

    // Search filter
    if (search && search.trim() !== "") {
      const searchLower = search.toLowerCase().trim();

      filtered = filtered.filter((order) => {
        const id = order.id_pesanan?.toString().toLowerCase() || "";
        const produk = order.produk?.nama_produk?.toLowerCase() || "";
        const customer = order.user?.nama?.toLowerCase() || "";
        const email = order.user?.email?.toLowerCase() || "";
        const catatan = order.catatan?.toLowerCase() || "";

        return (
          id.includes(searchLower) ||
          produk.includes(searchLower) ||
          customer.includes(searchLower) ||
          email.includes(searchLower) ||
          catatan.includes(searchLower)
        );
      });
    }

    return filtered;
  },

  // ================= HELPER: FORMAT CURRENCY =================
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  },

  // ================= HELPER: FORMAT DATE =================
  formatDate(dateString) {
    if (!dateString) return "-";

    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      return dateString;
    }
  },
};

export default OrderService;
