// src/services/customer/pageServices.js
import {
  productService,
  orderService,
  cartService,
  authService,
  favoriteService,
  utilityService,
} from "./customerService";

// Home Page Services
export const homeService = {
  getFeaturedProducts: async (limit = 8) => {
    try {
      const data = await productService.getAllProducts();
      const products = data.data || [];
      return products.slice(0, limit);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }
  },

  getStats: async () => {
    try {
      // You can fetch stats from your API
      return {
        totalOrders: 1250,
        happyCustomers: 850,
        productsMade: 5000,
        yearsExperience: 10,
      };
    } catch (error) {
      console.error("Error fetching stats:", error);
      return null;
    }
  },
};

// Products Page Services
export const productsService = {
  getProductsWithFilters: async (filters = {}) => {
    try {
      const { page = 1, limit = 12, category, search, sort } = filters;
      const params = { page, limit };

      if (category) params.kategori = category;
      if (search) params.search = search;
      if (sort) params.sort = sort;

      const response = await productService.getAllProducts(params);
      return {
        products: response.data || [],
        total: response.total || 0,
        page: response.page || 1,
        totalPages: response.totalPages || 1,
      };
    } catch (error) {
      console.error("Error fetching products with filters:", error);
      return { products: [], total: 0, page: 1, totalPages: 1 };
    }
  },

  getProductFilters: async () => {
    try {
      const categories = await productService.getCategories();
      return {
        categories: categories.data || [],
        sizes: ["XS", "S", "M", "L", "XL", "XXL"],
        colors: [
          "#57595B",
          "#3a3c3e",
          "#ffffff",
          "#e53e3e",
          "#3182ce",
          "#38a169",
        ],
        materials: ["Katun", "Polyester", "Denim", "Linen", "Sutra"],
        priceRanges: [
          { label: "≤ Rp 50.000", min: 0, max: 50000 },
          { label: "Rp 50.000 - 100.000", min: 50000, max: 100000 },
          { label: "Rp 100.000 - 200.000", min: 100000, max: 200000 },
          { label: "≥ Rp 200.000", min: 200000, max: 9999999 },
        ],
      };
    } catch (error) {
      console.error("Error fetching product filters:", error);
      return {
        categories: [],
        sizes: [],
        colors: [],
        materials: [],
        priceRanges: [],
      };
    }
  },
};

