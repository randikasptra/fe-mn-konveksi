import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import API from "../../services/api";

/* ================= UTIL ================= */
const formatIDR = (v) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(v || 0);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

/* ================= ANALISIS STATUS ================= */
function getJenisPembayaran(order) {
  // Analisis berdasarkan transaksi yang sudah ada
  const transaksi = order.transaksi || [];
  
  // Cari transaksi yang sudah settlement
  const settledTransactions = transaksi.filter(t => t.midtrans_status === "settlement");
  
  if (settledTransactions.length === 0) {
    // Belum ada pembayaran sama sekali -> butuh DP
    return "DP";
  }
  
  // Hitung total yang sudah dibayar
  const totalPaid = settledTransactions.reduce((sum, t) => sum + t.nominal, 0);
  
  if (totalPaid < order.total_harga) {
    // Sudah bayar DP tapi belum lunas -> butuh pelunasan
    return "PELUNASAN";
  }
  
  // Sudah lunas
  return null;
}

function getPendingTransaksi(order) {
  return order.transaksi?.find(
    (t) => t.midtrans_status === "pending"
  );
}

function getSettledTransaksi(order) {
  return order.transaksi?.filter(
    (t) => t.midtrans_status === "settlement"
  ) || [];
}

/* ================= STATUS BADGE - SESUAI BACKEND ================= */
function StatusBadge({ status, transaksi, order }) {
  const settledTrans = (transaksi || []).filter(t => t.midtrans_status === "settlement");
  const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
  
  // Tentukan status display berdasarkan backend status dan pembayaran
  let displayLabel = "";
  let color = "";
  let icon = "";
  
  switch(status) {
    case "MENUNGGU_PEMBAYARAN":
      if (settledTrans.length === 0) {
        displayLabel = "Menunggu Pembayaran DP";
        color = "bg-yellow-100 text-yellow-700";
        icon = "mdi:cash-clock";
      } else {
        displayLabel = "Menunggu Pelunasan";
        color = "bg-orange-100 text-orange-700";
        icon = "mdi:cash-multiple";
      }
      break;
      
    case "DIPROSES":
      displayLabel = "Sedang Diproses";
      color = "bg-blue-100 text-blue-700";
      icon = "mdi:factory";
      
      // Jika sedang diproses tapi belum lunas
      if (totalPaid > 0 && totalPaid < (order?.total_harga || 0)) {
        displayLabel = "Diproses (Menunggu Pelunasan)";
        color = "bg-blue-100 text-blue-700";
        icon = "mdi:factory";
      }
      break;
      
    case "SELESAI":
      displayLabel = "Selesai";
      color = "bg-green-100 text-green-700";
      icon = "mdi:check-circle";
      break;
      
    case "DIBATALKAN":
      displayLabel = "Dibatalkan";
      color = "bg-red-100 text-red-700";
      icon = "mdi:cancel";
      break;
      
    default:
      displayLabel = status.replaceAll("_", " ");
      color = "bg-gray-100 text-gray-700";
      icon = "mdi:information";
  }
  
  return (
    <div className="flex items-center gap-2">
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${color} font-medium`}>
        <Icon icon={icon} className="text-lg" />
        <span>{displayLabel}</span>
      </div>
      {settledTrans.length > 0 && (
        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
          {settledTrans.length === 1 ? "DP Terbayar" : "Lunas"}
        </span>
      )}
    </div>
  );
}

/* ================= PROGRESS TRACKER YANG BENAR ================= */
function ProgressTracker({ status, transaksi, order }) {
  const settledTrans = (transaksi || []).filter(t => t.midtrans_status === "settlement");
  const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
  const orderTotal = order?.total_harga || 0;
  
  // Steps berdasarkan status dan pembayaran
  const getSteps = () => {
    if (status === "SELESAI") {
      return [
        { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
        { id: "DP_PAID", label: "DP Dibayar", icon: "mdi:cash-check" },
        { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
        { id: "FULL_PAYMENT", label: "Pelunasan", icon: "mdi:cash-multiple" },
        { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
      ];
    }
    
    if (status === "DIPROSES") {
      if (totalPaid >= orderTotal) {
        return [
          { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
          { id: "DP_PAID", label: "DP Dibayar", icon: "mdi:cash-check" },
          { id: "FULL_PAYMENT", label: "Lunas", icon: "mdi:cash-multiple" },
          { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
          { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
        ];
      } else {
        return [
          { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
          { id: "DP_PAID", label: "DP Dibayar", icon: "mdi:cash-check" },
          { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
          { id: "FULL_PAYMENT", label: "Pelunasan", icon: "mdi:cash-multiple" },
          { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
        ];
      }
    }
    
    // Default untuk MENUNGGU_PEMBAYARAN
    if (settledTrans.length === 0) {
      return [
        { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
        { id: "DP_PAID", label: "Bayar DP", icon: "mdi:cash" },
        { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
        { id: "FULL_PAYMENT", label: "Pelunasan", icon: "mdi:cash-multiple" },
        { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
      ];
    } else {
      return [
        { id: "ORDER_CREATED", label: "Pesanan Dibuat", icon: "mdi:file-document-outline" },
        { id: "DP_PAID", label: "DP Terbayar", icon: "mdi:cash-check" },
        { id: "FULL_PAYMENT", label: "Bayar Pelunasan", icon: "mdi:cash-multiple" },
        { id: "IN_PROGRESS", label: "Diproses", icon: "mdi:factory" },
        { id: "COMPLETED", label: "Selesai", icon: "mdi:check-circle" }
      ];
    }
  };
  
  const steps = getSteps();
  
  // Tentukan current step berdasarkan status dan pembayaran
  let currentStep = 0;
  
  if (status === "SELESAI") {
    currentStep = 4;
  } else if (status === "DIPROSES") {
    currentStep = totalPaid >= orderTotal ? 3 : 2;
  } else if (status === "MENUNGGU_PEMBAYARAN") {
    currentStep = settledTrans.length === 0 ? 1 : 2;
  }
  
  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-700">Status Pengerjaan</h3>
        <span className="text-sm font-medium text-gray-900">
          {steps[currentStep]?.label || "Pesanan Dibuat"}
        </span>
      </div>
      
      <div className="relative">
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full"></div>
        <div 
          className="absolute top-5 left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        ></div>
        
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = index <= currentStep;
            const isCurrent = index === currentStep;
            
            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg' 
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                  }
                  ${isCurrent ? 'scale-110 ring-4 ring-indigo-100' : ''}
                `}>
                  <Icon icon={step.icon} className="text-xl" />
                </div>
                <span className={`text-xs font-medium text-center ${isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ================= ORDER CARD YANG DIPERBAIKI ================= */
function OrderCard({ order, onPay, processingId }) {
  const pending = getPendingTransaksi(order);
  const settledTrans = getSettledTransaksi(order);
  const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
  const remainingPayment = order.total_harga - totalPaid;
  const jenisPembayaran = getJenisPembayaran(order);
  const canPay = jenisPembayaran && remainingPayment > 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:package-variant" className="text-indigo-600 text-2xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">{order.produk?.nama_produk || "Produk"}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                  <span>ID: <span className="font-mono font-medium">{order.id_pesanan}</span></span>
                  <span>•</span>
                  <span>{formatDate(order.tanggal_pesan)}</span>
                </div>
              </div>
            </div>
          </div>
          <StatusBadge status={order.status_pesanan} transaksi={order.transaksi} order={order} />
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Detail Pesanan</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Kuantitas</span>
                <span className="font-semibold">{order.qty} pcs</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bahan</span>
                <span className="font-semibold">{order.produk?.bahan || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Catatan</span>
                <span className="font-semibold text-right max-w-[200px] truncate">{order.catatan || "-"}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-3">Informasi Pembayaran</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Harga</span>
                <span className="text-xl font-bold text-indigo-600">{formatIDR(order.total_harga)}</span>
              </div>
              
              {/* Tampilkan DP jika sudah ada pembayaran */}
              {settledTrans.length > 0 && (
                <div className="pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Dibayar</span>
                    <span className="font-semibold text-green-600">{formatIDR(totalPaid)}</span>
                  </div>
                  
                  {remainingPayment > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sisa Pembayaran</span>
                      <span className="font-semibold text-orange-600">{formatIDR(remainingPayment)}</span>
                    </div>
                  )}
                  
                  {jenisPembayaran && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">
                        {jenisPembayaran === "DP" 
                          ? "Bayar DP 50% untuk memulai produksi" 
                          : "Lunasi pembayaran untuk menyelesaikan pesanan"}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <ProgressTracker status={order.status_pesanan} transaksi={order.transaksi} order={order} />
      </div>

      <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {pending && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
              <Icon icon="mdi:alert-circle" className="text-purple-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-purple-700">Pembayaran Tertunda</p>
                <p className="text-xs text-purple-600">
                  Selesaikan pembayaran segera untuk melanjutkan proses
                </p>
              </div>
            </div>
          )}

          {canPay && (
            <button
              disabled={processingId === order.id_pesanan}
              onClick={() => onPay(order, jenisPembayaran)}
              className={`
                inline-flex items-center justify-center gap-3
                px-6 py-3 font-semibold rounded-xl
                transition-all duration-300 shadow-md hover:shadow-lg
                ${pending 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700' 
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {processingId === order.id_pesanan ? (
                <>
                  <Icon icon="mdi:loading" className="animate-spin text-xl" />
                  Memproses...
                </>
              ) : (
                <>
                  <Icon icon={pending ? "mdi:cash-fast" : "mdi:cash"} className="text-xl" />
                  {pending
                    ? "Lanjutkan Pembayaran"
                    : jenisPembayaran === "DP"
                    ? "Bayar DP 50%"
                    : "Bayar Pelunasan"}
                </>
              )}
            </button>
          )}

          {order.status_pesanan === "SELESAI" && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100">
              <Icon icon="mdi:check-circle" className="text-emerald-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-emerald-700">Pesanan Selesai</p>
                <p className="text-xs text-emerald-600">Terima kasih telah memesan di MN Konveksi</p>
              </div>
            </div>
          )}
          
          {order.status_pesanan === "DIPROSES" && totalPaid >= order.total_harga && (
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <Icon icon="mdi:factory" className="text-blue-600 text-xl" />
              <div>
                <p className="text-sm font-medium text-blue-700">Sedang Diproses</p>
                <p className="text-xs text-blue-600">
                  Pesanan Anda sedang dalam proses produksi
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function PesananSaya() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);

  async function loadOrders() {
    try {
      setError(null);
      setDebugInfo(null);
      const token = localStorage.getItem("mn_token");
      
      console.log("Token dari localStorage:", token ? "Ada" : "Tidak ada");
      
      if (!token) {
        setOrders([]);
        setLoading(false);
        setError("Anda belum login. Silakan login terlebih dahulu.");
        return;
      }

      console.log("Memanggil API.getOrders()...");
      const response = await API.getOrders();
      
      // Debug: Log response lengkap
      console.log("FULL Response:", response);
      console.log("Response.data:", response.data);
      console.log("Type of response.data:", typeof response.data);
      console.log("Is array?", Array.isArray(response.data));
      
      // Simpan debug info
      set
      ({
        timestamp: new Date().toISOString(),
        responseData: response.data,
        rawResponse: JSON.stringify(response.data, null, 2),
        type: typeof response.data,
        isArray: Array.isArray(response.data)
      });
      
      // PERBAIKAN: Handle berbagai kemungkinan struktur response
      let ordersData = [];
      
      // Kasus 1: {success: true, data: [...]}
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        console.log("Struktur: {success: true, data: [...]}");
        ordersData = response.data.data;
      }
      // Kasus 2: response.data langsung array
      else if (Array.isArray(response.data)) {
        console.log("Struktur: langsung array");
        ordersData = response.data;
      }
      // Kasus 3: {data: [...]}
      else if (response.data && Array.isArray(response.data.data)) {
        console.log("Struktur: {data: [...]}");
        ordersData = response.data.data;
      }
      // Kasus 4: Ada properti lain yang berisi array
      else if (response.data && typeof response.data === 'object') {
        // Cari properti pertama yang berisi array
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            console.log(`Struktur: {'${key}': [...]}`);
            ordersData = response.data[key];
            break;
          }
        }
      }
      
      console.log("Orders data yang didapat:", ordersData);
      console.log("Jumlah pesanan:", ordersData.length);
      
      // Periksa struktur data pesanan
      if (ordersData.length > 0) {
        console.log("Contoh pesanan pertama:", {
          id: ordersData[0].id_pesanan,
          status: ordersData[0].status_pesanan,
          total_harga: ordersData[0].total_harga,
          produk_nama: ordersData[0].produk?.nama_produk,
          transaksi: ordersData[0].transaksi,
          tanggal_pesan: ordersData[0].tanggal_pesan,
          catatan: ordersData[0].catatan,
          qty: ordersData[0].qty
        });
      }
      
      // Normalize status
      const normalizedOrders = ordersData.map(order => {
        console.log("Processing order:", {
          id: order.id_pesanan,
          original_status: order.status_pesanan,
          has_produk: !!order.produk,
          has_transaksi: !!(order.transaksi && order.transaksi.length > 0)
        });
        
        let status = order.status_pesanan || "";
        
        // Mapping dari frontend ke backend jika perlu
        if (status === "DIBUAT") status = "MENUNGGU_PEMBAYARAN";
        if (status === "MENUNGGU_DP") status = "MENUNGGU_PEMBAYARAN";
        if (status === "MENUNGGU_PELUNASAN") status = "MENUNGGU_PEMBAYARAN";
        
        console.log(`Order ${order.id_pesanan}: ${order.status_pesanan} -> ${status}`);
        
        return {
          ...order,
          status_pesanan: status
        };
      });
      
      setOrders(normalizedOrders);
      console.log("Orders setelah normalization:", normalizedOrders);
      
    } catch (error) {
      console.error("Error loading orders:", error);
      console.error("Error response:", error.response);
      console.error("Error message:", error.message);
      
      setOrders([]);
      
      setDebugInfo({
        timestamp: new Date().toISOString(),
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      if (error.response?.status === 401) {
        setError("Sesi Anda telah berakhir. Silakan login kembali.");
      } else {
        setError(error.response?.data?.message || "Gagal memuat pesanan");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders dengan logika yang benar
  const filteredOrders = orders.filter(order => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") {
      // Menunggu pembayaran atau menunggu pelunasan
      const settledTrans = getSettledTransaksi(order);
      const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
      
      return order.status_pesanan === "MENUNGGU_PEMBAYARAN" || 
             (order.status_pesanan === "DIPROSES" && totalPaid < order.total_harga);
    }
    if (activeTab === "processing") {
      return order.status_pesanan === "DIPROSES";
    }
    if (activeTab === "completed") return order.status_pesanan === "SELESAI";
    return true;
  });

  function openSnap(snapToken) {
    if (typeof window.snap !== 'undefined') {
      window.snap.pay(snapToken, {
        onSuccess: function(result) {
          console.log("Payment success:", result);
          loadOrders();
        },
        onPending: function(result) {
          console.log("Payment pending:", result);
          loadOrders();
        },
        onError: function(result) {
          console.error("Payment error:", result);
          alert("Pembayaran gagal, silakan coba lagi");
        },
        onClose: function() {
          console.log("Payment popup closed");
          loadOrders();
        }
      });
    } else {
      console.error("Snap.js not loaded");
      alert("Sistem pembayaran sedang tidak tersedia. Silakan refresh halaman.");
    }
  }

  async function handlePay(order, jenis) {
    const pending = getPendingTransaksi(order);

    if (pending?.snap_token) {
      openSnap(pending.snap_token);
      return;
    }

    if (!jenis) {
      // Auto-detect jenis pembayaran jika tidak diberikan
      jenis = getJenisPembayaran(order);
    }
    
    if (!jenis) {
      alert("Pesanan ini tidak memerlukan pembayaran");
      return;
    }

    try {
      setProcessingId(order.id_pesanan);

      const response = await API.createPayment({
        id_pesanan: order.id_pesanan,
        jenis_pembayaran: jenis,
        // Tambahkan nominal jika perlu berdasarkan jenis
        nominal: jenis === "DP" 
          ? Math.ceil(order.total_harga * 0.5)  // 50% untuk DP
          : order.total_harga - getSettledTransaksi(order).reduce((sum, t) => sum + t.nominal, 0)  // Sisa untuk pelunasan
      });

      if (response.data?.success && response.data.data?.snap_token) {
        openSnap(response.data.data.snap_token);
      } else {
        alert("Gagal mendapatkan token pembayaran");
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert(error.response?.data?.message || "Gagal membuat pembayaran");
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-700">Memuat pesanan...</h3>
          </div>
        </div>
      </div>
    );
  }

  // Tampilkan debug info di development
  const showDebug = debugInfo && process.env.NODE_ENV === 'development';

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center bg-white rounded-2xl shadow-lg p-12">
            <Icon icon="mdi:alert-circle" className="text-red-500 text-6xl mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Terjadi Kesalahan</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            
            {showDebug && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left">
                <h4 className="font-semibold text-gray-700 mb-2">Debug Info:</h4>
                <pre className="text-xs text-gray-600 bg-gray-100 p-3 rounded overflow-auto max-h-60">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
            )}
            
            <div className="mt-6">
              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors mr-3"
              >
                Coba Lagi
              </button>
              <button
                onClick={() => window.location.href = "/login"}
                className="px-6 py-3 bg-white text-indigo-600 border border-indigo-600 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hitung statistik dengan logika yang benar
  const stats = {
    total: orders.length,
    waiting: orders.filter(order => {
      const settledTrans = getSettledTransaksi(order);
      const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
      return order.status_pesanan === "MENUNGGU_PEMBAYARAN" || 
             (order.status_pesanan === "DIPROSES" && totalPaid < order.total_harga);
    }).length,
    processing: orders.filter(order => {
      const settledTrans = getSettledTransaksi(order);
      const totalPaid = settledTrans.reduce((sum, t) => sum + t.nominal, 0);
      return order.status_pesanan === "DIPROSES" && totalPaid >= order.total_harga;
    }).length,
    completed: orders.filter(order => order.status_pesanan === "SELESAI").length
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:package-variant-closed" className="text-indigo-600 text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Pesanan Saya</h1>
              <p className="text-gray-600">Lacak status pesanan dan lakukan pembayaran</p>
            </div>
          </div>

          {/* Debug Info Section */}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Pesanan</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <Icon icon="mdi:package-variant" className="text-3xl text-indigo-500" />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Menunggu Pembayaran</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.waiting}</p>
                </div>
                <Icon icon="mdi:cash-clock" className="text-3xl text-yellow-500" />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sedang Diproses</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                </div>
                <Icon icon="mdi:factory" className="text-3xl text-blue-500" />
              </div>
            </div>
            
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Selesai</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <Icon icon="mdi:check-circle" className="text-3xl text-green-500" />
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex overflow-x-auto border-b border-gray-200 mb-8">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "all"
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "pending"
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Menunggu ({stats.waiting})
            </button>
            <button
              onClick={() => setActiveTab("processing")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "processing"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Diproses ({stats.processing})
            </button>
            <button
              onClick={() => setActiveTab("completed")}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                activeTab === "completed"
                  ? "border-green-600 text-green-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Selesai ({stats.completed})
            </button>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:package-variant-remove" className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {activeTab === "all" ? "Belum ada pesanan" : "Tidak ada pesanan"}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {activeTab === "all" 
                ? "Mulai pesan produk favorit Anda di halaman produk" 
                : `Tidak ada pesanan dengan status ${activeTab === "pending" ? "menunggu pembayaran" : activeTab === "processing" ? "diproses" : "selesai"}`}
            </p>
            {activeTab !== "all" && (
              <button
                onClick={() => setActiveTab("all")}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors"
              >
                Lihat Semua Pesanan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id_pesanan}
                order={order}
                onPay={handlePay}
                processingId={processingId}
              />
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Butuh Bantuan?</h3>
              <p className="text-gray-600">
                Hubungi kami jika mengalami kendala dalam proses pesanan atau pembayaran.
              </p>
              <div className="mt-3 text-sm text-gray-500">
                <p className="mb-1">📞 Alur Pembayaran:</p>
                <ol className="list-decimal pl-5 space-y-1">
                  <li>Bayar DP 50% untuk memulai produksi</li>
                  <li>Pelunasan dapat dilakukan kapan saja sebelum pesanan selesai</li>
                  <li>Produksi dimulai setelah DP diterima</li>
                </ol>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const phoneNumber = "6281234567890";
                  const message = "Halo MN Konveksi, saya butuh bantuan dengan pesanan saya.";
                  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(url, "_blank");
                }}
                className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-colors flex items-center gap-2"
              >
                <Icon icon="mdi:whatsapp" />
                WhatsApp
              </button>
              <button
                onClick={loadOrders}
                className="px-6 py-3 bg-white text-indigo-600 font-medium rounded-xl hover:bg-gray-50 transition-colors border border-gray-300 flex items-center gap-2"
              >
                <Icon icon="mdi:refresh" />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}