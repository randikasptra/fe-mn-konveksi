// src/services/admin.js
import { api } from "../api";

export const adminService = {
  // ============= DASHBOARD STATS =============
  getDashboardStats: async () => {
    try {
      const response = await api.get("/pesanan/admin/summary");
      return response.data;
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      throw error;
    }
  },

  // ============= ORDER MANAGEMENT =============
  getOrders: async (params = {}) => {
    try {
      const response = await api.get("/pesanan", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw error;
    }
  },

  getOrderDetail: async (id) => {
    try {
      const response = await api.get(`/pesanan/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching order detail:", error);
      throw error;
    }
  },

  updateOrderStatus: async (id, status) => {
    try {
      const response = await api.put(`/pesanan/${id}/status`, { status });
      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw error;
    }
  },

  deleteOrder: async (id) => {
    try {
      const response = await api.delete(`/pesanan/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting order:", error);
      throw error;
    }
  },

  // ============= PRODUCT MANAGEMENT =============
  getProducts: async (params = {}) => {
    try {
      const response = await api.get("/produk", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  createProduct: async (data) => {
    try {
      const response = await api.post("/produk", data);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      const response = await api.put(`/produk/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating product:", error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      const response = await api.delete(`/produk/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
  },

  // ============= USER MANAGEMENT =============
  getUsers: async (params = {}) => {
    try {
      const response = await api.get("/users", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  },

  getUserDetail: async (id) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching user detail:", error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      const response = await api.put(`/users/${id}`, data);
      return response.data;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  },

  // ============= REPORTS =============
  getRevenueReport: async (params = {}) => {
    try {
      const response = await api.get("/reports/revenue", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching revenue report:", error);
      throw error;
    }
  },

  getSalesReport: async (params = {}) => {
    try {
      const response = await api.get("/reports/sales", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching sales report:", error);
      throw error;
    }
  },

  getOrderReport: async (params = {}) => {
    try {
      const response = await api.get("/reports/orders", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching order report:", error);
      throw error;
    }
  },

  // ============= SYSTEM STATS =============
  getSystemStats: async () => {
    try {
      const response = await api.get("/admin/system-stats");
      return response.data;
    } catch (error) {
      console.error("Error fetching system stats:", error);
      throw error;
    }
  },

  // ============= RECENT ACTIVITIES =============
  getRecentActivities: async (limit = 10) => {
    try {
      const response = await api.get(`/admin/recent-activities?limit=${limit}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  },

  // ============= FILE UPLOAD =============
  uploadFile: async (file, type = "product") => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);

      const response = await api.post("/admin/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },
};
