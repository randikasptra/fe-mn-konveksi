// src/pages/customer/Cart.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);

  // Load cart items from localStorage
  useEffect(() => {
    loadCartItems();
  }, []);

  const loadCartItems = () => {
    const savedCart = localStorage.getItem("mn_cart");
    if (savedCart) {
      const items = JSON.parse(savedCart);
      setCartItems(items);
      setSelectedItems(items.map((item) => item.productId));
    }
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Update quantity
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.productId === productId
        ? { ...item, quantity: newQuantity, total: item.harga * newQuantity }
        : item
    );

    setCartItems(updatedCart);
    localStorage.setItem("mn_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  // Remove item
  const removeItem = (productId) => {
    const updatedCart = cartItems.filter(
      (item) => item.productId !== productId
    );
    setCartItems(updatedCart);
    localStorage.setItem("mn_cart", JSON.stringify(updatedCart));
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success("Produk dihapus dari keranjang");
  };

  // Toggle select item
  const toggleSelectItem = (productId) => {
    setSelectedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Select all items
  const toggleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.productId));
    }
  };

  // Calculate selected items total
  const selectedTotal = cartItems
    .filter((item) => selectedItems.includes(item.productId))
    .reduce((sum, item) => sum + item.total, 0);

  const selectedCount = selectedItems.length;

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (selectedCount === 0) {
      toast.error("Pilih minimal 1 produk untuk checkout");
      return;
    }

    const checkoutItems = cartItems.filter((item) =>
      selectedItems.includes(item.productId)
    );

    localStorage.setItem("mn_checkout_items", JSON.stringify(checkoutItems));
    navigate("/checkout");
  };

  // Empty cart state
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:cart-off" className="text-gray-400 text-4xl" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Keranjang Kosong
            </h2>
            <p className="text-gray-600 mb-8">
              Tambahkan produk ke keranjang untuk memulai pemesanan
            </p>
            <Link
              to="/produk"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold"
            >
              <Icon icon="mdi:shopping" />
              Jelajahi Produk
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Keranjang Belanja
          </h1>
          <p className="text-gray-600">
            {cartItems.length} produk di keranjang
          </p>
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {/* Select All */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedItems.length === cartItems.length &&
                    cartItems.length > 0
                  }
                  onChange={toggleSelectAll}
                  className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                />
                <span className="font-medium text-gray-900">
                  Pilih Semua ({cartItems.length})
                </span>
              </label>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex gap-4">
                      {/* Checkbox */}
                      <div className="flex items-start pt-1">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.productId)}
                          onChange={() => toggleSelectItem(item.productId)}
                          className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                      </div>

                      {/* Product Image */}
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                        {item.foto ? (
                          <img
                            src={item.foto}
                            alt={item.nama_produk}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon
                              icon="mdi:tshirt-crew"
                              className="text-gray-400 text-2xl"
                            />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {item.nama_produk}
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-3">
                              {item.size && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  Ukuran: {item.size}
                                </span>
                              )}
                              {item.color && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                  Warna: {item.color}
                                </span>
                              )}
                              {item.estimasi_pengerjaan && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                                  ⏱️ {item.estimasi_pengerjaan}
                                </span>
                              )}
                            </div>
                          </div>

                          <button
                            onClick={() => removeItem(item.productId)}
                            className="text-gray-400 hover:text-red-500 h-fit"
                          >
                            <Icon
                              icon="mdi:trash-can-outline"
                              className="text-xl"
                            />
                          </button>
                        </div>

                        {/* Price & Quantity */}
                        <div className="flex justify-between items-center">
                          <div className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            {formatPrice(item.harga)}
                          </div>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 border border-gray-300 rounded-xl p-2">
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Icon icon="mdi:minus" />
                              </button>
                              <span className="text-lg font-medium w-8 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  updateQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100"
                              >
                                <Icon icon="mdi:plus" />
                              </button>
                            </div>

                            <div className="text-right">
                              <p className="text-sm text-gray-500">Subtotal</p>
                              <p className="text-lg font-bold text-gray-900">
                                {formatPrice(item.total)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link
                to="/produk"
                className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                <Icon icon="mdi:arrow-left" />
                Lanjutkan Belanja
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1 mt-8 lg:mt-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Ringkasan Belanja
                </h3>

                {/* Order Details */}
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Produk</span>
                    <span className="font-medium">{selectedCount} produk</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Harga</span>
                    <span className="font-medium">
                      {formatPrice(selectedTotal)}
                    </span>
                  </div>

                  {/* Shipping (free) */}
                  <div className="flex justify-between border-t border-gray-200 pt-4">
                    <span className="text-gray-600">Ongkos Kirim</span>
                    <span className="font-medium text-emerald-600">Gratis</span>
                  </div>

                  {/* Discount */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Diskon</span>
                    <span className="font-medium text-emerald-600">- Rp 0</span>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="border-t border-gray-200 pt-4 mb-6">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {formatPrice(selectedTotal)}
                      </div>
                      <p className="text-sm text-gray-500">Termasuk PPN 10%</p>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={proceedToCheckout}
                  disabled={selectedCount === 0 || loading}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:credit-card" />
                      Lanjut ke Checkout ({selectedCount})
                    </>
                  )}
                </button>

                {/* Payment Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Icon
                      icon="mdi:shield-check"
                      className="text-emerald-600 text-xl"
                    />
                    <span className="font-medium text-gray-900">
                      Pembayaran Aman
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Terlindungi dengan enkripsi SSL dan dukungan pembayaran
                    lengkap
                  </p>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Kode Promo</h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Masukkan kode promo"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button className="px-4 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:shadow-md transition-all">
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
