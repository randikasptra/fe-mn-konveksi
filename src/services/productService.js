// src/services/productService.js
const API_BASE = "https://be-mn-konveksi.vercel.app/api";

class ProductService {
  /**
   * Get all products
   */
  async getProducts(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${API_BASE}/produk${queryString ? `?${queryString}` : ''}`;
      
      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Gagal memuat produk");
      }

      return {
        success: true,
        data: json.data || []
      };
    } catch (error) {
      console.error("Error fetching products:", error);
      return {
        success: false,
        message: error.message,
        data: []
      };
    }
  }

  /**
   * Get product detail by ID
   */
  async getProductDetail(id) {
    try {
      const response = await fetch(`${API_BASE}/produk/${id}`);
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message || "Produk tidak ditemukan");
      }

      return {
        success: true,
        data: json.data
      };
    } catch (error) {
      console.error("Error fetching product detail:", error);
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  /**
   * Get limited products (for homepage)
   */
  async getProductsLimit(limit = 8) {
    return this.getProducts({ limit });
  }

  /**
   * Create order/pesanan
   */
  async createOrder(orderData) {
    try {
      const token = localStorage.getItem("mn_token");
      if (!token) {
        throw new Error("Silakan login terlebih dahulu");
      }

      const response = await fetch(`${API_BASE}/pesanan`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const json = await response.json();

      if (response.status === 403) {
        throw new Error(json.message || "Admin tidak dapat membuat pesanan");
      }

      if (!response.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat pesanan");
      }

      return {
        success: true,
        data: json.data
      };
    } catch (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Format price to IDR
   */
  formatPrice(price) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price || 0);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem("mn_token");
    const user = localStorage.getItem("mn_user");
    return !!(token && user);
  }
}

export default new ProductService();