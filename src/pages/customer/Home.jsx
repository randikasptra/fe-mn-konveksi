// src/pages/customer/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { produkService, authService } from "../../services/api";
import HeroSection from "../../components/customer/HeroSection";
import ProductCard from "../../components/customer/ProductCard";
import ProductDetailModal from "../../components/customer/ProductDetailModal";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Icon } from "@iconify/react";

export default function Home() {
  const navigate = useNavigate();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();
    window.addEventListener("storage", checkAuth);
    window.addEventListener("authChange", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("authChange", checkAuth);
    };
  }, []);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await produkService.getProdukLimit(8);
        setProducts(data);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Gagal memuat produk. Silakan coba lagi.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Handle order button click
  const handleOrderClick = (e, product) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    setSelectedProductId(product.id_produk);
    setIsDetailModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <HeroSection />

      {/* Products Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-1/2 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Icon icon="mdi:star-circle" className="text-lg" />
              Koleksi Terbaik
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Produk Unggulan
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Temukan karya konveksi premium dengan bahan pilihan dan jahitan
              presisi untuk penampilan terbaik Anda.
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col justify-center items-center py-20">
              <LoadingSpinner className="w-12 h-12 text-indigo-600" />
              <p className="mt-4 text-gray-500">Memuat produk terbaik...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20 bg-red-50 rounded-2xl p-8 max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon
                  icon="mdi:alert-circle"
                  className="text-red-500 text-2xl"
                />
              </div>
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
              >
                <Icon icon="mdi:reload" className="inline mr-2" />
                Coba Lagi
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => (
                  <ProductCard
                    key={product.id_produk}
                    product={product}
                    onOrderClick={handleOrderClick}
                    isLoggedIn={isLoggedIn}
                  />
                ))}
              </div>

              {/* View All Button */}
              <div className="text-center mt-16">
                <button
                  onClick={() => navigate("/produk")}
                  className="group px-8 py-4 bg-white border-2 border-indigo-200 text-indigo-700 font-semibold rounded-xl hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 hover:text-white hover:border-transparent hover:shadow-xl transition-all duration-300 inline-flex items-center gap-3 text-lg"
                >
                  Jelajahi Semua Produk
                  <span className="group-hover:translate-x-2 transition-transform duration-300">
                    <Icon icon="mdi:arrow-right" />
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Mengapa Memilih Kami?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Komitmen kami terhadap kualitas dan kepuasan pelanggan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "mdi:shield-check",
                title: "Kualitas Terjamin",
                desc: "Bahan premium Grade A dengan standar jahitan tinggi",
                color: "bg-emerald-500",
              },
              {
                icon: "mdi:lightning-bolt",
                title: "Proses Cepat",
                desc: "Pengerjaan tepat waktu dengan tim profesional berpengalaman",
                color: "bg-amber-500",
              },
              {
                icon: "mdi:palette",
                title: "Custom Desain",
                desc: "Desain eksklusif sesuai permintaan Anda",
                color: "bg-purple-500",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-indigo-100 hover:-translate-y-2"
              >
                <div
                  className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon icon={feature.icon} className="text-white text-2xl" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-80 h-80 border-2 border-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Siap Mewujudkan Desain Anda?
          </h2>
          <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto">
            Konsultasikan kebutuhan konveksi Anda dengan tim profesional kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() =>
                window.open("https://wa.me/6281234567890", "_blank")
              }
              className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
            >
              <Icon icon="mdi:whatsapp" className="text-2xl" />
              Konsultasi via WhatsApp
            </button>
            <button
              onClick={() => window.dispatchEvent(new Event("openLoginModal"))}
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300"
            >
              Buat Pesanan Sekarang
            </button>
          </div>
        </div>
      </section>

      {/* Product Detail Modal */}
      {isDetailModalOpen && selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          isOpen={isDetailModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
