// src/components/customer/CheckoutModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import productService from "../../services/productService";

export default function CheckoutModal({ product, onClose }) {
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [paymentType, setPaymentType] = useState("DP");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoggedIn = productService.isLoggedIn();

  const totalHarga = product.harga * Number(qty);
  const hargaDP = Math.round(totalHarga * 0.5);

  async function handleCreatePesanan() {
    // Validasi login
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu");
      navigate("/login");
      return;
    }

    // Validasi qty
    if (!qty || Number(qty) < 1) {
      toast.error("Silakan isi jumlah (qty) terlebih dahulu");
      return;
    }

    try {
      setIsSubmitting(true);

      // Create order via service
      const result = await productService.createOrder({
        id_produk: product.id_produk,
        qty: parseInt(qty),
        catatan: catatan || undefined,
      });

      if (!result.success) {
        throw new Error(result.message);
      }

      const orderId = result.data.id_pesanan;

      // Prepare order data for payment page
      const orderData = {
        orderId,
        items: [
          {
            productId: product.id_produk,
            nama_produk: product.nama_produk,
            harga: product.harga,
            quantity: parseInt(qty),
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
        shippingMethod: "pickup",
        shippingCost: 0,
      };

      // Save to localStorage
      localStorage.setItem("mn_current_order", JSON.stringify(orderData));
      localStorage.setItem("mn_current_order_id", orderId);

      toast.success("Pesanan berhasil dibuat! Lanjutkan ke pembayaran");

      // Navigate to payment
      navigate("/checkout/payment");
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error(err.message || "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-white to-gray-50 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-t-3xl z-10">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">Checkout Pesanan</h2>
              <p className="text-indigo-100">Lengkapi detail pesanan Anda</p>
            </div>
            <button
              onClick={onClose}
              className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors backdrop-blur-sm"
            >
              <Icon icon="mdi:close" className="text-2xl" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          {/* Product Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <div className="flex gap-6">
              <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                {product.foto ? (
                  <img
                    src={product.foto}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = `
                        <div class="w-full h-full flex items-center justify-center">
                          <svg class="text-gray-300 w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z" />
                          </svg>
                        </div>
                      `;
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon icon="mdi:tshirt-crew-outline" className="text-gray-300 text-3xl" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{product.nama_produk}</h3>
                <p className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
                  {productService.formatPrice(product.harga)} / pcs
                </p>
                {product.estimasi_pengerjaan && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium">
                    <Icon icon="mdi:clock" />
                    {product.estimasi_pengerjaan} Hari
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quantity Selector */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:numeric" className="text-indigo-500" />
              Jumlah Pesanan
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-14 h-14 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-indigo-400 transition-all flex items-center justify-center group"
              >
                <Icon icon="mdi:minus" className="text-gray-600 text-xl group-hover:text-indigo-600" />
              </button>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-32 text-center border-2 border-indigo-200 rounded-xl px-4 py-4 text-2xl font-bold text-gray-900 bg-indigo-50 focus:outline-none focus:border-indigo-500"
                />
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-1 rounded">
                  pcs
                </div>
              </div>
              <button
                onClick={() => setQty(qty + 1)}
                className="w-14 h-14 border-2 border-gray-300 rounded-xl hover:bg-gray-100 hover:border-indigo-400 transition-all flex items-center justify-center group"
              >
                <Icon icon="mdi:plus" className="text-gray-600 text-xl group-hover:text-indigo-600" />
              </button>
            </div>
          </div>

          {/* Price Summary */}
          {qty > 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Harga Satuan</span>
                  <span className="font-semibold text-gray-900">
                    {productService.formatPrice(product.harga)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Jumlah</span>
                  <span className="font-semibold text-gray-900">{qty} pcs</span>
                </div>
                <div className="border-t border-indigo-200 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total Harga</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {productService.formatPrice(totalHarga)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Options */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:credit-card" className="text-indigo-500" />
              Pilih Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setPaymentType("DP")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  paymentType === "DP"
                    ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-105"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentType === "DP" ? "border-indigo-600 bg-indigo-600" : "border-gray-400"
                    }`}>
                      {paymentType === "DP" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Bayar DP 50%</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 mb-2">
                    {productService.formatPrice(hargaDP)}
                  </div>
                  <div className="text-sm text-gray-500">Pelunasan sebelum pengiriman</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("FULL")}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                  paymentType === "FULL"
                    ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50 shadow-lg scale-105"
                    : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      paymentType === "FULL" ? "border-indigo-600 bg-indigo-600" : "border-gray-400"
                    }`}>
                      {paymentType === "FULL" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                    </div>
                    <span className="font-bold text-gray-900 text-lg">Bayar Lunas</span>
                  </div>
                  <div className="text-2xl font-bold text-indigo-600 mb-2">
                    {productService.formatPrice(totalHarga)}
                  </div>
                  <div className="text-sm text-gray-500">Pembayaran penuh sekaligus</div>
                </div>
              </button>
            </div>
          </div>

          {/* Note Input */}
          <div>
            <label className="block text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Icon icon="mdi:note-text" className="text-indigo-500" />
              Catatan (Opsional)
            </label>
            <div className="relative">
              <textarea
                rows={4}
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                maxLength={500}
                className="w-full border-2 border-gray-300 rounded-2xl px-6 py-5 text-lg focus:outline-none focus:border-indigo-500 resize-none bg-gray-50"
                placeholder="Contoh: Warna biru tua, ukuran XL, tambah logo bordir, dll."
              />
              <div className="absolute bottom-4 right-4 text-gray-400 text-sm">
                {catatan.length}/500
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            disabled={!qty || isSubmitting}
            onClick={handleCreatePesanan}
            className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-2xl hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 group"
          >
            {isSubmitting ? (
              <>
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Memproses Pesanan...
              </>
            ) : (
              <>
                <span>Lanjut ke Pembayaran</span>
                <Icon icon="mdi:arrow-right" className="text-xl group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          {/* Security Info */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200 p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon icon="mdi:shield-check" className="text-white text-2xl" />
              </div>
              <div>
                <h4 className="font-bold text-emerald-900 mb-1">Pembayaran Aman & Terpercaya</h4>
                <p className="text-emerald-700 text-sm">
                  Transaksi dilindungi oleh sistem keamanan terenkripsi
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}