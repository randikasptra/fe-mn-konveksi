import axios from "axios";

const API_BASE_URL = "https://be-mn-konveksi.vercel.app/api";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token interceptor
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("mn_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem("mn_token");
      localStorage.removeItem("mn_user");
      window.dispatchEvent(new Event("authChanged"));
    }
    return Promise.reject(error);
  }
);

// Product Services
export const productService = {
  // Get all products
  getAllProducts: async (params = {}) => {
    try {
      const response = await apiClient.get("/produk", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get product by ID
  getProductById: async (id) => {
    try {
      const response = await apiClient.get(`/produk/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Get products with pagination
  getProductsPaginated: async (page = 1, limit = 12, filters = {}) => {
    try {
      const params = { page, limit, ...filters };
      const response = await apiClient.get("/produk", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching paginated products:", error);
      throw error;
    }
  },

  // Search products
  searchProducts: async (keyword, category = "") => {
    try {
      const response = await apiClient.get("/produk/search", {
        params: { keyword, category },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching products:", error);
      throw error;
    }
  },

  // Get product categories
  getCategories: async () => {
    try {
      const response = await apiClient.get("/produk/categories");
      return response.data;
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw error;
    }
  },
};

// Order Services
export const orderService = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post("/pesanan", orderData);
      return response.data;
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  },

  // Get user orders
  getUserOrders: async (status = "") => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get("/pesanan/user", { params });
      return response.data;
    } catch (error) {
      console.error("Error fetching user orders:", error);
      throw error;
    }
  },

  // Get order by ID
  getOrderById: async (id) => {
    try {
      const response = await apiClient.get(`/pesanan/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },

  // Update order status
  updateOrderStatus: async (id, status, notes = "") => {
    try {
      const response = await apiClient.put(`/pesanan/${id}/status`, {
        status,
        catatan: notes,
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating order ${id} status:`, error);
      throw error;
    }
  },

  // Cancel order
  cancelOrder: async (id, reason = "") => {
    try {
      const response = await apiClient.delete(`/pesanan/${id}`, {
        data: { alasan: reason },
      });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  },

  // Upload payment proof
  uploadPaymentProof: async (orderId, file) => {
    try {
      const formData = new FormData();
      formData.append("bukti_bayar", file);

      const response = await apiClient.post(
        `/pesanan/${orderId}/upload-payment`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error(
        `Error uploading payment proof for order ${orderId}:`,
        error
      );
      throw error;
    }
  },
};

// Cart Services
export const cartService = {
  // Get cart items from localStorage
  getCart: () => {
    try {
      const cart = localStorage.getItem("mn_cart");
      return cart ? JSON.parse(cart) : [];
    } catch {
      return [];
    }
  },

  // Add item to cart
  addToCart: (product, quantity = 1, options = {}) => {
    const cart = cartService.getCart();
    const existingItem = cart.find(
      (item) =>
        item.product.id_produk === product.id_produk &&
        JSON.stringify(item.options) === JSON.stringify(options)
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        product,
        quantity,
        options,
        addedAt: new Date().toISOString(),
      });
    }

    localStorage.setItem("mn_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    return cart;
  },

  // Update cart item quantity
  updateCartItem: (itemId, quantity) => {
    const cart = cartService.getCart();
    const itemIndex = cart.findIndex(
      (item) =>
        `${item.product.id_produk}-${JSON.stringify(item.options)}` === itemId
    );

    if (itemIndex !== -1) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        cart[itemIndex].quantity = quantity;
      }

      localStorage.setItem("mn_cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cartUpdated"));
    }

    return cart;
  },

  // Remove item from cart
  removeFromCart: (itemId) => {
    const cart = cartService.getCart();
    const filteredCart = cart.filter(
      (item) =>
        `${item.product.id_produk}-${JSON.stringify(item.options)}` !== itemId
    );

    localStorage.setItem("mn_cart", JSON.stringify(filteredCart));
    window.dispatchEvent(new Event("cartUpdated"));
    return filteredCart;
  },

  // Clear cart
  clearCart: () => {
    localStorage.removeItem("mn_cart");
    window.dispatchEvent(new Event("cartUpdated"));
  },

  // Get cart count
  getCartCount: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  },

  // Get cart total
  getCartTotal: () => {
    const cart = cartService.getCart();
    return cart.reduce((total, item) => {
      const price = item.product.harga || 0;
      return total + price * item.quantity;
    }, 0);
  },
};

// Auth Services
export const authService = {
  // Login
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });

      if (response.data.token) {
        localStorage.setItem("mn_token", response.data.token);
        localStorage.setItem("mn_user", JSON.stringify(response.data.data));
        window.dispatchEvent(new Event("authChanged"));
      }

      return response.data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      const response = await apiClient.post("/auth/register", userData);
      return response.data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    localStorage.removeItem("mn_token");
    localStorage.removeItem("mn_user");
    localStorage.removeItem("mn_cart");
    window.dispatchEvent(new Event("authChanged"));
    window.dispatchEvent(new Event("cartUpdated"));
  },

  // Check if user is logged in
  isLoggedIn: () => {
    return !!localStorage.getItem("mn_token");
  },

  // Get current user
  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("mn_user");
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await apiClient.put("/auth/profile", userData);

      // Update localStorage
      const currentUser = authService.getCurrentUser();
      const updatedUser = { ...currentUser, ...userData };
      localStorage.setItem("mn_user", JSON.stringify(updatedUser));
      window.dispatchEvent(new Event("userUpdated"));

      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiClient.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },
};

// Customer Services
export const customerService = {
  // Get customer profile
  getProfile: async () => {
    try {
      const response = await apiClient.get("/customer/profile");
      return response.data;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  },

  // Update customer profile
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.put("/customer/profile", profileData);
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },

  // Get customer addresses
  getAddresses: async () => {
    try {
      const response = await apiClient.get("/customer/addresses");
      return response.data;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      throw error;
    }
  },

  // Add new address
  addAddress: async (addressData) => {
    try {
      const response = await apiClient.post("/customer/addresses", addressData);
      return response.data;
    } catch (error) {
      console.error("Error adding address:", error);
      throw error;
    }
  },

  // Update address
  updateAddress: async (id, addressData) => {
    try {
      const response = await apiClient.put(
        `/customer/addresses/${id}`,
        addressData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  // Delete address
  deleteAddress: async (id) => {
    try {
      const response = await apiClient.delete(`/customer/addresses/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },
};

// Favorite Services
export const favoriteService = {
  // Get favorites
  getFavorites: async () => {
    try {
      const response = await apiClient.get("/customer/favorites");
      return response.data;
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw error;
    }
  },

  // Add to favorites
  addToFavorites: async (productId) => {
    try {
      const response = await apiClient.post("/customer/favorites", {
        productId,
      });
      return response.data;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw error;
    }
  },

  // Remove from favorites
  removeFromFavorites: async (productId) => {
    try {
      const response = await apiClient.delete(
        `/customer/favorites/${productId}`
      );
      return response.data;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw error;
    }
  },

  // Check if product is favorited
  isFavorited: async (productId) => {
    try {
      const favorites = await favoriteService.getFavorites();
      return (
        favorites.data?.some((fav) => fav.id_produk === productId) || false
      );
    } catch {
      return false;
    }
  },
};

// Utility Services
export const utilityService = {
  // Upload image
  uploadImage: async (file) => {
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await apiClient.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  },

  // Get provinces (for address)
  getProvinces: async () => {
    try {
      const response = await apiClient.get("/utils/provinces");
      return response.data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  },

  // Get cities by province
  getCities: async (provinceId) => {
    try {
      const response = await apiClient.get(`/utils/cities/${provinceId}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching cities:", error);
      throw error;
    }
  },

  // Contact form submission
  submitContactForm: async (formData) => {
    try {
      const response = await apiClient.post("/contact", formData);
      return response.data;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  },
};

// Export all services
export default {
  productService,
  orderService,
  cartService,
  authService,
  customerService,
  favoriteService,
  utilityService,
};
