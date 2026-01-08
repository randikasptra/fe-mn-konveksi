// src/pages/customer/Payment.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";

const Payment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("dp");

  // Load order data
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const savedOrder = localStorage.getItem("mn_current_order");
        const savedOrderId = localStorage.getItem("mn_current_order_id");

        if (!savedOrder) {
          toast.error("Data order tidak ditemukan");
          navigate("/produk");
          return;
        }

        const order = JSON.parse(savedOrder);
        setOrderData(order);
        setOrderId(savedOrderId || order.orderId);
        setPaymentMethod(order.paymentMethod || "dp");
      } catch (error) {
        console.error("Error loading order:", error);
        toast.error("Gagal memuat data order");
        navigate("/produk");
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [navigate]);

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Calculate DP amount (50% of total)
  const calculateDP = () => {
    if (!orderData) return 0;
    return Math.ceil(orderData.total * 0.5);
  };

  // Calculate remaining amount
  const calculateRemaining = () => {
    if (!orderData) return 0;
    return orderData.total - calculateDP();
  };

  // Handle payment type selection
  const handlePaymentTypeChange = (type) => {
    setPaymentMethod(type);
  };

  // Create Midtrans payment
  const createPayment = async () => {
    try {
      setProcessing(true);

      const token = localStorage.getItem("mn_token");
      if (!token) {
        toast.error("Sesi login berakhir. Silakan login kembali");
        window.dispatchEvent(new Event("openLoginModal"));
        return;
      }

      // ✅ PASTIKAN orderId ada
      if (!orderId) {
        throw new Error("Order ID tidak ditemukan");
      }

      // Determine payment type
      const jenisPembayaran = paymentMethod === "full" ? "FULL" : "DP";

      console.log("📤 Creating payment:", { orderId, jenisPembayaran });

      // Create Midtrans payment
      const paymentResponse = await fetch(
        "https://be-mn-konveksi.vercel.app/api/transaksi/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id_pesanan: parseInt(orderId),
            jenis_pembayaran: jenisPembayaran,
          }),
        }
      );

      const paymentJson = await paymentResponse.json();

      console.log("📥 Payment response:", paymentJson);

      if (!paymentResponse.ok || !paymentJson.success) {
        throw new Error(paymentJson.message || "Gagal membuat pembayaran");
      }

      const { snap_token } = paymentJson.data;

      if (!snap_token) {
        throw new Error("Snap token tidak ditemukan");
      }

      // Trigger Midtrans Snap popup
      triggerMidtransSnap(snap_token, orderId, jenisPembayaran);
    } catch (error) {
      console.error("❌ Payment error:", error);
      toast.error(error.message || "Gagal memproses pembayaran");
    } finally {
      setProcessing(false);
    }
  };

  // Trigger Midtrans Snap
  const triggerMidtransSnap = (token, orderId, jenisPembayaran) => {
    // Check if snap script already loaded
    if (window.snap) {
      openSnap(token, orderId, jenisPembayaran);
      return;
    }

    // Load Midtrans script
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      import.meta.env.VITE_MIDTRANS_CLIENT_KEY || "SB-Mid-client-xxx"
    );

    script.onload = () => {
      openSnap(token, orderId, jenisPembayaran);
    };

    script.onerror = () => {
      toast.error("Gagal memuat Midtrans. Silakan refresh halaman.");
      setProcessing(false);
    };

    document.body.appendChild(script);
  };

  // Open Snap payment popup
  const openSnap = (token, orderId, jenisPembayaran) => {
    window.snap.pay(token, {
      onSuccess: async (result) => {
        console.log("✅ Payment success:", result);
        toast.success("Pembayaran berhasil!");

        // Clear cart if from cart checkout
        if (orderData.items && orderData.items.length > 0) {
          const cartItems = JSON.parse(localStorage.getItem("mn_cart") || "[]");
          const selectedIds = orderData.items.map((item) => item.productId);
          const remainingItems = cartItems.filter(
            (item) => !selectedIds.includes(item.productId)
          );
          localStorage.setItem("mn_cart", JSON.stringify(remainingItems));
          window.dispatchEvent(new Event("cartUpdated"));
        }

        // Navigate to confirmation
        navigate("/checkout/confirmation", {
          state: {
            orderId,
            paymentType: jenisPembayaran,
            paymentStatus: "success",
            transactionId: result.transaction_id,
          },
        });
      },

      onPending: (result) => {
        console.log("⏳ Payment pending:", result);
        toast(
          "Pembayaran sedang diproses. Silakan selesaikan pembayaran Anda."
        );

        // Save pending payment info
        localStorage.setItem(
          "mn_pending_payment",
          JSON.stringify({
            orderId,
            transactionId: result.transaction_id,
            paymentMethod: result.payment_type,
          })
        );

        navigate("/checkout/confirmation", {
          state: {
            orderId,
            paymentStatus: "pending",
            transactionId: result.transaction_id,
          },
        });
      },

      onError: (error) => {
        console.error("❌ Payment error:", error);
        toast.error("Pembayaran gagal. Silakan coba lagi.");
      },

      onClose: () => {
        console.log("❌ Payment popup closed");
        toast(
          "Anda menutup halaman pembayaran. Silakan selesaikan pembayaran nanti.",
          {
            icon: "⚠️",
          }
        );
      },
    });
  };

  // Payment type options
  const paymentTypes = [
    {
      id: "dp",
      name: "DP 50%",
      amount: calculateDP(),
      description: "Bayar DP 50% sekarang, pelunasan sebelum pengiriman",
    },
    {
      id: "full",
      name: "Lunas",
      amount: orderData?.total || 0,
      description: "Bayar lunas sekaligus",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pembayaran Pesanan
          </h1>
          <p className="text-gray-600">Pilih metode pembayaran yang sesuai</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Payment Type Selection */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Pilih Tipe Pembayaran
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all ${
                      paymentMethod === type.id
                        ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value={type.id}
                      checked={paymentMethod === type.id}
                      onChange={() => handlePaymentTypeChange(type.id)}
                      className="sr-only"
                    />
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">
                          {type.name}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-700">
                        {formatPrice(type.amount)}
                      </p>
                    </div>

                    {type.id === "dp" && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-700">
                          Sisa Pelunasan:{" "}
                          <strong>{formatPrice(calculateRemaining())}</strong>{" "}
                          sebelum pengiriman
                        </p>
                      </div>
                    )}
                  </label>
                ))}
              </div>

              {/* Product Info */}
              {orderData && orderData.items && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    Produk Dipesan
                  </h3>
                  <div className="space-y-3">
                    {orderData.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex gap-4 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {item.nama_produk}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Qty: {item.quantity} pcs
                          </p>
                          <p className="text-sm font-medium text-indigo-600">
                            {formatPrice(item.harga)} x {item.quantity} ={" "}
                            {formatPrice(item.total)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary & Action */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Ringkasan Pembayaran
                </h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total Pesanan</span>
                    <span className="font-medium">
                      {formatPrice(orderData?.total || 0)}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipe Pembayaran</span>
                    <span className="font-medium">
                      {paymentMethod === "dp" ? "DP 50%" : "Lunas"}
                    </span>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">
                        Total Bayar
                      </span>
                      <div className="text-right">
                        <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          {formatPrice(
                            paymentMethod === "dp"
                              ? calculateDP()
                              : orderData?.total || 0
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={createPayment}
                  disabled={processing}
                  className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:lock" className="text-xl" />
                      Bayar Sekarang
                    </>
                  )}
                </button>

                {/* Security Info */}
                <div className="mt-4 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon
                      icon="mdi:shield-check"
                      className="text-emerald-600 text-xl"
                    />
                    <span className="font-semibold text-emerald-800 text-sm">
                      Pembayaran Aman
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Dilindungi oleh Midtrans Payment Gateway dengan enkripsi SSL
                    256-bit
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
