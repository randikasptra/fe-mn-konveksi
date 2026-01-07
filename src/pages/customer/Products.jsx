// src/pages/customer/Products.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import ProductCard from "../../components/customer/ProductCard";
import ProductDetailModal from "../../components/customer/ProductDetailModal";

/* ================= KONFIG ================= */
const API_BASE = "https://be-mn-konveksi.vercel.app";

export default function Products() {
  /* ================= STATE ================= */
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [sortBy, setSortBy] = useState("terbaru");

  // Modal state
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Extract unique categories and materials
  const categories = useMemo(() => {
    const cats = products
      .map((p) => p.kategori)
      .filter(Boolean)
      .filter((cat, index, self) => self.indexOf(cat) === index);
    return cats.sort();
  }, [products]);

  const materials = useMemo(() => {
    const mats = products
      .map((p) => p.bahan)
      .filter(Boolean)
      .filter((mat, index, self) => self.indexOf(mat) === index);
    return mats.sort();
  }, [products]);

  /* ================= FETCH PRODUK ================= */
  useEffect(() => {
    async function fetchProduk() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/produk`);
        const json = await res.json();

        if (!res.ok) throw new Error(json.message || "Gagal memuat produk");

        setProducts(json.data || []);
        setFilteredProducts(json.data || []);

        // Set max price range
        if (json.data && json.data.length > 0) {
          const maxPrice = Math.max(...json.data.map((p) => p.harga || 0));
          setPriceRange([0, maxPrice]);
        }
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

    // Check auth
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
    if (selectedCategories.length > 0) {
      result = result.filter(
        (p) => p.kategori && selectedCategories.includes(p.kategori)
      );
    }

    // Material filter
    if (selectedMaterials.length > 0) {
      result = result.filter(
        (p) => p.bahan && selectedMaterials.includes(p.bahan)
      );
    }

    // Price range filter
    result = result.filter(
      (p) => p.harga >= priceRange[0] && p.harga <= priceRange[1]
    );

    // Sorting
    result.sort((a, b) => {
      switch (sortBy) {
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
  }, [
    products,
    searchQuery,
    selectedCategories,
    selectedMaterials,
    priceRange,
    sortBy,
  ]);

  /* ================= HANDLE PESAN ================= */
  const handleOrderClick = (e, product) => {
    e.stopPropagation();

    if (!isLoggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    setSelectedProductId(product.id_produk);
    setIsDetailModalOpen(true);
  };

  /* ================= HANDLE FILTERS ================= */
  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const toggleMaterial = (material) => {
    setSelectedMaterials((prev) =>
      prev.includes(material)
        ? prev.filter((m) => m !== material)
        : [...prev, material]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setPriceRange([0, Math.max(...products.map((p) => p.harga || 0))]);
    setSortBy("terbaru");
  };

  /* ================= RENDER ================= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-16">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Koleksi Produk
          </h1>
          <p className="text-indigo-100 text-lg max-w-2xl">
            Temukan berbagai produk konveksi berkualitas dengan bahan premium
            dan harga terbaik
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="lg:flex gap-8">
          {/* ================= SIDEBAR FILTER ================= */}
          <aside className="lg:w-80 mb-8 lg:mb-0">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sticky top-24">
              {/* Filter Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Icon
                      icon="mdi:filter"
                      className="text-indigo-600 text-xl"
                    />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">Filter Produk</h2>
                    <p className="text-sm text-gray-500">
                      {filteredProducts.length} produk ditemukan
                    </p>
                  </div>
                </div>
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Cari Produk
                </h3>
                <div className="relative">
                  <Icon
                    icon="mdi:magnify"
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama produk atau bahan..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Kategori</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => toggleCategory(category)}
                        className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                      />
                      <span className="text-gray-700">{category}</span>
                      <span className="ml-auto text-sm text-gray-500">
                        (
                        {products.filter((p) => p.kategori === category).length}
                        )
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Materials (Dinamis) */}
              {materials.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Bahan</h3>
                  <div className="space-y-2">
                    {materials.map((material) => (
                      <label
                        key={material}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedMaterials.includes(material)}
                          onChange={() => toggleMaterial(material)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">{material}</span>
                        <span className="ml-auto text-sm text-gray-500">
                          ({products.filter((p) => p.bahan === material).length}
                          )
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Range */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Rentang Harga
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Rp {priceRange[0].toLocaleString()}</span>
                    <span>Rp {priceRange[1].toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(...products.map((p) => p.harga || 0))}
                    value={priceRange[1]}
                    onChange={(e) =>
                      setPriceRange([priceRange[0], parseInt(e.target.value)])
                    }
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Sort */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Urutkan</h3>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="terbaru">Terbaru</option>
                  <option value="harga-asc">Harga: Rendah ke Tinggi</option>
                  <option value="harga-desc">Harga: Tinggi ke Rendah</option>
                  <option value="nama-asc">Nama: A-Z</option>
                  <option value="nama-desc">Nama: Z-A</option>
                </select>
              </div>
            </div>
          </aside>

          {/* ================= PRODUCT LIST ================= */}
          <main className="flex-1">
            {/* Filter Tags */}
            {(selectedCategories.length > 0 ||
              selectedMaterials.length > 0 ||
              searchQuery) && (
              <div className="mb-6 flex flex-wrap gap-2">
                {selectedCategories.map((cat) => (
                  <span
                    key={`cat-${cat}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg border border-indigo-100 text-sm"
                  >
                    {cat}
                    <button
                      onClick={() => toggleCategory(cat)}
                      className="hover:text-indigo-900"
                    >
                      <Icon icon="mdi:close" />
                    </button>
                  </span>
                ))}

                {selectedMaterials.map((mat) => (
                  <span
                    key={`mat-${mat}`}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 rounded-lg border border-emerald-100 text-sm"
                  >
                    {mat}
                    <button
                      onClick={() => toggleMaterial(mat)}
                      className="hover:text-emerald-900"
                    >
                      <Icon icon="mdi:close" />
                    </button>
                  </span>
                ))}

                {searchQuery && (
                  <span className="inline-flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg border border-gray-200 text-sm">
                    "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="hover:text-gray-900"
                    >
                      <Icon icon="mdi:close" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Products Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-500">Memuat produk...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-red-500 text-3xl"
                  />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Coba Lagi
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon
                    icon="mdi:package-variant-remove"
                    className="text-gray-400 text-3xl"
                  />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Produk Tidak Ditemukan
                </h3>
                <p className="text-gray-500 mb-6">
                  Coba ubah filter pencarian Anda atau cari produk lain
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id_produk}
                      product={product}
                      onOrderClick={handleOrderClick}
                      isLoggedIn={isLoggedIn}
                    />
                  ))}
                </div>

                {/* Pagination Info */}
                <div className="mt-12 pt-8 border-t border-gray-200 text-center">
                  <p className="text-gray-600">
                    Menampilkan {filteredProducts.length} dari {products.length}{" "}
                    produk
                  </p>
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Product Detail Modal */}
      {isDetailModalOpen && selectedProductId && (
        <ProductDetailModal
          productId={selectedProductId}
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedProductId(null);
          }}
        />
      )}
    </div>
  );
}
