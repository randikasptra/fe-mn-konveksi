// src/components/customer/ProductDetailModal.jsx
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { produkService } from "../../services/api";
import { useNavigate } from "react-router-dom";

const ProductDetailModal = ({ productId, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState(null);
  const [activeTab, setActiveTab] = useState("detail");
  const [addingToCart, setAddingToCart] = useState(false);
  const [orderEstimation, setOrderEstimation] = useState("");

  useEffect(() => {
    const loadProductDetail = async () => {
      try {
        setLoading(true);
        const response = await produkService.getProdukDetail(productId);
        setProduct(response.data);

        // Set default color jika ada
        if (response.data.warna && response.data.warna.length > 0) {
          setSelectedColor(response.data.warna[0]);
        }
      } catch (error) {
        console.error("Error loading product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId && isOpen) {
      loadProductDetail();
    }
  }, [productId, isOpen]);

  // Hitung estimasi pengerjaan (5 baju = 1 hari)
  useEffect(() => {
    if (product?.estimasi_pengerjaan && quantity) {
      const baseDays = product.estimasi_pengerjaan;
      const extraDays = Math.floor(quantity / 5);
      const totalDays = baseDays + extraDays;

      if (totalDays === 1) {
        setOrderEstimation(`${totalDays} hari`);
      } else if (totalDays <= 7) {
        setOrderEstimation(`${totalDays} hari`);
      } else if (totalDays <= 30) {
        const weeks = Math.ceil(totalDays / 7);
        setOrderEstimation(`${weeks} minggu`);
      } else {
        const months = Math.ceil(totalDays / 30);
        setOrderEstimation(`${months} bulan`);
      }
    }
  }, [product, quantity]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 1000) {
      setQuantity(newQuantity);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateTotal = () => {
    if (!product?.harga) return 0;
    return product.harga * quantity;
  };

  const handleAddToCart = async () => {
    if (!localStorage.getItem("mn_token")) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    setAddingToCart(true);
    try {
      const cartItem = {
        productId: product.id_produk,
        nama_produk: product.nama_produk,
        harga: product.harga,
        quantity,
        size: selectedSize,
        color: selectedColor,
        foto: product.foto,
        estimasi_pengerjaan: orderEstimation,
        total: calculateTotal(),
      };

      // Simpan ke localStorage atau API
      const existingCart = JSON.parse(localStorage.getItem("mn_cart") || "[]");
      existingCart.push(cartItem);
      localStorage.setItem("mn_cart", JSON.stringify(existingCart));

      // Trigger cart update event
      window.dispatchEvent(new Event("cartUpdated"));

      // Show success notification
      window.dispatchEvent(
        new CustomEvent("showNotification", {
          detail: { message: "✅ Produk berhasil ditambahkan ke keranjang" },
        })
      );

      onClose();
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleDirectOrder = () => {
    if (!localStorage.getItem("mn_token")) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    const orderData = {
      productId: product.id_produk,
      quantity,
      size: selectedSize,
      color: selectedColor,
      total: calculateTotal(),
    };

    localStorage.setItem("mn_direct_order", JSON.stringify(orderData));
    navigate("/checkout");
    onClose();
  };

  const handleWhatsAppOrder = () => {
    const phoneNumber = "6281234567890";
    const message = `Halo, saya ingin memesan produk:\n\n📌 *${
      product.nama_produk
    }*\n💰 Harga: ${formatPrice(
      product.harga
    )}\n🔢 Jumlah: ${quantity} pcs\n📐 Ukuran: ${selectedSize}\n🎨 Warna: ${
      selectedColor || "Standard"
    }\n⏱️ Estimasi: ${orderEstimation}\n💰 Total: ${formatPrice(
      calculateTotal()
    )}\n\nMohon info detail pembayarannya.`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b px-8 py-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Detail Produk
            </h2>
            <p className="text-sm text-gray-500">Lengkapi detail pemesanan</p>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <Icon icon="mdi:close" className="text-2xl text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center p-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : product ? (
            <div className="md:flex">
              {/* Left - Image Gallery */}
              <div className="md:w-2/5 p-8">
                <div className="sticky top-8">
                  <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden shadow-lg">
                    <img
                      src={product.foto || "/placeholder.jpg"}
                      alt={product.nama_produk}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.is_best_seller && (
                      <div className="absolute top-4 left-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 text-sm font-bold shadow-lg rounded-r-lg">
                        🏆 BEST SELLER
                      </div>
                    )}
                  </div>

                  {/* Product Info Box */}
                  <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Estimasi Pengerjaan
                        </p>
                        <p className="font-semibold text-gray-900">
                          {orderEstimation}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Minimal Pesanan</p>
                        <p className="font-semibold text-gray-900">
                          {product.minimal_pesan || 1} pcs
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Bahan</p>
                        <p className="font-semibold text-gray-900">
                          {product.bahan || "-"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Kategori</p>
                        <p className="font-semibold text-gray-900">
                          {product.kategori || "-"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right - Details & Actions */}
              <div className="md:w-3/5 p-8 border-l border-gray-100">
                {/* Tabs */}
                <div className="flex gap-1 mb-8 p-1 bg-gray-100 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === "detail"
                        ? "bg-white shadow-md text-indigo-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Detail
                  </button>
                  <button
                    onClick={() => setActiveTab("spec")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === "spec"
                        ? "bg-white shadow-md text-indigo-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Spesifikasi
                  </button>
                  <button
                    onClick={() => setActiveTab("order")}
                    className={`px-6 py-3 rounded-xl font-medium transition-all ${
                      activeTab === "order"
                        ? "bg-white shadow-md text-indigo-700"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Cara Order
                  </button>
                </div>

                {/* Product Name & Price */}
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {product.nama_produk}
                  </h1>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(product.harga)}
                    </span>
                    <span className="text-gray-500">/pcs</span>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <p className="text-gray-600 leading-relaxed">
                    {product.deskripsi}
                  </p>
                </div>

                {/* Configuration Section */}
                <div className="space-y-8 mb-8">
                  {/* Size Selection */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Ukuran</h4>
                      <span className="text-sm text-gray-500">
                        Pilih ukuran yang sesuai
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {["XS", "S", "M", "L", "XL", "XXL", "Custom"].map(
                        (size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-5 py-3 border rounded-xl font-medium transition-all ${
                              selectedSize === size
                                ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-sm"
                                : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                            }`}
                          >
                            {size}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Color Selection */}
                  {product.warna && product.warna.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-900">Warna</h4>
                        <span className="text-sm text-gray-500">
                          Pilih warna yang tersedia
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {product.warna.map((color) => (
                          <button
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`relative p-1 rounded-xl border-2 transition-all ${
                              selectedColor === color
                                ? "border-indigo-600"
                                : "border-gray-300 hover:border-gray-400"
                            }`}
                          >
                            <div
                              className="w-12 h-12 rounded-lg"
                              style={{ backgroundColor: color }}
                              title={color}
                            />
                            {selectedColor === color && (
                              <div className="absolute -top-2 -right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
                                <Icon
                                  icon="mdi:check"
                                  className="text-white text-xs"
                                />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Jumlah</h4>
                      <span className="text-sm text-gray-500">
                        Estimasi: {orderEstimation} (
                        {product.estimasi_pengerjaan} hari +{" "}
                        {Math.floor(quantity / 5)} hari tambahan)
                      </span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-4 border-2 border-gray-200 rounded-2xl p-2">
                        <button
                          onClick={() => handleQuantityChange(-1)}
                          className="w-12 h-12 rounded-xl border flex items-center justify-center hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={quantity <= (product.minimal_pesan || 1)}
                        >
                          <Icon icon="mdi:minus" className="text-xl" />
                        </button>
                        <div className="text-center min-w-[60px]">
                          <span className="text-2xl font-bold text-gray-900">
                            {quantity}
                          </span>
                          <p className="text-xs text-gray-500">pcs</p>
                        </div>
                        <button
                          onClick={() => handleQuantityChange(1)}
                          className="w-12 h-12 rounded-xl border flex items-center justify-center hover:bg-gray-100"
                        >
                          <Icon icon="mdi:plus" className="text-xl" />
                        </button>
                      </div>
                      <div className="text-sm text-gray-500">
                        {quantity >= 5 && (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <Icon icon="mdi:clock-fast" />
                            <span>
                              +{Math.floor(quantity / 5)} hari tambahan (5 pcs =
                              1 hari)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="mb-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900">
                      Ringkasan Pesanan
                    </h4>
                    <button
                      onClick={() => setQuantity(1)}
                      className="text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Reset
                    </button>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Harga Satuan</span>
                      <span className="font-medium">
                        {formatPrice(product.harga)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Jumlah</span>
                      <span className="font-medium">{quantity} pcs</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Estimasi Pengerjaan</span>
                      <span className="font-medium">{orderEstimation}</span>
                    </div>
                    <div className="pt-3 border-t border-gray-300">
                      <div className="flex justify-between">
                        <span className="text-lg font-bold text-gray-900">
                          Total
                        </span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(calculateTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="group px-6 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-900 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {addingToCart ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Icon
                          icon="mdi:cart-plus"
                          className="text-xl group-hover:scale-110"
                        />
                        Tambah ke Keranjang
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDirectOrder}
                    className="group px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Icon
                      icon="mdi:credit-card"
                      className="text-xl group-hover:scale-110"
                    />
                    Bayar Sekarang
                  </button>

                  <button
                    onClick={handleWhatsAppOrder}
                    className="group px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3 md:col-span-2"
                  >
                    <Icon
                      icon="mdi:whatsapp"
                      className="text-2xl group-hover:scale-110"
                    />
                    Pesan via WhatsApp
                  </button>
                </div>

                {/* Payment Info */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <Icon
                      icon="mdi:shield-check"
                      className="text-emerald-600 text-xl"
                    />
                    <div>
                      <p className="text-sm font-medium text-emerald-800">
                        Pembayaran Aman
                      </p>
                      <p className="text-xs text-emerald-600">
                        Transfer bank, QRIS, dan COD tersedia
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:package-variant-remove"
                  className="text-gray-400 text-3xl"
                />
              </div>
              <p className="text-gray-500 text-lg">Produk tidak ditemukan</p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
