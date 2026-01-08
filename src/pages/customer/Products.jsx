import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import ProductCard from "../../components/customer/ProductCard";

const API_BASE = "https://be-mn-konveksi.vercel.app";

export default function Products() {
  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modern filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedMaterial, setSelectedMaterial] = useState("all");
  const [activeSort, setActiveSort] = useState("terbaru");
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const sortMenuRef = useRef(null);

  /* ================= DATA EXTRACTION ================= */
  // Extract unique categories
  const categories = [
    { id: "all", name: "Semua Kategori" },
    ...Array.from(new Set(products.map(p => p.kategori).filter(Boolean)))
      .map(cat => ({ id: cat, name: cat }))
  ];

  // Extract unique materials
  const materials = [
    { id: "all", name: "Semua Bahan" },
    ...Array.from(new Set(products.map(p => p.bahan).filter(Boolean)))
      .map(mat => ({ id: mat, name: mat }))
  ];

  // Get popular materials (top 6)
  const popularMaterials = materials
    .filter(m => m.id !== "all")
    .slice(0, 6);

  /* ================= FETCH PRODUK ================= */
  useEffect(() => {
    async function fetchProduk() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/produk`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Gagal memuat produk");

        const productsData = json.data || [];
        setProducts(productsData);
        setFilteredProducts(productsData);

      } catch (err) {
        console.error("Fetch produk error:", err);
        setError(err.message);
        setProducts([]);
        setFilteredProducts([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProduk();
    const token = localStorage.getItem("mn_token");
    setIsLoggedIn(!!token);
  }, []);

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    let result = [...products];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.nama_produk?.toLowerCase().includes(query) ||
          p.deskripsi?.toLowerCase().includes(query) ||
          p.bahan?.toLowerCase().includes(query) ||
          p.kategori?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(p => p.kategori === selectedCategory);
    }

    // Material filter
    if (selectedMaterial !== "all") {
      result = result.filter(p => p.bahan === selectedMaterial);
    }

    // Sorting
    result.sort((a, b) => {
      switch (activeSort) {
        case "harga-asc":
          return (a.harga || 0) - (b.harga || 0);
        case "harga-desc":
          return (b.harga || 0) - (a.harga || 0);
        case "nama-asc":
          return (a.nama_produk || "").localeCompare(b.nama_produk || "");
        case "nama-desc":
          return (b.nama_produk || "").localeCompare(a.nama_produk || "");
        case "terbaru":
        default:
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      }
    });

    setFilteredProducts(result);
  }, [products, searchQuery, selectedCategory, selectedMaterial, activeSort]);

  /* ================= HANDLE PESAN ================= */
  const handleOrderClick = (e, product) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    // Handle order logic here
    console.log("Order product:", product);
  };

  /* ================= MODERN FILTER HANDLERS ================= */
  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handleMaterialSelect = (materialId) => {
    setSelectedMaterial(materialId);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedMaterial("all");
    setActiveSort("terbaru");
  };

  // Close sort menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* ================= SORT OPTIONS ================= */
  const sortOptions = [
    { id: "terbaru", label: "Terbaru", icon: "mdi:new-box" },
    { id: "nama-asc", label: "Nama A-Z", icon: "mdi:sort-alphabetical-ascending" },
    { id: "nama-desc", label: "Nama Z-A", icon: "mdi:sort-alphabetical-descending" },
    { id: "harga-asc", label: "Harga: Rendah ke Tinggi", icon: "mdi:sort-numeric-ascending" },
    { id: "harga-desc", label: "Harga: Tinggi ke Rendah", icon: "mdi:sort-numeric-descending" }
  ];

  /* ================= MODERN FILTER DRAWER ================= */
  const renderFilterDrawer = () => (
    <div className={`fixed inset-0 z-50 ${showFilterDrawer ? 'block' : 'hidden'}`}>
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={() => setShowFilterDrawer(false)}
      ></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slideInRight">
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Filter</h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredProducts.length} produk ditemukan
              </p>
            </div>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Icon icon="mdi:close" className="text-2xl text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Categories */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Kategori</h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      selectedCategory === category.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Bahan</h3>
              <div className="space-y-2">
                {materials.map(material => (
                  <button
                    key={material.id}
                    onClick={() => handleMaterialSelect(material.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                      selectedMaterial === material.id
                        ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                        : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <span className="font-medium">{material.name}</span>
                    {selectedMaterial === material.id && (
                      <Icon icon="mdi:check-circle" className="text-emerald-600 text-xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">Urutkan</h3>
              <div className="space-y-2">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setActiveSort(option.id);
                      setShowFilterDrawer(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      activeSort === option.id
                        ? 'bg-indigo-50 text-indigo-700 border-2 border-indigo-200'
                        : 'hover:bg-gray-50 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <Icon icon={option.icon} className="text-xl" />
                    <span className="font-medium">{option.label}</span>
                    {activeSort === option.id && (
                      <Icon icon="mdi:check" className="ml-auto text-indigo-600 text-xl" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 space-y-3">
            <button
              onClick={resetFilters}
              className="w-full py-4 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors"
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Modern Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-20">
        {/* Abstract Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-48 h-48 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-5 py-2.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Icon icon="mdi:tshirt-crew" className="text-white text-xl" />
              <span className="text-white/90 font-medium">MN KONVEKSI</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Koleksi <span className="text-amber-300">Produk</span>
            </h1>
            
            <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              Temukan berbagai produk konveksi berkualitas dengan bahan premium dan harga terbaik
            </p>

            {/* Modern Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white rounded-2xl shadow-2xl p-2">
                <div className="flex items-center">
                  <div className="pl-4">
                    <Icon icon="mdi:magnify" className="text-gray-400 text-2xl" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk (contoh: Rompi, Jas, Seragam...)"
                    className="flex-1 px-4 py-5 focus:outline-none text-gray-700 placeholder-gray-400 text-lg"
                  />
                  <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="md:hidden px-5 py-3 text-gray-600 hover:text-indigo-600"
                  >
                    <Icon icon="mdi:filter" className="text-2xl" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Modern Filter Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedCategory === "all" ? "Semua Produk" : selectedCategory}
                </h2>
                <span className="px-4 py-1.5 bg-indigo-100 text-indigo-700 rounded-full font-semibold">
                  {filteredProducts.length} produk
                </span>
              </div>
              
              {/* Quick Category Chips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categories.slice(0, 6).map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
                {categories.length > 6 && (
                  <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    + Lainnya
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center gap-4">
              {/* Popular Materials */}
              <div className="hidden md:flex items-center gap-2">
                {popularMaterials.map(material => (
                  <button
                    key={material.id}
                    onClick={() => handleMaterialSelect(material.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedMaterial === material.id
                        ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {material.name}
                  </button>
                ))}
              </div>

              {/* Sort Dropdown */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="px-5 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3 text-gray-700 font-medium shadow-sm"
                >
                  <Icon icon="mdi:sort" className="text-xl" />
                  <span className="hidden md:inline">
                    {sortOptions.find(s => s.id === activeSort)?.label}
                  </span>
                  <Icon 
                    icon={showSortMenu ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    className="text-xl"
                  />
                </button>
                
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-10 animate-fadeIn">
                    <div className="p-2">
                      {sortOptions.map(option => (
                        <button
                          key={option.id}
                          onClick={() => {
                            setActiveSort(option.id);
                            setShowSortMenu(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            activeSort === option.id
                              ? "bg-indigo-50 text-indigo-700"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          <Icon icon={option.icon} className="text-lg" />
                          <span>{option.label}</span>
                          {activeSort === option.id && (
                            <Icon icon="mdi:check" className="ml-auto text-indigo-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Filter Button (Mobile) */}
              <button
                onClick={() => setShowFilterDrawer(true)}
                className="md:hidden p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm"
              >
                <Icon icon="mdi:filter" className="text-2xl text-gray-700" />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" || selectedMaterial !== "all" || searchQuery) && (
            <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:filter" className="text-indigo-600 text-xl" />
                  <span className="font-medium text-gray-700">Filter Aktif:</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-indigo-700 rounded-xl border border-indigo-200">
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="hover:text-indigo-900"
                      >
                        <Icon icon="mdi:close" />
                      </button>
                    </span>
                  )}

                  {selectedMaterial !== "all" && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-emerald-700 rounded-xl border border-emerald-200">
                      {selectedMaterial}
                      <button
                        onClick={() => setSelectedMaterial("all")}
                        className="hover:text-emerald-900"
                      >
                        <Icon icon="mdi:close" />
                      </button>
                    </span>
                  )}

                  {searchQuery && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-xl border border-gray-200">
                      "{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:text-gray-900"
                      >
                        <Icon icon="mdi:close" />
                      </button>
                    </span>
                  )}

                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Hapus Semua
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-700">Memuat produk...</h3>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:alert-circle"
                className="text-red-500 text-4xl"
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Terjadi Kesalahan</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
            >
              Coba Lagi
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:package-variant-remove"
                className="text-gray-400 text-4xl"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Produk Tidak Ditemukan</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Coba ubah filter pencarian Anda atau cari produk lain
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Reset Filter
              </button>
              <button
                onClick={() => setShowFilterDrawer(true)}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Ubah Filter
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id_produk}
                  product={product}
                  onOrderClick={handleOrderClick}
                  isLoggedIn={isLoggedIn}
                />
              ))}
            </div>

            {/* Results Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Menampilkan <span className="font-semibold">{filteredProducts.length}</span> dari{" "}
                <span className="font-semibold">{products.length}</span> produk
              </p>
            </div>
          </>
        )}

        {/* Modern CTA Section */}
        <div className="mt-20">
          <div className="relative bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 rounded-3xl overflow-hidden">
            <div className="absolute inset-0">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full translate-x-24 translate-y-24"></div>
            </div>
            
            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Butuh Produk Custom?
              </h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                Kami menerima pesanan custom dengan desain dan bahan sesuai kebutuhan Anda.
                Konsultasikan kebutuhan Anda dengan tim ahli kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const phoneNumber = "6281234567890";
                    const message = "Halo MN Konveksi, saya ingin konsultasi tentang produk custom. Bisa dibantu?";
                    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(url, "_blank");
                  }}
                  className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 shadow-lg"
                >
                  <Icon icon="mdi:whatsapp" className="text-2xl" />
                  Konsultasi via WhatsApp
                </button>
                <button
                  className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
                >
                  Lihat Portofolio
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Filter Drawer */}
      {renderFilterDrawer()}

      {/* Add custom animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideInRight {
          animation: slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}