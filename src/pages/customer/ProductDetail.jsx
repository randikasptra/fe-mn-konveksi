import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

export default function ProductDetail({ modalId }) {
  const params = useParams();
  const id = modalId || params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ BARU
  const [qty, setQty] = useState("");
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
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    if (!qty || Number(qty) < 1) {
      alert("Silakan isi jumlah (qty) terlebih dahulu");
      return;
    }

    try {
      const token = localStorage.getItem("mn_token");
      if (!token) return;

      setIsSubmitting(true);

      const res = await fetch(
        "https://be-mn-konveksi.vercel.app/api/pesanan",
        {
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
        }
      );

      const json = await res.json();

      if (res.status === 403) {
        alert(json.message || "Admin tidak dapat membuat pesanan");
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.message || "Gagal membuat pesanan");
      }

      alert(
        paymentType === "DP"
          ? "Pesanan dibuat. Silakan lanjutkan pembayaran DP."
          : "Pesanan dibuat. Silakan lanjutkan pembayaran penuh."
      );

      // 👉 idealnya redirect ke /pesanan-saya
      // navigate("/pesanan-saya");

    } catch (err) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading)
    return <div className="py-20 text-center">Memuat produk...</div>;

  if (!product)
    return <div className="py-20 text-center">Produk tidak ditemukan</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 bg-white">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* LEFT */}
        <div className="flex gap-6">
          <div className="w-[45%] bg-gray-100 rounded-md overflow-hidden">
            {product.foto && (
              <img
                src={product.foto}
                alt={product.nama_produk}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 space-y-6">
            <div className="w-full h-40 bg-gray-200 rounded-md" />
            <div className="w-full h-40 bg-gray-200 rounded-md" />
          </div>
        </div>

        {/* RIGHT */}
        <div>
          <h1 className="text-3xl font-serif font-semibold">
            {product.nama_produk}
          </h1>

          <p className="text-red-600 text-lg mt-2">
            Rp {product.harga.toLocaleString("id-ID")} / pcs
          </p>

          <p className="mt-2 text-sm text-gray-600">
            Estimasi {product.estimasi_pengerjaan} Hari
          </p>

          {/* QTY */}
          <div className="mt-6">
            <label className="block text-sm text-gray-600 mb-1">
              Jumlah (Qty)
            </label>
            <input
              type="number"
              min="1"
              value={qty}
              onChange={(e) => setQty(e.target.value)}
              className="w-32 border rounded-md px-3 py-2 text-sm"
            />
          </div>

          {/* TOTAL */}
          {qty && (
            <div className="mt-4 text-sm">
              <div>Total Harga: <strong>Rp {totalHarga.toLocaleString("id-ID")}</strong></div>
              <div className="text-gray-500">
                DP (50%): Rp {hargaDP.toLocaleString("id-ID")}
              </div>
            </div>
          )}

          {/* CATATAN */}
          <div className="mt-4">
            <label className="block text-sm text-gray-600 mb-1">
              Catatan (opsional)
            </label>
            <textarea
              rows={2}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm"
              placeholder="Contoh: warna biru, bordir logo"
            />
          </div>

          {/* JENIS PEMBAYARAN */}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setPaymentType("DP")}
              className={`px-4 py-2 rounded-full text-sm border
                ${paymentType === "DP"
                  ? "bg-black text-white"
                  : "bg-white text-gray-600"}
              `}
            >
              Bayar DP
            </button>

            <button
              type="button"
              onClick={() => setPaymentType("FULL")}
              className={`px-4 py-2 rounded-full text-sm border
                ${paymentType === "FULL"
                  ? "bg-black text-white"
                  : "bg-white text-gray-600"}
              `}
            >
              Bayar Full
            </button>
          </div>

          {/* ACTION */}
          <div className="mt-8 flex gap-4">
            <button
              disabled={!qty || isSubmitting}
              onClick={handleCreatePesanan}
              className="px-6 py-3 rounded-full text-sm font-medium bg-black text-white disabled:opacity-50"
            >
              {isSubmitting
                ? "Memproses..."
                : paymentType === "DP"
                ? "Pesan & Bayar DP"
                : "Pesan & Bayar Full"}
            </button>

            <a
              href="https://wa.me/6285860333077"
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-full bg-gray-200 text-sm"
            >
              Hubungi Admin
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
