// src/pages/customer/OrderConfirmation.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import API from "../../services/api";

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [transaction, setTransaction] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("pending");

  useEffect(() => {
    const loadOrderData = async () => {
      try {
        const orderId = localStorage.getItem("mn_current_order_id");
        const pendingPayment = localStorage.getItem("mn_pending_payment");

        if (!orderId && location.state?.orderId) {
          localStorage.setItem("mn_current_order_id", location.state.orderId);
        }

        // Load order details
        if (orderId) {
          const response = await API.get(`/pesanan/${orderId}`);
          if (response.data.success) {
            setOrder(response.data.data);
          }
        }

        // Load transaction details
        if (pendingPayment) {
          const pending = JSON.parse(pendingPayment);
          setTransaction(pending);
        }

        // Set payment status
        if (location.state?.paymentStatus) {
          setPaymentStatus(location.state.paymentStatus);
        } else if (location.state?.transactionId) {
          setPaymentStatus("success");
        }
      } catch (error) {
        console.error("Error loading order confirmation:", error);
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();

    // Clean up local storage
    const cleanup = setTimeout(() => {
      localStorage.removeItem("mn_current_order");
      localStorage.removeItem("mn_checkout_items");
      localStorage.removeItem("mn_pending_payment");
    }, 5000);

    return () => clearTimeout(cleanup);
  }, [location]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleTrackOrder = () => {
    if (order?.id_pesanan) {
      navigate(`/pesanan-saya/${order.id_pesanan}`);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      if (order?.id_pesanan) {
        const response = await API.get(`/pesanan/${order.id_pesanan}/invoice`, {
          responseType: "blob",
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `invoice-${order.id_pesanan}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Gagal mengunduh invoice");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat konfirmasi pesanan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Success Confirmation */}
      {paymentStatus === "success" ? (
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="mdi:check-circle"
              className="text-emerald-600 text-5xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Pembayaran Berhasil! 🎉
          </h1>
          <p className="text-gray-600 mb-8">
            Pesanan Anda telah diterima dan sedang diproses
          </p>

          {/* Order ID */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 rounded-xl border border-indigo-100 mb-8">
            <Icon icon="mdi:receipt" className="text-indigo-600" />
            <div className="text-left">
              <p className="text-sm text-gray-500">Nomor Pesanan</p>
              <p className="text-lg font-bold text-gray-900">
                #{order?.id_pesanan || location.state?.orderId || "N/A"}
              </p>
            </div>
          </div>
        </div>
      ) : paymentStatus === "pending" ? (
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              icon="mdi:clock-outline"
              className="text-amber-600 text-5xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Menunggu Pembayaran ⏳
          </h1>
          <p className="text-gray-600 mb-8">
            Silakan selesaikan pembayaran Anda untuk memproses pesanan
          </p>
        </div>
      ) : (
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Konfirmasi Pesanan
          </h1>
          <p className="text-gray-600 mb-8">Detail pesanan Anda</p>
        </div>
      )}

      {/* Order Details */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden mb-8">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Detail Pesanan
              </h2>
              <p className="text-sm text-gray-500">
                {order?.created_at ? formatDate(order.created_at) : "Baru saja"}
              </p>
            </div>
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                paymentStatus === "success"
                  ? "bg-emerald-100 text-emerald-800"
                  : paymentStatus === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {paymentStatus === "success"
                ? "Berhasil"
                : paymentStatus === "pending"
                ? "Menunggu"
                : "Diproses"}
            </span>
          </div>
        </div>

        {/* Order Items */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            Produk yang Dipesan
          </h3>
          <div className="space-y-4">
            {order?.items?.map((item, index) => (
              <div key={index} className="flex gap-4">
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
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {item.nama_produk}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        {item.size && (
                          <span className="text-sm text-gray-500">
                            Size: {item.size}
                          </span>
                        )}
                        {item.color && (
                          <span className="text-sm text-gray-500">
                            Color: {item.color}
                          </span>
                        )}
                        <span className="text-sm text-gray-500">
                          Qty: {item.quantity}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.harga_satuan)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Total: {formatPrice(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Summary */}
        <div className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4">
            Rincian Pembayaran
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">
                {formatPrice(order?.total_harga || 0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ongkos Kirim</span>
              <span className="font-medium">
                {order?.shipping_cost === 0
                  ? "Gratis"
                  : formatPrice(order?.shipping_cost || 0)}
              </span>
            </div>

            {/* DP Info if applicable */}
            {order?.dp_wajib && order.dp_wajib > 0 && (
              <>
                <div className="flex justify-between border-t border-gray-200 pt-3">
                  <span className="text-gray-600">DP 30%</span>
                  <span className="font-medium text-amber-700">
                    {formatPrice(order.dp_wajib)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sisa Pelunasan</span>
                  <span className="font-medium">
                    {formatPrice(order.total_harga - order.dp_wajib)}
                  </span>
                </div>
              </>
            )}

            <div className="flex justify-between border-t border-gray-200 pt-3">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {formatPrice(order?.total_harga || 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Informasi Pengiriman
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-500">Nama Penerima</p>
            <p className="font-medium text-gray-900">
              {order?.customer_nama || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Telepon</p>
            <p className="font-medium text-gray-900">
              {order?.customer_no_hp || "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-sm text-gray-500">Alamat</p>
            <p className="font-medium text-gray-900">
              {order?.customer_alamat || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Metode Pengiriman</p>
            <p className="font-medium text-gray-900">
              {order?.shipping_method === "pickup"
                ? "Ambil di Tempat"
                : "Pengiriman Reguler"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Estimasi Pengerjaan</p>
            <p className="font-medium text-gray-900">
              {order?.items?.[0]?.estimasi_pengerjaan || "7-14 hari"}
            </p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Langkah Selanjutnya
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:email-fast" className="text-white text-2xl" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Konfirmasi Email</p>
            <p className="text-sm text-gray-600">
              Notifikasi akan dikirim ke email Anda
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon icon="mdi:factory" className="text-white text-2xl" />
            </div>
            <p className="font-medium text-gray-900 mb-1">Proses Produksi</p>
            <p className="text-sm text-gray-600">
              Pengerjaan dimulai setelah konfirmasi
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Icon
                icon="mdi:package-variant"
                className="text-white text-2xl"
              />
            </div>
            <p className="font-medium text-gray-900 mb-1">Pengiriman</p>
            <p className="text-sm text-gray-600">
              Akan dikirim sesuai estimasi pengerjaan
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={handleTrackOrder}
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Icon icon="mdi:eye" />
          Lacak Pesanan
        </button>

        <button
          onClick={handleDownloadInvoice}
          className="px-8 py-4 bg-white border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Icon icon="mdi:download" />
          Download Invoice
        </button>

        <Link
          to="/produk"
          className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-800 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-3"
        >
          <Icon icon="mdi:shopping" />
          Belanja Lagi
        </Link>
      </div>

      {/* WhatsApp Support */}
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">Butuh bantuan?</p>
        <a
          href="https://wa.me/6281234567890"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-lg transition-all duration-300"
        >
          <Icon icon="mdi:whatsapp" className="text-2xl" />
          Chat via WhatsApp Support
        </a>
      </div>
    </div>
  );
};

export default OrderConfirmation;
