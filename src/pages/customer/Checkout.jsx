// src/pages/customer/Checkout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const Checkout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [checkoutItems, setCheckoutItems] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    nama: "",
    email: "",
    no_hp: "",
    alamat: "",
    kota: "",
    provinsi: "",
    kode_pos: "",
    catatan: "",
  });
  const [shippingMethod, setShippingMethod] = useState("pickup");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");

  // Load checkout items and customer info
  useEffect(() => {
    const items = JSON.parse(localStorage.getItem("mn_checkout_items") || "[]");
    const user = JSON.parse(localStorage.getItem("mn_user") || "{}");
    
    setCheckoutItems(items);
    
    // Prefill customer info from user data
    setCustomerInfo(prev => ({
      ...prev,
      nama: user.nama || "",
      email: user.email || "",
      no_hp: user.no_hp || "",
      alamat: user.alamat || "",
    }));
  }, []);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate totals
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.total, 0);
  const shippingCost = shippingMethod === "pickup" ? 0 : 15000;
  const total = subtotal + shippingCost;
  const dpAmount = Math.ceil(total * 0.3); // 30% DP

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Validate form
  const validateForm = () => {
    const requiredFields = ["nama", "email", "no_hp", "alamat", "kota", "provinsi"];
    for (const field of requiredFields) {
      if (!customerInfo[field]?.trim()) {
        toast.error(`Harap isi ${field.replace("_", " ")}`);
        return false;
      }
    }
    return true;
  };

  // Proceed to payment
  const proceedToPayment = async () => {
    if (!validateForm()) return;
    
    if (checkoutItems.length === 0) {
      toast.error("Tidak ada produk untuk checkout");
      navigate("/keranjang");
      return;
    }

    setLoading(true);

    try {
      // Save order data
      const orderData = {
        customerInfo,
        shippingMethod,
        paymentMethod,
        items: checkoutItems,
        subtotal,
        shippingCost,
        total,
        dpAmount,
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem("mn_current_order", JSON.stringify(orderData));
      
      // Navigate to payment
      navigate("/checkout/payment");
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Terjadi kesalahan saat proses checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Informasi Pengiriman
        </h1>
        <p className="text-gray-600">
          Lengkapi data diri dan alamat pengiriman
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-3 lg:gap-8">
        {/* Left Column - Form */}
        <div className="lg:col-span-2">
          {/* Customer Info Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Informasi Pelanggan
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  name="nama"
                  value={customerInfo.nama}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  No. Handphone *
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={customerInfo.no_hp}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provinsi *
                </label>
                <input
                  type="text"
                  name="provinsi"
                  value={customerInfo.provinsi}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kota/Kabupaten *
                </label>
                <input
                  type="text"
                  name="kota"
                  value={customerInfo.kota}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos *
                </label>
                <input
                  type="text"
                  name="kode_pos"
                  value={customerInfo.kode_pos}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  name="alamat"
                  value={customerInfo.alamat}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Pesanan (Opsional)
                </label>
                <textarea
                  name="catatan"
                  value={customerInfo.catatan}
                  onChange={handleChange}
                  rows="2"
                  placeholder="Contoh: warna khusus, ukuran khusus, dll."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Shipping Method */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Metode Pengiriman
            </h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-4 p-4 border border-gray-300 rounded-xl hover:border-indigo-500 cursor-pointer">
                <input
                  type="radio"
                  name="shipping"
                  value="pickup"
                  checked={shippingMethod === "pickup"}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-5 h-5 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Ambil di Tempat</p>
                      <p className="text-sm text-gray-600">Ambil langsung di workshop kami</p>
                    </div>
                    <span className="font-bold text-emerald-600">Gratis</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Alamat: Jl. Workshop No. 123, Jakarta Pusat
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-4 p-4 border border-gray-300 rounded-xl hover:border-indigo-500 cursor-pointer">
                <input
                  type="radio"
                  name="shipping"
                  value="delivery"
                  checked={shippingMethod === "delivery"}
                  onChange={(e) => setShippingMethod(e.target.value)}
                  className="w-5 h-5 text-indigo-600"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Pengiriman Reguler</p>
                      <p className="text-sm text-gray-600">JNE, J&T, SiCepat, atau GoSend</p>
                    </div>
                    <span className="font-bold text-gray-900">Rp 15.000</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Estimasi 2-5 hari kerja
                  </p>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* Order Summary */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Ringkasan Pesanan
              </h3>
              
              {/* Order Items */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {checkoutItems.map((item) => (
                  <div key={item.productId} className="flex gap-3 pb-4 border-b border-gray-100">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                      {item.foto ? (
                        <img
                          src={item.foto}
                          alt={item.nama_produk}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Icon icon="mdi:tshirt-crew" className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.nama_produk}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        {item.size && (
                          <span className="text-xs text-gray-500">Size: {item.size}</span>
                        )}
                        {item.color && (
                          <span className="text-xs text-gray-500">Color: {item.color}</span>
                        )}
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">x{item.quantity}</span>
                        <span className="font-medium">{formatPrice(item.harga)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ongkos Kirim</span>
                  <span className="font-medium">
                    {shippingMethod === "pickup" ? "Gratis" : formatPrice(shippingCost)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <div className="text-right">
                    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="mb-6">
                <h4 className="font-semibold text-gray-900 mb-3">Metode Pembayaran</h4>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="bank_transfer">Transfer Bank</option>
                  <option value="qris">QRIS</option>
                  <option value="cod">COD (Bayar di Tempat)</option>
                  <option value="e_wallet">E-Wallet (OVO, Dana, Gopay)</option>
                </select>
              </div>

              {/* DP Info */}
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <div className="flex items-center gap-3 mb-2">
                  <Icon icon="mdi:information" className="text-amber-600 text-xl" />
                  <span className="font-semibold text-amber-800">Pembayaran DP</span>
                </div>
                <p className="text-sm text-amber-700">
                  Down Payment (DP) 30%: {formatPrice(dpAmount)} 
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Pelunasan: {formatPrice(total - dpAmount)} sebelum pengiriman
                </p>
              </div>

              {/* Checkout Button */}
              <button
                onClick={proceedToPayment}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Memproses...
                  </>
                ) : (
                  <>
                    <Icon icon="mdi:lock" />
                    Lanjut ke Pembayaran
                  </>
                )}
              </button>

              {/* Payment Security Info */}
              <div className="mt-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-3 mb-3">
                  <Icon icon="mdi:shield-check" className="text-emerald-600 text-xl" />
                  <span className="font-medium text-emerald-800">Pembayaran Aman</span>
                </div>
                <p className="text-sm text-emerald-600">
                  Dilindungi dengan enkripsi SSL dan dukungan pembayaran lengkap
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;