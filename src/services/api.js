// src/services/api.js
import axios from "axios";

const API_BASE_URL = "https://be-mn-konveksi.vercel.app/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor untuk menambahkan token jika ada
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mn_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const produkService = {
  // Ambil semua produk
  getAllProduk: async () => {
    try {
      const response = await apiClient.get("/produk");
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Ambil produk dengan limit
  getProdukLimit: async (limit = 4) => {
    try {
      const response = await apiClient.get("/produk");
      const data = response.data.data || [];
      return data.slice(0, limit);
    } catch (error) {
      console.error("Error fetching limited products:", error);
      throw error;
    }
  },

  // Ambil detail produk
  getProdukDetail: async (id) => {
    try {
      const response = await apiClient.get(`/produk/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
};

export const authService = {
  isLoggedIn: () => {
    return !!localStorage.getItem("mn_token");
  },

  getUserToken: () => {
    return localStorage.getItem("mn_token");
  },

  logout: () => {
    localStorage.removeItem("mn_token");
    window.location.href = "/login";
  },
};

export const orderService = {
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post("/pesanan", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  getOrdersByUser: async () => {
    try {
      const response = await apiClient.get("/pesanan/user");
      return response.data;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },
};
