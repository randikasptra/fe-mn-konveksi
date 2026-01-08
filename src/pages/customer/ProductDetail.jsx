import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function ProductDetail({ modalId }) {
  const params = useParams();
  const navigate = useNavigate();
  const id = modalId || params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [qty, setQty] = useState(1);
  const [catatan, setCatatan] = useState("");
  const [paymentType, setPaymentType] = useState("DP"); // DP | FULL

  const isLoggedIn = !!localStorage.getItem("mn_token");

  /* ================= FETCH DETAIL PRODUK ================= */
  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        const res = await fetch(
          `https://be-mn-konveksi.vercel.app/api/produk/${id}`
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);
        setProduct(json.data);
      } catch (err) {
        console.error(err);
        toast.error("Gagal memuat produk");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  /* ================= HITUNG HARGA ================= */
  const totalHarga = useMemo(() => {
    if (!product || !qty) return 0;
    return product.harga * Number(qty);
  }, [product, qty]);

  const hargaDP = useMemo(() => {
    return Math.round(totalHarga * 0.5); // 50% DP
  }, [totalHarga]);

  /* ================= CREATE PESANAN ================= */
  async function handleCreatePesanan() {
    if (!isLoggedIn) {
      toast.error("Silakan login terlebih dahulu");
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    if (!qty || Number(qty) < 1) {
      toast.error("Silakan isi jumlah (qty) terlebih dahulu");
      return;
    }

    try {
      const token = localStorage.getItem("mn_token");
      if (!token) return;

      setIsSubmitting(true);

      // ✅ CREATE PESANAN
      const res = await fetch("https://be-mn-konveksi.vercel.app/api/pesanan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_produk: product.id_produk,
          qty: parseInt(qty),
          catatan: catatan || undefined, // Kirim undefined kalau kosong
        }),
      });

      const json = await res.json();

      console.log("📥 Response:", json);

      if (res.status === 403) {
        toast.error(json.message || "Admin tidak dapat membuat pesanan");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat pesanan");
      }

      const orderId = json.data.id_pesanan;

      // ✅ SAVE ORDER DATA ke localStorage untuk Payment page
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
        paymentMethod: paymentType.toLowerCase(), // 'dp' atau 'full'
        customerInfo: {
          catatan,
        },
        shippingMethod: "pickup", // Default
        shippingCost: 0,
      };

      localStorage.setItem("mn_current_order", JSON.stringify(orderData));
      localStorage.setItem("mn_current_order_id", orderId);

      toast.success("Pesanan berhasil dibuat! Lanjutkan ke pembayaran");

      // ✅ REDIRECT ke Payment Page
      navigate("/checkout/payment");
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error(err.message || "Gagal membuat pesanan");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading)
    return (
      <div className="py-20 text-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Memuat produk...</p>
      </div>
    );

  if (!product)
    return (
      <div className="py-20 text-center">
        <p className="text-red-600">Produk tidak ditemukan</p>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT - Product Images */}
        <div className="flex gap-6">
          <div className="w-[45%] bg-gray-100 rounded-md overflow-hidden">
            {product.foto ? (
              <img
                src={product.foto}
                alt={product.nama_produk}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-gray-400">No Image</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="w-full h-40 bg-gray-200 rounded-md" />
            <div className="w-full h-40 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* RIGHT - Product Info & Form */}
        <div>
          <h1 className="text-3xl font-serif font-semibold text-gray-900">
            {product.nama_produk}
          </h1>

          <p className="text-2xl font-bold text-indigo-600 mt-3">
            Rp {product.harga.toLocaleString("id-ID")} / pcs
          </p>

          <p className="mt-2 text-sm text-gray-600">
            ⏱️ Estimasi {product.estimasi_pengerjaan} Hari
          </p>

          {product.deskripsi && (
            <p className="mt-4 text-gray-700 leading-relaxed">
              {product.deskripsi}
            </p>
          )}

          {/* QTY */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jumlah Pesanan
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                -
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
                className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-100 flex items-center justify-center"
              >
                +
              </button>
              <span className="text-gray-600">pcs</span>
            </div>
          </div>

          {/* TOTAL PRICE */}
          {qty > 0 && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Total Harga:</span>
                <strong className="text-lg text-gray-900">
                  Rp {totalHarga.toLocaleString("id-ID")}
                </strong>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">DP (50%):</span>
                <span className="text-gray-700">
                  Rp {hargaDP.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          )}

          {/* CATATAN */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catatan (opsional)
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Contoh: warna biru, ukuran XL, bordir logo perusahaan"
            />
          </div>

          {/* JENIS PEMBAYARAN */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Jenis Pembayaran
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setPaymentType("DP")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all
                  ${
                    paymentType === "DP"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <div>
                  <div className="font-bold">Bayar DP 50%</div>
                  <div className="text-xs mt-1 opacity-90">
                    {formatPrice(hargaDP)}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentType("FULL")}
                className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium border-2 transition-all
                  ${
                    paymentType === "FULL"
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                  }
                `}
              >
                <div>
                  <div className="font-bold">Bayar Lunas</div>
                  <div className="text-xs mt-1 opacity-90">
                    {formatPrice(totalHarga)}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="mt-8 flex gap-4">
            <button
              disabled={!qty || isSubmitting}
              onClick={handleCreatePesanan}
              className="flex-1 px-6 py-4 rounded-xl text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Memproses...
                </div>
              ) : (
                `Lanjut ke Pembayaran`
              )}
            </button>

            <a
              href="https://wa.me/6285860333077"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-semibold flex items-center justify-center hover:shadow-lg transition-all"
            >
              💬 Chat
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatPrice(price) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}
