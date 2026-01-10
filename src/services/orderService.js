import API from "./api";

const OrderService = {
  // ================= GET ORDERS =================
  async getOrders() {
    try {
      const token = localStorage.getItem("mn_token");
      
      if (!token) {
        throw new Error("Anda belum login. Silakan login terlebih dahulu.");
      }

      const response = await API.getOrders();
      
      // Handle berbagai kemungkinan struktur response
      let ordersData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        ordersData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        ordersData = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        // Cari properti pertama yang berisi array
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            ordersData = response.data[key];
            break;
          }
        }
      }
      
      // Normalize status
      return ordersData.map(order => {
        let status = order.status_pesanan || "";
        
        // Mapping dari frontend ke backend jika perlu
        if (status === "DIBUAT") status = "MENUNGGU_PEMBAYARAN";
        if (status === "MENUNGGU_DP") status = "MENUNGGU_PEMBAYARAN";
        if (status === "MENUNGGU_PELUNASAN") status = "MENUNGGU_PEMBAYARAN";
        
        return {
          ...order,
          status_pesanan: status
        };
      });
      
    } catch (error) {
      if (error.response?.status === 401) {
        throw new Error("Sesi Anda telah berakhir. Silakan login kembali.");
      }
      throw new Error(error.response?.data?.message || "Gagal memuat pesanan");
    }
  },

  // ================= CREATE PAYMENT =================
  async createPayment({ id_pesanan, jenis_pembayaran, order }) {
    try {
      const response = await API.createPayment({
        id_pesanan,
        jenis_pembayaran,
        nominal: jenis_pembayaran === "DP" 
          ? Math.ceil(order.total_harga * 0.5)
          : order.total_harga - (order.transaksi || [])
              .filter(t => t.midtrans_status === "settlement")
              .reduce((sum, t) => sum + t.nominal, 0)
      });

      if (response.data?.success && response.data.data?.snap_token) {
        return response.data.data.snap_token;
      }
      
      throw new Error("Gagal mendapatkan token pembayaran");
      
    } catch (error) {
      throw new Error(error.response?.data?.message || "Gagal membuat pembayaran");
    }
  }
};

export default OrderService;