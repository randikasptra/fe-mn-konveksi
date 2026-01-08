// src/components/customer/ProductOrderModal.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import API from "../../services/api";

const ProductOrderModal = ({ isOpen, onClose, productId }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [paymentType, setPaymentType] = useState("DP");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !productId) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://be-mn-konveksi.vercel.app/api/produk/${productId}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setProduct(json.data);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat produk");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [isOpen, productId]);

  // Calculate prices
  const totalHarga = product ? product.harga * qty : 0;
  const hargaDP = Math.round(totalHarga * 0.5);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Handle order creation
  const handleCreateOrder = async () => {
    if (!qty || qty < 1) {
      toast.error("Silakan isi jumlah terlebih dahulu");
      return;
    }

    try {
      const token = localStorage.getItem("mn_token");
      if (!token) {
        toast.error("Silakan login terlebih dahulu");
        window.dispatchEvent(new Event("openLoginModal"));
        return;
      }

      setIsSubmitting(true);

      // Create pesanan
      const res = await fetch("https://be-mn-konveksi.vercel.app/api/pesanan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_produk: product.id_produk,
          qty: Number(qty),
          catatan,
        }),
      });

      const json = await res.json();

      if (res.status === 403) {
        toast.error(json.message || "Admin tidak dapat membuat pesanan");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat pesanan");
      }

      const orderId = json.data.id_pesanan;

      // Save to localStorage for payment page
      const orderData = {
        orderId,
        items: [
          {
            productId: product.id_produk,
            nama_produk: product.nama_produk,
            harga: product.harga,
            quantity: qty,
            total: totalHarga,
            foto: product.foto,
            estimasi_pengerjaan: product.estimasi_pengerjaan,
          },
        ],
        total: totalHarga,
        paymentMethod: paymentType.toLowerCase(),
        customerInfo: {
          catatan,
        },
      };

      localStorage.setItem("mn_current_order", JSON.stringify(orderData));
      localStorage.setItem("mn_current_order_id", orderId);

      toast.success("Pesanan dibuat! Lanjutkan ke pembayaran");

      // Navigate to payment
      navigate("/checkout/payment");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Pesan Produk</h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        {loading ? (
          <div className="p-20 text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Memuat produk...</p>
          </div>
        ) : !product ? (
          <div className="p-20 text-center">
            <p className="text-red-600">Produk tidak ditemukan</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden aspect-square">
                {product.foto ? (
                  <img
                    src={product.foto}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon
                      icon="mdi:tshirt-crew"
                      className="text-gray-400 text-6xl"
                    />
                  </div>
                )}
              </div>

              {/* Product Info & Order Form */}
              <div className="space-y-6">
                {/* Product Details */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {product.nama_produk}
                  </h3>
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(product.harga)}
                    </span>
                    <span className="text-gray-500">/ pcs</span>
                  </div>

                  {/* Product Info Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.bahan && (
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm rounded-lg">
                        {product.bahan}
                      </span>
                    )}
                    {product.kategori && (
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-lg">
                        {product.kategori}
                      </span>
                    )}
                    {product.estimasi_pengerjaan && (
                      <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-lg">
                        ⏱️ {product.estimasi_pengerjaan}
                      </span>
                    )}
                  </div>

                  {product.deskripsi && (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {product.deskripsi}
                    </p>
                  )}
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jumlah Pesanan
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Icon icon="mdi:minus" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={qty}
                      onChange={(e) =>
                        setQty(Math.max(1, parseInt(e.target.value) || 1))
                      }
                      className="w-20 text-center border border-gray-300 rounded-lg px-3 py-2 text-lg font-semibold"
                    />
                    <button
                      onClick={() => setQty(qty + 1)}
                      className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-100 flex items-center justify-center"
                    >
                      <Icon icon="mdi:plus" />
                    </button>
                    <span className="text-gray-600">pcs</span>
                  </div>
                </div>

                {/* Price Summary */}
                {qty > 0 && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Harga</span>
                      <span className="font-bold text-gray-900">
                        {formatPrice(totalHarga)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">DP 50%</span>
                      <span className="text-gray-700">
                        {formatPrice(hargaDP)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catatan (Opsional)
                  </label>
                  <textarea
                    rows={3}
                    value={catatan}
                    onChange={(e) => setCatatan(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    placeholder="Contoh: warna biru, ukuran XL, bordir logo perusahaan"
                  />
                </div>

                {/* Payment Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Jenis Pembayaran
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentType("DP")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentType === "DP"
                          ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-gray-900 mb-1">
                          Bayar DP 50%
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                          {formatPrice(hargaDP)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Pelunasan sebelum kirim
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentType("FULL")}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        paymentType === "FULL"
                          ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-bold text-gray-900 mb-1">
                          Bayar Lunas
                        </p>
                        <p className="text-lg font-bold text-indigo-600">
                          {formatPrice(totalHarga)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Langsung lunas
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    disabled={!qty || isSubmitting}
                    onClick={handleCreateOrder}
                    className="flex-1 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Icon icon="mdi:credit-card" className="text-xl" />
                        Lanjut ke Pembayaran
                      </>
                    )}
                  </button>

                  <a
                    href="https://wa.me/6285860333077"
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:whatsapp" className="text-xl" />
                  </a>
                </div>

                {/* Info */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 p-4">
                  <div className="flex items-start gap-3">
                    <Icon
                      icon="mdi:information"
                      className="text-emerald-600 text-xl mt-0.5"
                    />
                    <div className="text-sm text-emerald-700">
                      <p className="font-medium mb-1">
                        Pembayaran Aman & Terpercaya
                      </p>
                      <p className="text-emerald-600">
                        Transaksi dilindungi oleh Midtrans Payment Gateway
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductOrderModal;
