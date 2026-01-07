// src/hooks/useCustomerServices.js
import { useState, useEffect, useCallback } from 'react';
import customerServices, { 
  productService, 
  orderService, 
  cartService,
  authService,
  favoriteService 
} from '../services/customer/customerService';

export const useProductService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getAllProducts(params);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await productService.getProductById(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchProducts,
    fetchProductById,
    loading,
    error
  };
};

export const useCartService = () => {
  const [cart, setCart] = useState(cartService.getCart());
  const [cartCount, setCartCount] = useState(cartService.getCartCount());

  useEffect(() => {
    const handleCartUpdate = () => {
      setCart(cartService.getCart());
      setCartCount(cartService.getCartCount());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const addToCart = useCallback((product, quantity = 1, options = {}) => {
    const updatedCart = cartService.addToCart(product, quantity, options);
    setCart(updatedCart);
    setCartCount(cartService.getCartCount());
    return updatedCart;
  }, []);

  const updateCartItem = useCallback((itemId, quantity) => {
    const updatedCart = cartService.updateCartItem(itemId, quantity);
    setCart(updatedCart);
    setCartCount(cartService.getCartCount());
    return updatedCart;
  }, []);

  const removeFromCart = useCallback((itemId) => {
    const updatedCart = cartService.removeFromCart(itemId);
    setCart(updatedCart);
    setCartCount(cartService.getCartCount());
    return updatedCart;
  }, []);

  const clearCart = useCallback(() => {
    cartService.clearCart();
    setCart([]);
    setCartCount(0);
  }, []);

  const getCartTotal = useCallback(() => {
    return cartService.getCartTotal();
  }, []);

  return {
    cart,
    cartCount,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartTotal
  };
};

export const useAuthService = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(authService.isLoggedIn());
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setIsAuthenticated(authService.isLoggedIn());
      setUser(authService.getCurrentUser());
    };

    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const data = await authService.login(email, password);
      setIsAuthenticated(true);
      setUser(authService.getCurrentUser());
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setIsAuthenticated(false);
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (profileData) => {
    try {
      const data = await authService.updateProfile(profileData);
      setUser(authService.getCurrentUser());
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    isAuthenticated,
    user,
    login,
    logout,
    updateProfile
  };
};

export const useOrderService = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createOrder = useCallback(async (orderData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.createOrder(orderData);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserOrders = useCallback(async (status = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getUserOrders(status);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getOrderById(id);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createOrder,
    getUserOrders,
    getOrderById,
    loading,
    error
  };
};

// Export all hooks
export default {
  useProductService,
  useCartService,
  useAuthService,
  useOrderService
};