// Cart Page Services
export const cartPageService = {
  getCartDetails: () => {
    const cartItems = cartService.getCart();
    const subtotal = cartService.getCartTotal();
    const shipping = subtotal > 100000 ? 0 : 15000; // Free shipping above 100k
    const tax = subtotal * 0.11; // 11% tax
    const total = subtotal + shipping + tax;

    return {
      items: cartItems,
      summary: {
        subtotal,
        shipping,
        tax,
        total,
        itemsCount: cartItems.length,
        totalQuantity: cartItems.reduce((sum, item) => sum + item.quantity, 0),
      },
    };
  },

  validateCart: () => {
    const cartItems = cartService.getCart();
    const errors = [];

    cartItems.forEach((item, index) => {
      if (!item.product.stok || item.quantity > item.product.stok) {
        errors.push({
          itemIndex: index,
          message: `Stok ${item.product.nama_produk} tidak mencukupi`,
          product: item.product,
        });
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

// Checkout Page Services
export const checkoutService = {
  processOrder: async (orderData) => {
    try {
      // Create order
      const orderResponse = await orderService.createOrder(orderData);

      // Clear cart if order successful
      if (orderResponse.success) {
        cartService.clearCart();
        window.dispatchEvent(new Event("orderCreated"));
      }

      return orderResponse;
    } catch (error) {
      console.error("Error processing order:", error);
      throw error;
    }
  },

  getShippingOptions: () => {
    return [
      {
        id: "jne",
        name: "JNE Reguler",
        cost: 15000,
        estimatedDays: "3-5 hari",
        description: "Pengiriman reguler",
      },
      {
        id: "jne-express",
        name: "JNE Express",
        cost: 25000,
        estimatedDays: "1-2 hari",
        description: "Pengiriman cepat",
      },
      {
        id: "tiki",
        name: "TIKI Reguler",
        cost: 18000,
        estimatedDays: "3-5 hari",
        description: "Pengiriman door to door",
      },
      {
        id: "gojek",
        name: "GoSend",
        cost: 20000,
        estimatedDays: "Hari yang sama",
        description: "Pengiriman instant (khusus Jabodetabek)",
      },
    ];
  },

  getPaymentMethods: () => {
    return [
      {
        id: "bank-transfer",
        name: "Transfer Bank",
        banks: [
          { name: "BCA", account: "1234567890", holder: "MN Konveksi" },
          { name: "Mandiri", account: "0987654321", holder: "MN Konveksi" },
          { name: "BNI", account: "1122334455", holder: "MN Konveksi" },
        ],
      },
      {
        id: "qris",
        name: "QRIS",
        description: "Scan QR code untuk pembayaran",
      },
      {
        id: "cod",
        name: "COD (Cash on Delivery)",
        description: "Bayar saat barang diterima",
        available: true, // Can toggle based on location
      },
    ];
  },
};

// Orders Page Services
export const ordersService = {
  getOrdersWithStatus: async (status = "") => {
    try {
      const response = await orderService.getUserOrders(status);

      // Group orders by status
      const orders = response.data || [];
      const groupedOrders = {
        pending: orders.filter((order) =>
          ["MENUNGGU_DP", "MENUNGGU_KONFIRMASI"].includes(order.status_pesanan)
        ),
        processing: orders.filter((order) =>
          ["DIPROSES", "DIKIRIM"].includes(order.status_pesanan)
        ),
        completed: orders.filter((order) =>
          ["SELESAI"].includes(order.status_pesanan)
        ),
        cancelled: orders.filter((order) =>
          ["DIBATALKAN"].includes(order.status_pesanan)
        ),
      };

      return {
        allOrders: orders,
        groupedOrders,
        stats: {
          total: orders.length,
          pending: groupedOrders.pending.length,
          processing: groupedOrders.processing.length,
          completed: groupedOrders.completed.length,
          cancelled: groupedOrders.cancelled.length,
        },
      };
    } catch (error) {
      console.error("Error fetching orders with status:", error);
      return { allOrders: [], groupedOrders: {}, stats: {} };
    }
  },

  getOrderTracking: async (orderId) => {
    try {
      // This would come from your API
      return {
        orderId,
        trackingNumber: "TRK" + Date.now(),
        status: "DIKIRIM",
        estimatedDelivery: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
        history: [
          {
            status: "PESANAN_DIBUAT",
            date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Pesanan dibuat",
          },
          {
            status: "DIPROSES",
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Pesanan sedang diproses",
          },
          {
            status: "DIKIRIM",
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            description: "Pesanan telah dikirim",
          },
        ],
      };
    } catch (error) {
      console.error("Error fetching order tracking:", error);
      throw error;
    }
  },
};

// Profile Page Services
export const profileService = {
  getUserData: async () => {
    try {
      const user = authService.getCurrentUser();
      const customerData = await customerService.getProfile();
      const addresses = await customerService.getAddresses();

      return {
        user,
        profile: customerData.data || {},
        addresses: addresses.data || [],
        stats: {
          totalOrders: 12,
          totalSpent: 2450000,
          memberSince: "2023-01-15",
        },
      };
    } catch (error) {
      console.error("Error fetching user data:", error);
      return { user: null, profile: {}, addresses: [], stats: {} };
    }
  },

  updateUserProfile: async (profileData) => {
    try {
      // Update in auth service
      await authService.updateProfile(profileData);

      // Update in customer service if needed
      if (profileData.phone || profileData.address) {
        await customerService.updateProfile(profileData);
      }

      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  },
};

// Contact Page Services
export const contactService = {
  submitContactForm: async (formData) => {
    try {
      const response = await utilityService.submitContactForm(formData);
      return response;
    } catch (error) {
      console.error("Error submitting contact form:", error);
      throw error;
    }
  },

  getContactInfo: () => {
    return {
      phone: "+62 812 3456 7890",
      email: "info@mnkonveksi.com",
      address: "Jl. Konveksi No. 123, Jakarta Selatan, Indonesia",
      businessHours: {
        weekdays: "08:00 - 17:00",
        saturday: "08:00 - 15:00",
        sunday: "Closed",
      },
      socialMedia: {
        instagram: "@mnkonveksi",
        facebook: "MN Konveksi",
        twitter: "@mnkonveksi",
      },
    };
  },
};

// Export all page services
export default {
  homeService,
  productsService,
  cartPageService,
  checkoutService,
  ordersService,
  profileService,
  contactService,
};
