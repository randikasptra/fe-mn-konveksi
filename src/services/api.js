// src/services/api.js
import axios from "axios";

// ============= SINGLE SOURCE OF TRUTH =============
const API_BASE = "https://be-mn-konveksi.vercel.app/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============= REQUEST INTERCEPTOR =============
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mn_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============= RESPONSE INTERCEPTOR =============
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Auto logout on 401
    if (error.response?.status === 401) {
      localStorage.removeItem("mn_token");
      localStorage.removeItem("mn_user");
      window.dispatchEvent(new Event("authChanged"));
      // Optional: redirect to login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ============= AUTH SERVICE =============
export const authService = {
  isLoggedIn: () => {
    const token = localStorage.getItem("mn_token");
    const user = localStorage.getItem("mn_user");
    return !!(token && user);
  },
  
  login: async (data) => {
    try {
      const response = await api.post("/auth/login", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  register: async (data) => {
    try {
      const response = await api.post("/auth/register", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await api.post("/auth/logout");
      localStorage.removeItem("mn_token");
      localStorage.removeItem("mn_user");
      window.dispatchEvent(new Event("authChanged"));
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  me: async () => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= PRODUK SERVICE =============
export const produkService = {
  getProduk: async (params) => {
    try {
      const response = await api.get("/produk", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },
  
  getProdukDetail: async (id) => {
    try {
      const response = await api.get(`/produk/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching product detail:", error);
      throw error;
    }
  },
  
  getProdukLimit: async (limit = 8) => {
    try {
      const response = await api.get(`/produk?limit=${limit}`);
      return response.data.data || [];
    } catch (error) {
      console.error("Error fetching products with limit:", error);
      throw error;
    }
  },
  
  createProduk: async (data) => {
    try {
      const response = await api.post("/produk", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  updateProduk: async (id, data) => {
    try {
      const response = await api.put(`/produk/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  deleteProduk: async (id) => {
    try {
      const response = await api.delete(`/produk/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= ORDER SERVICE =============
export const orderService = {
  // CREATE ORDER
  createOrder: async (data) => {
    try {
      const response = await api.post("/pesanan/create", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET USER'S ORDERS
  getMyOrders: async () => {
    try {
      const response = await api.get("/pesanan/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET ALL ORDERS (ADMIN ONLY)
  getAllOrders: async () => {
    try {
      const response = await api.get("/pesanan");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET ORDER DETAIL
  getOrderDetail: async (id) => {
    try {
      const response = await api.get(`/pesanan/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // UPDATE ORDER STATUS (ADMIN)
  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/pesanan/${id}/status`, { status });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // DELETE ORDER
  deleteOrder: async (id, data = {}) => {
    try {
      const response = await api.delete(`/pesanan/${id}`, {
        data: data // Kirim data di body untuk DELETE request
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET DASHBOARD SUMMARY (USER)
  getUserSummary: async () => {
    try {
      const response = await api.get("/pesanan/summary/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  // GET DASHBOARD SUMMARY (ADMIN)
  getAdminSummary: async () => {
    try {
      const response = await api.get("/pesanan/summary/admin");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= PAYMENT SERVICE =============
export const paymentService = {
  createPayment: async (data) => {
    try {
      const response = await api.post("/transaksi/create", data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(`/transaksi/status/${orderId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getPaymentHistory: async () => {
    try {
      const response = await api.get("/transaksi/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ============= DEFAULT EXPORT (Legacy Support) =============
const API = {
  // Auth
  login: authService.login,
  register: authService.register,
  logout: authService.logout,
  me: authService.me,
  
  // Products
  getProducts: produkService.getProduk,
  getProductDetail: produkService.getProdukDetail,
  getProdukLimit: produkService.getProdukLimit,
  
  // Orders
  getOrders: orderService.getMyOrders, // Default untuk user
  getAllOrders: orderService.getAllOrders, // Untuk admin
  createOrder: orderService.createOrder,
  getOrderDetail: orderService.getOrderDetail,
  updateOrderStatus: orderService.updateOrderStatus,
  deleteOrder: orderService.deleteOrder, // ✅ DITAMBAHKAN
  
  // Transactions
  createPayment: paymentService.createPayment,
  getPaymentStatus: paymentService.getPaymentStatus,
};

export default API;

// Export axios instance jika diperlukan
export { api };