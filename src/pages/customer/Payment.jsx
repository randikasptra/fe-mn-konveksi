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
  const [dpStatus, setDpStatus] = useState("BELUM");
  const [pelunasanStatus, setPelunasanStatus] = useState("BELUM");
  const [existingDP, setExistingDP] = useState(null);
  const [orderDetail, setOrderDetail] = useState(null);

  // Load order data
  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const savedOrder = localStorage.getItem("mn_current_order");
        const savedOrderId = localStorage.getItem("mn_current_order_id");

        if (!savedOrder || !savedOrderId) {
          toast.error("Data order tidak ditemukan");
          navigate("/produk");
          return;
        }

        const order = JSON.parse(savedOrder);
        setOrderData(order);
        setOrderId(savedOrderId);

        // ✅ AMBIL DATA PESANAN TERBARU DARI API UNTUK CEK STATUS
        const token = localStorage.getItem("mn_token");
        
        if (!token) {
          toast.error("Sesi login berakhir. Silakan login kembali");
          window.dispatchEvent(new Event("openLoginModal"));
          return;
        }

        try {
          const detailResponse = await fetch(
            `https://be-mn-konveksi.vercel.app/api/pesanan/${savedOrderId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            console.log("📋 Order detail from API:", detailData);
            
            if (detailData.success && detailData.data) {
              const currentOrder = detailData.data;
              setOrderDetail(currentOrder);
              
              // ✅ SIMPAN STATUS DP DAN PELUNASAN
              setDpStatus(currentOrder.dp_status || "BELUM");
              setPelunasanStatus(currentOrder.pelunasan_status || "BELUM");
              
              // ✅ CEK TRANSAKSI YANG SUDAH ADA
              const dpTransaction = currentOrder.transaksi?.find(
                t => t.jenis_pembayaran === "DP" && t.midtrans_status === "settlement"
              );
              setExistingDP(dpTransaction);

              // ✅ LOGIKA PILIH TIPE PEMBAYARAN OTOMATIS
              if (currentOrder.dp_status === "VALID") {
                // Jika DP sudah dibayar, pilih PELUNASAN
                if (currentOrder.pelunasan_status !== "VALID") {
                  setPaymentMethod("pelunasan");
                } else {
                  // Jika sudah lunas, tidak perlu bayar lagi
                  toast.success("Pesanan ini sudah lunas!");
                  navigate("/pesanan-saya");
                }
              } else {
                // Jika belum bayar DP, pilih DP
                setPaymentMethod("dp");
              }
            }
          }
        } catch (fetchError) {
          console.error("Error fetching order details:", fetchError);
          // Jika gagal fetch detail, gunakan data dari localStorage
          setPaymentMethod("dp");
        }

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

  // Calculate paid amount from existing DP
  const calculatePaidDP = () => {
    if (existingDP && existingDP.jumlah) {
      return Number(existingDP.jumlah);
    }
    return 0;
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

      if (!orderId) {
        throw new Error("Order ID tidak ditemukan");
      }

      // ✅ TENTUKAN JENIS PEMBAYARAN YANG BENAR
      let jenisPembayaran;
      switch(paymentMethod) {
        case "dp":
          jenisPembayaran = "DP";
          break;
        case "full":
          jenisPembayaran = "FULL";
          break;
        case "pelunasan":
          jenisPembayaran = "PELUNASAN";
          break;
        default:
          jenisPembayaran = "DP";
      }

      console.log("📤 Creating payment:", { 
        orderId, 
        jenisPembayaran,
        dpStatus,
        pelunasanStatus 
      });

      // VALIDASI TAMBAHAN DI FRONTEND
      if (jenisPembayaran === "FULL" && dpStatus === "VALID") {
        toast.error("DP sudah dibayar, gunakan Pelunasan");
        setProcessing(false);
        return;
      }

      if (jenisPembayaran === "PELUNASAN" && dpStatus !== "VALID") {
        toast.error("DP belum dibayar, bayar DP terlebih dahulu");
        setProcessing(false);
        return;
      }

      if (jenisPembayaran === "PELUNASAN" && pelunasanStatus === "VALID") {
        toast.error("Pesanan ini sudah lunas");
        setProcessing(false);
        navigate("/pesanan-saya");
        return;
      }

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
        // TAMPILKAN ERROR YANG LEBIH SPESIFIK
        const errorMsg = paymentJson.message || "Gagal membuat pembayaran";
        
        if (errorMsg.includes("DP sudah dibayar")) {
          toast.error("DP sudah dibayar. Silakan pilih Pelunasan");
          setPaymentMethod("pelunasan");
        } else if (errorMsg.includes("belum dalam status")) {
          toast.error("Status pesanan tidak valid. Hubungi admin");
        } else {
          toast.error(errorMsg);
        }
        
        throw new Error(errorMsg);
      }

      const { snap_token } = paymentJson.data;

      if (!snap_token) {
        throw new Error("Snap token tidak ditemukan");
      }

      // Trigger Midtrans Snap popup
      triggerMidtransSnap(snap_token, orderId, jenisPembayaran);
    } catch (error) {
      console.error("❌ Payment error:", error);
      // Tidak perlu toast lagi karena sudah ditampilkan di atas
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

  // Payment type options - DIPERBAIKI DENGAN LOGIKA STATUS
  const paymentTypes = [
    {
      id: "dp",
      name: "DP 50%",
      amount: calculateDP(),
      description: "Bayar DP 50% sekarang, pelunasan sebelum pengiriman",
      disabled: dpStatus === "VALID", // Nonaktif jika DP sudah dibayar
      badge: dpStatus === "VALID" ? "Sudah Dibayar" : null,
    },
    {
      id: "full",
      name: "Lunas",
      amount: orderData?.total || 0,
      description: "Bayar lunas sekaligus",
      disabled: dpStatus === "VALID", // Nonaktif jika DP sudah dibayar
      badge: dpStatus === "VALID" ? "Tidak Tersedia" : null,
    },
    {
      id: "pelunasan",
      name: "Pelunasan",
      amount: calculateRemaining(),
      description: "Bayar sisa pelunasan setelah DP",
      disabled: dpStatus !== "VALID" || pelunasanStatus === "VALID", // Hanya aktif jika DP sudah dibayar & belum lunas
      badge: dpStatus !== "VALID" ? "Bayar DP Dulu" : 
             pelunasanStatus === "VALID" ? "Sudah Lunas" : null,
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

  // Jika sudah lunas, tampilkan pesan
  if (pelunasanStatus === "VALID") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg border border-green-200">
          <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon icon="mdi:check-circle" className="text-green-600 text-4xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Pesanan Sudah Lunas!
          </h1>
          <p className="text-gray-600 mb-6">
            Pesanan #{orderId} sudah lunas dan sedang diproses. Terima kasih telah berbelanja.
          </p>
          <button
            onClick={() => navigate("/pesanan-saya")}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Lihat Pesanan Saya
          </button>
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
          
          {/* Status Info */}
          <div className="mt-4 inline-flex items-center gap-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${dpStatus === "VALID" ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
              <span className="text-sm font-medium">
                DP: {dpStatus === "VALID" ? "Sudah Dibayar" : "Belum Dibayar"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${pelunasanStatus === "VALID" ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className="text-sm font-medium">
                Pelunasan: {pelunasanStatus === "VALID" ? "Lunas" : "Belum"}
              </span>
            </div>
          </div>
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
                    className={`p-5 border-2 rounded-xl cursor-pointer transition-all relative ${
                      paymentMethod === type.id
                        ? "border-indigo-600 bg-gradient-to-r from-indigo-50 to-purple-50"
                        : type.disabled
                        ? "border-gray-200 bg-gray-100 cursor-not-allowed"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentType"
                      value={type.id}
                      checked={paymentMethod === type.id}
                      onChange={() => !type.disabled && handlePaymentTypeChange(type.id)}
                      className="sr-only"
                      disabled={type.disabled}
                    />
                    
                    {type.badge && (
                      <div className="absolute -top-2 right-4 px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                        {type.badge}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className={`font-bold text-lg ${type.disabled ? 'text-gray-500' : 'text-gray-900'}`}>
                          {type.name}
                          {type.disabled && (
                            <Icon icon="mdi:lock" className="inline ml-2 text-gray-400" />
                          )}
                        </p>
                        <p className={`text-sm mt-1 ${type.disabled ? 'text-gray-400' : 'text-gray-600'}`}>
                          {type.description}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${type.disabled ? 'text-gray-400' : 'text-indigo-700'}`}>
                        {formatPrice(type.amount)}
                      </p>
                    </div>

                    {type.id === "dp" && dpStatus === "VALID" && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                        <p className="text-sm text-green-700">
                          <strong>DP sudah dibayar:</strong> {formatPrice(calculatePaidDP())}
                        </p>
                      </div>
                    )}

                    {type.id === "pelunasan" && dpStatus === "VALID" && (
                      <div className="mt-3 p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-100">
                        <p className="text-sm text-amber-700">
                          Sisa Pelunasan: <strong>{formatPrice(calculateRemaining())}</strong>
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

                  {dpStatus === "VALID" && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">DP Sudah Dibayar</span>
                        <span className="font-medium text-green-600">
                          - {formatPrice(calculatePaidDP())}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sisa Pelunasan</span>
                        <span className="font-medium text-amber-600">
                          {formatPrice(calculateRemaining())}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tipe Pembayaran</span>
                    <span className="font-medium">
                      {paymentMethod === "dp" ? "DP 50%" : 
                       paymentMethod === "full" ? "Lunas" : "Pelunasan"}
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
                              : paymentMethod === "pelunasan"
                              ? calculateRemaining()
                              : orderData?.total || 0
                          )}
                        </div>
                        {paymentMethod === "pelunasan" && (
                          <p className="text-xs text-gray-500 mt-1">
                            (Setelah DP {formatPrice(calculatePaidDP())})
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment Button */}
                <button
                  onClick={createPayment}
                  disabled={processing || paymentTypes.find(t => t.id === paymentMethod)?.disabled}
                  className={`w-full py-4 text-white font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                    paymentTypes.find(t => t.id === paymentMethod)?.disabled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:shadow-xl"
                  }`}
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Memproses...
                    </>
                  ) : paymentTypes.find(t => t.id === paymentMethod)?.disabled ? (
                    <>
                      <Icon icon="mdi:lock" className="text-xl" />
                      Tidak Tersedia
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:lock" className="text-xl" />
                      Bayar Sekarang
                    </>
                  )}
                </button>

                {/* Info Status */}
                {dpStatus === "VALID" && paymentMethod === "pelunasan" && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon
                        icon="mdi:information"
                        className="text-amber-600 text-xl"
                      />
                      <span className="font-semibold text-amber-800 text-sm">
                        Pembayaran Pelunasan
                      </span>
                    </div>
                    <p className="text-xs text-amber-700">
                      Anda sudah membayar DP. Sekarang bayar sisa pelunasan untuk menyelesaikan pesanan.
                    </p>
                  </div>
                )}

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
                    Dilindungi oleh Midtrans Payment Gateway dengan enkripsi SSL 256-bit
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