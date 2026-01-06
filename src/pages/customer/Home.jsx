// src/pages/customer/Home.jsx
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/common/Footer";
import ProductDetail from "./ProductDetail";

/* ================= HELPER ================= */
function resolveImage(foto) {
  if (!foto) return null;
  if (typeof foto === "string" && foto.startsWith("http")) return foto;
  return null;
}

export default function Home() {
  const navigate = useNavigate();

  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== MODAL DETAIL ===== */
  const [openDetail, setOpenDetail] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const isLoggedIn = !!localStorage.getItem("mn_token");

  /* ================= FETCH PRODUK ================= */
  useEffect(() => {
    async function fetchProduk() {
      try {
        const res = await fetch(
          "https://be-mn-konveksi.vercel.app/api/produk"
        );
        const json = await res.json();
        if (!res.ok) throw new Error(json.message);

        setProducts((json.data || []).slice(0, 4));
      } catch (err) {
        console.error("Fetch produk error:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProduk();
  }, []);

  /* ================= HANDLE PESAN ================= */
  function handleOrder(e, product) {
    e.stopPropagation(); // 🔴 penting

    if (!isLoggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    setDetailId(product.id_produk);
    setOpenDetail(true);
  }

  return (
    <div className="w-full text-gray-800 bg-white">
      {/* ================= HERO ================= */}
      <section className="bg-[#57595B] text-center py-10">
        <h1 className="text-3xl md:text-4xl font-serif tracking-wide text-white">
          MN KONVEKSI
        </h1>
        <p className="text-lg text-white mt-2">Dari Kain Menjadi Karya</p>

        <div className="mt-8 w-full max-w-6xl mx-auto overflow-hidden rounded-xl">
          <div className="relative w-full aspect-[12/5]">
            <img
              src="/src/assets/banner-home.png"
              alt="Banner Produk Konveksi"
              className="absolute inset-0 w-full h-full object-cover object-top"
            />
          </div>
        </div>
      </section>

      {/* ================= PRODUK KAMI ================= */}
      <section className="text-center py-10">
        <h2 className="text-2xl md:text-3xl font-serif mb-8">Produk Kami</h2>

        {loading ? (
          <p className="text-gray-500">Memuat produk...</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 px-6 md:px-20">
            {products.map((p) => (
              <article
                key={p.id_produk}
                className="bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm flex flex-col hover:shadow-md transition"
              >
                {/* IMAGE */}
                <div className="h-64 md:h-72 w-full relative overflow-hidden bg-gray-100">
                  {resolveImage(p.foto) ? (
                    <img
                      src={resolveImage(p.foto)}
                      alt={p.nama_produk}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="text-lg font-semibold mb-3">
                    {p.nama_produk}
                  </h3>

                  <div className="flex gap-3 mt-auto">
                    {/* PESAN */}
                    <button
                      disabled={!isLoggedIn}
                      onClick={(e) => handleOrder(e, p)}
                      className={`flex-1 px-4 py-1 rounded-lg border text-lg
                        ${
                          isLoggedIn
                            ? "bg-gray-50 hover:bg-gray-100"
                            : "bg-gray-200 cursor-not-allowed"
                        }
                      `}
                    >
                      Pesan
                    </button>

                    {/* WHATSAPP */}
                    <button
                      disabled={!isLoggedIn}
                      onClick={(e) => handleOrder(e, p)}
                      className={`w-12 h-12 border rounded-md flex items-center justify-center
                        ${
                          isLoggedIn
                            ? "bg-white hover:shadow-md"
                            : "bg-gray-200 cursor-not-allowed"
                        }
                      `}
                    >
                      <Icon
                        icon="mdi:whatsapp"
                        className={`text-2xl ${
                          isLoggedIn ? "text-green-700" : "text-gray-400"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <button
          onClick={() => navigate("/produk")}
          className="mt-10 px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded text-sm"
        >
          Lihat Semua
        </button>
      </section>

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

            <ProductDetail modalId={detailId} />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
