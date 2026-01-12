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
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      hasToken: !!token,
      token: token ? token.substring(0, 30) + '...' : 'none'
    });
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============= RESPONSE INTERCEPTOR =============
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Auto logout on 401
    if (error.response?.status === 401) {
      console.log('401 Unauthorized - clearing auth');
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
  // GET USER'S ORDERS - Sesuai dokumentasi API
  getMyOrders: async () => {
    try {
      // Endpoint: GET /api/pesanan/me - Ambil pesanan milik user
      const response = await api.get("/pesanan/me");
      return response.data;
    } catch (error) {
      console.error("Error in getMyOrders:", error);
      throw error;
    }
  },
  
  // GET ALL ORDERS (ADMIN ONLY) - Sesuai dokumentasi API  
  getAllOrders: async () => {
    try {
      // Endpoint: GET /api/pesanan/all - Ambil seluruh pesanan (Admin)
      const response = await api.get("/pesanan/all");
      return response.data;
    } catch (error) {
      console.error("Error in getAllOrders:", error);
      throw error;
    }
  },
  
  // CREATE ORDER - Sesuai dokumentasi API
  createOrder: async (data) => {
    try {
      // Endpoint: POST /api/pesanan - Buat pesanan baru
      const response = await api.post("/pesanan", data);
      return response.data;
    } catch (error) {
      console.error("Error in createOrder:", error);
      throw error;
    }
  },
  
  // GET ORDER DETAIL - Sesuai dokumentasi API
  getOrderDetail: async (id) => {
    try {
      // Endpoint: GET /api/pesanan/{id} - Ambil detail pesanan
      const response = await api.get(`/pesanan/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getOrderDetail:", error);
      throw error;
    }
  },
  
  // DELETE ORDER - Sesuai dokumentasi API
  deleteOrder: async (id) => {
    try {
      console.log('Calling DELETE /pesanan/' + id);
      
      // Endpoint: DELETE /api/pesanan/{id} - Hapus pesanan
      const response = await api.delete(`/pesanan/${id}`);
      
      console.log('Delete response:', response);
      return response.data;
    } catch (error) {
      console.error('Error in deleteOrder:', error);
      throw error;
    }
  },
  
  // UPDATE ORDER STATUS (ADMIN) - Sesuai dokumentasi API
  updateOrderStatus: async (id, data) => {
    try {
      // Endpoint: PATCH /api/pesanan/{id}/status - Update status pesanan
      const response = await api.patch(`/pesanan/${id}/status`, data);
      return response.data;
    } catch (error) {
      console.error("Error in updateOrderStatus:", error);
      throw error;
    }
  },
  
  // GET USER SUMMARY - Sesuai dokumentasi API
  getUserSummary: async () => {
    try {
      // Endpoint: GET /api/pesanan/me/summary - Ringkasan pesanan customer
      const response = await api.get("/pesanan/me/summary");
      return response.data;
    } catch (error) {
      console.error("Error in getUserSummary:", error);
      throw error;
    }
  },
  
  // GET ADMIN SUMMARY - Sesuai dokumentasi API
  getAdminSummary: async () => {
    try {
      // Endpoint: GET /api/pesanan/admin/summary - Ringkasan pesanan admin
      const response = await api.get("/pesanan/admin/summary");
      return response.data;
    } catch (error) {
      console.error("Error in getAdminSummary:", error);
      throw error;
    }
  },
};

// ============= PAYMENT SERVICE =============
export const paymentService = {
  createPayment: async (data) => {
    try {
      const response = await api.post("/transaksi", data);
      return response.data;
    } catch (error) {
      console.error("Error in createPayment:", error);
      throw error;
    }
  },
  
  cancelPayment: async (id_transaksi) => {
    try {
      // Endpoint: DELETE /api/transaksi/{id} - Batalkan pembayaran
      const response = await api.delete(`/transaksi/${id_transaksi}`);
      return response.data;
    } catch (error) {
      console.error("Error in cancelPayment:", error);
      throw error;
    }
  },
  
  getPaymentStatus: async (orderId) => {
    try {
      const response = await api.get(`/transaksi/status/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Error in getPaymentStatus:", error);
      throw error;
    }
  },
  
  getPaymentHistory: async () => {
    try {
      const response = await api.get("/transaksi/me");
      return response.data;
    } catch (error) {
      console.error("Error in getPaymentHistory:", error);
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
  getOrders: orderService.getMyOrders,
  getAllOrders: orderService.getAllOrders,
  createOrder: orderService.createOrder,
  getOrderDetail: orderService.getOrderDetail,
  updateOrderStatus: orderService.updateOrderStatus,
  deleteOrder: orderService.deleteOrder,
  
  // Transactions
  createPayment: paymentService.createPayment,
  getPaymentStatus: paymentService.getPaymentStatus,
};

export default API;
export { api };