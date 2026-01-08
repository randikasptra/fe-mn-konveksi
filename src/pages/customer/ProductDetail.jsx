// src/pages/customer/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";
import toast from "react-hot-toast";
import productService from "../../services/productService";
import CheckoutModal from "../../components/customer/CheckoutModal";

export default function ProductDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /* ================= CHECK LOGIN STATUS ================= */
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(productService.isLoggedIn());
    };

    checkAuth();
    window.addEventListener("authChanged", checkAuth);
    return () => window.removeEventListener("authChanged", checkAuth);
  }, []);

  /* ================= FETCH DETAIL PRODUK ================= */
  useEffect(() => {
    if (!id) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        const result = await productService.getProductDetail(id);
        
        if (!result.success) {
          throw new Error(result.message);
        }
        
        setProduct(result.data);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Gagal memuat produk");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [id]);

  /* ================= HANDLE ORDER CLICK ================= */
  const handleOrderClick = () => {
    if (!isLoggedIn) {
      navigate("/login", { 
        state: { 
          from: { 
            pathname: `/produk/${id}` 
          } 
        } 
      });
      return;
    }
    setShowCheckoutModal(true);
  };

  /* ================= LOADING STATE ================= */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon icon="mdi:needle" className="text-indigo-600 text-2xl" />
            </div>
          </div>
          <p className="mt-6 text-gray-600 text-lg font-medium">Memuat detail produk...</p>
        </div>
      </div>
    );
  }

  /* ================= NOT FOUND STATE ================= */
  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icon icon="mdi:package-variant-closed" className="text-red-500 text-4xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Produk Tidak Ditemukan</h2>
          <p className="text-gray-600 mb-8">Produk yang Anda cari tidak tersedia atau telah dihapus.</p>
          <button
            onClick={() => navigate("/produk")}
            className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Kembali ke Daftar Produk
          </button>
        </div>
      </div>
    );
  }

  /* ================= GENERATE IMAGE THUMBNAILS ================= */
  const imageThumbnails = product.foto 
    ? [product.foto, product.foto, product.foto] // Jika hanya 1 gambar, duplikat untuk demo
    : [];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Gradient Background */}
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 opacity-5 -z-10"></div>

        <div className="container mx-auto px-4 py-12 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
            <button onClick={() => navigate("/")} className="hover:text-indigo-600">
              Beranda
            </button>
            <Icon icon="mdi:chevron-right" className="text-gray-400" />
            <button onClick={() => navigate("/produk")} className="hover:text-indigo-600">
              Produk
            </button>
            <Icon icon="mdi:chevron-right" className="text-gray-400" />
            <span className="text-gray-900 font-medium truncate">{product.nama_produk}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* LEFT - Product Images */}
            <div className="space-y-6">
              {/* Main Image */}
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl overflow-hidden shadow-2xl">
                {product.foto ? (
                  <img
                    src={product.foto}
                    alt={product.nama_produk}
                    className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-700"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500' viewBox='0 0 600 500'%3E%3Crect width='600' height='500' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3EGambar Produk%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="w-full h-[500px] flex flex-col items-center justify-center">
                    <Icon icon="mdi:tshirt-crew-outline" className="text-gray-300 text-6xl mb-4" />
                    <span className="text-gray-400">Gambar tidak tersedia</span>
                  </div>
                )}
                
                {/* Product Badges */}
                {product.estimasi_pengerjaan && (
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                    <div className="flex items-center gap-2">
                      <Icon icon="mdi:clock-fast" className="text-emerald-500" />
                      <span className="font-semibold text-gray-800">
                        {product.estimasi_pengerjaan} Hari
                      </span>
                    </div>
                  </div>
                )}
                
                {product.kategori && (
                  <div className="absolute top-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-xl shadow-lg">
                    <span className="font-semibold">{product.kategori}</span>
                  </div>
                )}
              </div>

              {/* Image Thumbnails */}
              {imageThumbnails.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {imageThumbnails.map((thumb, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                        selectedImage === index 
                          ? 'border-indigo-600 shadow-lg scale-105' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={thumb}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                  <Icon icon="mdi:shield-check" className="text-indigo-600 text-2xl mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">Garansi Kualitas</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                  <Icon icon="mdi:truck-fast" className="text-emerald-600 text-2xl mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">Pengiriman Cepat</p>
                </div>
                <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                  <Icon icon="mdi:headset" className="text-amber-600 text-2xl mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">Support 24/7</p>
                </div>
              </div>
            </div>

            {/* RIGHT - Product Info */}
            <div className="space-y-8">
              {/* Product Header */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                  {product.nama_produk}
                </h1>
                
                <div className="flex items-baseline gap-4 mb-6">
                  <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    {productService.formatPrice(product.harga)}
                  </span>
                  <span className="text-gray-400">/ pcs</span>
                </div>

                {/* Product Tags */}
                <div className="flex flex-wrap gap-3">
                  {product.bahan && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl text-sm font-medium">
                      <Icon icon="mdi:tag" className="text-gray-500" />
                      {product.bahan}
                    </span>
                  )}
                  {product.estimasi_pengerjaan && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-700 rounded-xl text-sm font-medium">
                      <Icon icon="mdi:clock" className="text-emerald-500" />
                      {product.estimasi_pengerjaan} Hari Kerja
                    </span>
                  )}
                  {product.stok && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 rounded-xl text-sm font-medium">
                      <Icon icon="mdi:package-variant" className="text-blue-500" />
                      Stok: {product.stok}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              {product.deskripsi && (
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:text-box" className="text-white text-lg" />
                    </div>
                    Deskripsi Produk
                  </h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                    {product.deskripsi}
                  </p>
                </div>
              )}

              {/* Specifications */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:clipboard-list" className="text-white text-lg" />
                  </div>
                  Spesifikasi Detail
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="text-gray-600 font-medium">Harga Satuan</span>
                    <span className="text-gray-900 font-bold">{productService.formatPrice(product.harga)}</span>
                  </div>
                  {product.bahan && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Material/Bahan</span>
                      <span className="text-gray-900 font-bold">{product.bahan}</span>
                    </div>
                  )}
                  {product.estimasi_pengerjaan && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Estimasi Produksi</span>
                      <span className="text-gray-900 font-bold">{product.estimasi_pengerjaan} Hari</span>
                    </div>
                  )}
                  {product.minimal_order && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-gray-600 font-medium">Minimal Order</span>
                      <span className="text-gray-900 font-bold">{product.minimal_order} pcs</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={handleOrderClick}
                  className={`
                    w-full py-5 rounded-2xl text-lg font-bold transition-all duration-300
                    flex items-center justify-center gap-3
                    ${isLoggedIn
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                      : "bg-gradient-to-r from-gray-800 to-black text-white hover:from-gray-900 hover:to-black"
                    }
                  `}
                >
                  {isLoggedIn ? (
                    <>
                      <Icon icon="mdi:shopping" className="text-2xl" />
                      Pesan Sekarang
                    </>
                  ) : (
                    <>
                      <Icon icon="mdi:lock" className="text-2xl" />
                      Login untuk Memesan
                    </>
                  )}
                </button>

                <div className="grid grid-cols-2 gap-4">
                  <a
                    href="https://wa.me/6281234567890"
                    target="_blank"
                    rel="noreferrer"
                    className="group px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Icon icon="mdi:whatsapp" className="text-2xl" />
                    <span>Konsultasi</span>
                  </a>

                  <button
                    onClick={() => navigate("/produk")}
                    className="px-6 py-4 bg-white border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3"
                  >
                    <Icon icon="mdi:format-list-bulleted" className="text-xl" />
                    <span>Lainnya</span>
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200 p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Icon icon="mdi:information" className="text-white text-2xl" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-indigo-900 mb-2">Informasi Penting</h4>
                    <ul className="space-y-2 text-indigo-800">
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>Pembayaran DP 50% untuk konfirmasi pesanan</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>Free konsultasi desain dengan tim kami</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon icon="mdi:check-circle" className="text-indigo-500 mt-1 flex-shrink-0" />
                        <span>Garansi kualitas bahan dan jahitan</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal - Component yang sudah dipisah */}
      {showCheckoutModal && (
        <CheckoutModal
          product={product}
          onClose={() => setShowCheckoutModal(false)}
        />
      )}
    </>
  );
}