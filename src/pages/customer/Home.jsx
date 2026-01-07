// src/pages/customer/Home.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { produkService, authService } from "../../services/api";
import HeroSection from "../../components/customer/HeroSection";
import ProductCard from "../../components/customer/ProductCard";
import ProductDetailModal from "../../components/customer/ProductDetailModal";
import Footer from "../../components/common/Footer";
import LoadingSpinner from "../../components/common/LoadingSpinner";

export default function Home() {
  const navigate = useNavigate();

  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const loggedIn = authService.isLoggedIn();
      setIsLoggedIn(loggedIn);
    };

    checkAuth();

    // Listen for auth changes
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
        const data = await produkService.getProdukLimit(8); // Ambil 8 produk
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <HeroSection />

      {/* Products Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-800 mb-4">
              Produk Unggulan Kami
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan koleksi produk konveksi berkualitas tinggi dengan bahan
              premium dan hasil jahitan terbaik
            </p>
            <div className="w-24 h-1 bg-[#57595B] mx-auto mt-6 rounded-full"></div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="text-center py-20">
              <div className="text-red-500 mb-4">⚠️ {error}</div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#57595B] text-white rounded-lg hover:bg-[#3a3c3e] transition-colors"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {/* Products Grid */}
          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
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
              <div className="text-center mt-12">
                <button
                  onClick={() => navigate("/produk")}
                  className="group px-8 py-3 bg-transparent border-2 border-[#57595B] text-[#57595B] font-semibold rounded-lg hover:bg-[#57595B] hover:text-white transition-all duration-300 inline-flex items-center gap-2"
                >
                  Lihat Semua Produk
                  <span className="group-hover:translate-x-1 transition-transform">
                    →
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#57595B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Kualitas Terjamin</h3>
              <p className="text-gray-600">
                Bahan premium dan jahitan berkualitas tinggi
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#57595B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Proses Cepat</h3>
              <p className="text-gray-600">
                Pengerjaan tepat waktu sesuai deadline
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#57595B] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Design</h3>
              <p className="text-gray-600">Desain sesuai keinginan Anda</p>
            </div>
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
