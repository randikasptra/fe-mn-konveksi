// src/services/orderService.js
import { orderService as apiOrderService, paymentService } from "./api";

const OrderService = {
  // ================= GET ORDERS - ✅ FIXED =================
  async getOrders() {
    try {
      const token = localStorage.getItem("mn_token");

      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      // ✅ Gunakan getMyOrders dari API
      const response = await apiOrderService.getMyOrders();

      console.log("OrderService.getOrders response:", response);

      // Handle berbagai kemungkinan struktur response
      let ordersData = [];

      if (response && response.success && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (Array.isArray(response)) {
        ordersData = response;
      } else if (response && Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response && typeof response === "object") {
        // Cari properti pertama yang berisi array
        for (const key in response) {
          if (Array.isArray(response[key])) {
            ordersData = response[key];
            break;
          }
        }
      }

      console.log("Processed orders data:", ordersData);

      // Normalize status
      return ordersData.map((order) => {
        let status = order.status_pesanan || "";

        // Mapping dari frontend ke backend jika perlu
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

  // ================= CREATE PAYMENT =================
  async createPayment({ id_pesanan, jenis_pembayaran, order }) {
    try {
      const nominal =
        jenis_pembayaran === "DP"
          ? Math.ceil(order.total_harga * 0.5)
          : order.total_harga -
            (order.transaksi || [])
              .filter((t) => t.midtrans_status === "settlement")
              .reduce((sum, t) => sum + t.nominal, 0);

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

  // ================= DELETE ORDER - ✅ FIXED =================
  async deleteOrder(id_pesanan) {
    try {
      console.log("OrderService.deleteOrder called for ID:", id_pesanan);

      const response = await apiOrderService.deleteOrder(id_pesanan);

      console.log("OrderService.deleteOrder response:", response);

      // ✅ Fix: Response structure bisa berbeda
      // Backend return: {success: true, message: 'Pesanan berhasil dihapus'}
      if (response && response.success) {
        return response.message || "Pesanan berhasil dihapus";
      }

      // Jika hanya ada message
      if (response && response.message) {
        return response.message;
      }

      // Fallback
      return "Pesanan berhasil dihapus";
    } catch (error) {
      console.error("OrderService.deleteOrder error:", error);

      // Handle specific error responses
      if (error.response?.status === 400) {
        const errorMessage =
          error.response.data?.message || error.response.data?.error;

        if (errorMessage) {
          throw new Error(errorMessage);
        }

        throw new Error("Pesanan tidak dapat dihapus");
      } else if (error.response?.status === 403) {
        throw new Error("Anda tidak diizinkan menghapus pesanan ini");
      } else if (error.response?.status === 404) {
        throw new Error("Pesanan tidak ditemukan");
      } else if (error.response?.status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      }

      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Gagal menghapus pesanan"
      );
    }
  },

  // ================= CANCEL PAYMENT - ✅ NEW =================
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
};

// Export default
export default OrderService;
