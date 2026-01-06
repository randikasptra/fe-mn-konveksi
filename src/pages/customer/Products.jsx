import React, { useEffect, useMemo, useState } from "react";
import { FiFilter } from "react-icons/fi";
import { FaWhatsapp } from "react-icons/fa";
import ProductDetail from "./ProductDetail";

/* ================= KONFIG ================= */
const API_BASE = "https://be-mn-konveksi.vercel.app";

/* ===== KATEGORI FILTER (UI TETAP) ===== */
const CATEGORIES = [
  "Sekolah",
  "Moeslim",
  "Dinas",
  "Kesehatan",
  "Lapangan",
  "Instansi",
  "Olahraga",
];

/* ===== HELPER FOTO (SESUAI BE) ===== */
function resolveImage(foto) {
  if (!foto) return null;

  // sudah full URL
  if (foto.startsWith("http")) return foto;

  // filename dari BE
  return `${API_BASE}/uploads/${foto}`;
}

export default function Products() {
  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  /* ===== MODAL DETAIL ===== */
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const isLoggedIn = !!localStorage.getItem("mn_token");

  /* ================= FETCH PRODUK ================= */
  useEffect(() => {
    async function fetchProduk() {
      try {
        const res = await fetch(`${API_BASE}/api/produk`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        setProducts(json.data || []);
      } catch (err) {
        console.error("Fetch produk error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProduk();
  }, []);

  /* ================= FILTER KATEGORI ================= */
  const toggleCategory = (cat) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredProducts = useMemo(() => {
    if (selected.length === 0) return products;

    return products.filter((p) =>
      selected.includes(p.kategori || "")
    );
  }, [products, selected]);

  /* ================= HANDLE PESAN ================= */
  function handleOrder(e, product) {
    e.stopPropagation();

    if (!isLoggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    // 🔴 PAKAI ID SESUAI BE
    setDetailId(product.id_produk);
    setOpenDetail(true);
  }

  /* ================= RENDER ================= */
  return (
    <div className="w-full min-h-screen bg-white">
      <div className="flex w-full">
        {/* ================= SIDEBAR ================= */}
        <aside className="w-64 border-r border-gray-200 px-6 py-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <FiFilter className="text-gray-500" />
            </div>
            <h2 className="text-sm font-medium">Filter</h2>
          </div>

          <h3 className="text-sm font-semibold mb-4">Koleksi Baju</h3>

          <div className="space-y-3">
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                {cat}
              </label>
            ))}
          </div>
        </aside>

        {/* ================= PRODUCT LIST ================= */}
        <main className="flex-1 px-10 py-8">
          <h1 className="text-xl font-semibold mb-8">
            Product list{" "}
            <span className="text-gray-400">
              ({filteredProducts.length})
            </span>
          </h1>

          {loading ? (
            <p className="text-gray-500">Memuat produk...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="text-gray-400">Produk tidak ditemukan</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((item) => (
                <div
                  key={item.id_produk}
                  className="border border-gray-200 rounded-lg overflow-hidden bg-white"
                >
                  {/* ================= IMAGE ================= */}
                  <div className="w-full h-56 bg-gray-100 relative overflow-hidden">
                    {resolveImage(item.foto) && (
                      <img
                        src={resolveImage(item.foto)}
                        alt={item.nama_produk}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* ================= CONTENT ================= */}
                  <div className="p-4">
                    <h3 className="font-medium mb-3">
                      {item.nama_produk}
                    </h3>

                    <div className="flex items-center gap-3">
                      <button
                        disabled={!isLoggedIn}
                        onClick={(e) => handleOrder(e, item)}
                        className={`flex-1 h-10 border rounded-md text-sm transition
                          ${
                            isLoggedIn
                              ? "border-gray-300 text-gray-700 hover:bg-gray-50"
                              : "border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed"
                          }
                        `}
                      >
                        Pesan
                      </button>

                      <button
                        disabled={!isLoggedIn}
                        onClick={(e) => handleOrder(e, item)}
                        className={`w-10 h-10 border border-gray-300 rounded-md flex items-center justify-center transition
                          ${
                            isLoggedIn
                              ? "hover:bg-gray-50"
                              : "bg-gray-100 cursor-not-allowed"
                          }
                        `}
                      >
                        <FaWhatsapp
                          className={`text-lg ${
                            isLoggedIn
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>

                    {!isLoggedIn && (
                      <p className="mt-2 text-xs text-gray-400">
                        Login untuk melakukan pemesanan
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ================= MODAL DETAIL ================= */}
      {openDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="relative bg-white w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-xl">
            <button
              onClick={() => setOpenDetail(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              ✕
            </button>

            {/* 🔴 KIRIM ID (BUKAN SLUG) */}
            <ProductDetail modalId={detailId} />
          </div>
        </div>
      )}
    </div>
  );
}
