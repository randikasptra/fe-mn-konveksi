// src/services/api.js
import axios from "axios";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
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

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mn_token");
      localStorage.removeItem("mn_user");
      window.dispatchEvent(new Event("authChanged"));
    }
    return Promise.reject(error);
  }
);

// Named exports untuk kompatibilitas
export const produkService = {
  getProduk: (params) => api.get("/produk", { params }),
  getProdukDetail: (id) => api.get(`/produk/${id}`),
  getProdukLimit: async (limit) => {
    const response = await api.get(`/produk?limit=${limit || 8}`);
    return response.data.data || [];
  },
  // Tambahkan method lain sesuai kebutuhan
};

export const authService = {
  isLoggedIn: () => !!localStorage.getItem("mn_token"),
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
};

export const orderService = {
  createOrder: (data) => api.post("/pesanan/create", data),
  getOrders: () => api.get("/pesanan/me"),
  getOrderDetail: (id) => api.get(`/pesanan/${id}`),
};

export const paymentService = {
  createPayment: (data) => api.post("/transaksi/create", data),
  getPaymentStatus: (orderId) => api.get(`/transaksi/status/${orderId}`),
};

// Default export untuk kompatibilitas
const API = {
  // Auth
  login: (data) => api.post("/auth/login", data),
  register: (data) => api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),

  // Products
  getProducts: (params) => api.get("/produk", { params }),
  getProductDetail: (id) => api.get(`/produk/${id}`),
  getProdukLimit: (limit) => api.get(`/produk?limit=${limit || 8}`),

  // Orders
  createOrder: (data) => api.post("/pesanan/create", data),
  getOrders: () => api.get("/pesanan/me"),
  getOrderDetail: (id) => api.get(`/pesanan/${id}`),

  // Transactions
  createPayment: (data) => api.post("/transaksi/create", data),
  getPaymentStatus: (orderId) => api.get(`/transaksi/status/${orderId}`),
};

export default API;