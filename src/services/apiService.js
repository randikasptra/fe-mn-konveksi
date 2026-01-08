// src/services/apiService.js
import axios from "axios";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("mn_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  }
);

export const produkService = {
  getProdukLimit: async (limit) => {
    try {
      const response = await api.get(`/produk?limit=${limit || 8}`);
      return response.data.data || [];
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
};

export const authService = {
  isLoggedIn: () => {
    const token = localStorage.getItem("mn_token");
    const user = localStorage.getItem("mn_user");
    return !!(token && user);
  },
};