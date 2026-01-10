import React, { useEffect, useState, useRef } from "react";
import { Icon } from "@iconify/react";
import ProductCard from "../../components/customer/ProductCard";
import { produkService } from "../../services/api"; // ✅ IMPORT produkService

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
  const [heroImages] = useState([
    "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1554412933-514a83d2f3c8?w-800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop",
  ]);

  const sortMenuRef = useRef(null);

  /* ================= DATA EXTRACTION ================= */
  const categories = [
    { id: "all", name: "Semua Kategori", icon: "mdi:shirt" },
    ...Array.from(new Set(products.map((p) => p.kategori).filter(Boolean))).map(
      (cat) => ({
        id: cat,
        name: cat,
        icon:
          cat === "Kemeja"
            ? "mdi:shirt"
            : cat === "Jaket"
            ? "mdi:jacket"
            : cat === "Celana"
            ? "mdi:human-male-pants"
            : "mdi:tshirt-crew",
      })
    ),
  ];

  const materials = [
    { id: "all", name: "Semua Bahan" },
    ...Array.from(new Set(products.map((p) => p.bahan).filter(Boolean))).map(
      (mat) => ({ id: mat, name: mat })
    ),
  ];

  const popularMaterials = materials.filter((m) => m.id !== "all").slice(0, 6);

  /* ================= FETCH PRODUK ================= */
  useEffect(() => {
    async function fetchProduk() {
      try {
        setLoading(true);
        setError(null);

        // ✅ GUNAKAN produkService.getProduk() DARI UNIFIED API
        const json = await produkService.getProduk();
        const productsData = json.data || [];

        setProducts(productsData);
        setFilteredProducts(productsData);
      } catch (err) {
        console.error("Fetch produk error:", err);
        setError(err.message || "Gagal memuat produk");
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

    if (selectedCategory !== "all") {
      result = result.filter((p) => p.kategori === selectedCategory);
    }

    if (selectedMaterial !== "all") {
      result = result.filter((p) => p.bahan === selectedMaterial);
    }

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

    console.log("Order product:", product);
  };

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sortMenuRef.current && !sortMenuRef.current.contains(event.target)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ================= SORT OPTIONS ================= */
  const sortOptions = [
    { id: "terbaru", label: "Terbaru", icon: "mdi:new-box" },
    {
      id: "nama-asc",
      label: "Nama A-Z",
      icon: "mdi:sort-alphabetical-ascending",
    },
    {
      id: "nama-desc",
      label: "Nama Z-A",
      icon: "mdi:sort-alphabetical-descending",
    },
    {
      id: "harga-asc",
      label: "Harga: Rendah ke Tinggi",
      icon: "mdi:sort-numeric-ascending",
    },
    {
      id: "harga-desc",
      label: "Harga: Tinggi ke Rendah",
      icon: "mdi:sort-numeric-descending",
    },
  ];

  /* ================= MODERN FILTER DRAWER ================= */
  const renderFilterDrawer = () => (
    <div
      className={`fixed inset-0 z-50 ${showFilterDrawer ? "block" : "hidden"}`}
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setShowFilterDrawer(false)}
      ></div>
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl animate-slideInRight">
        <div className="h-full flex flex-col">
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

          <div className="flex-1 overflow-y-auto p-6">
            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Kategori
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      selectedCategory === category.id
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon icon={category.icon} className="text-2xl" />
                    <span className="font-medium text-sm">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Bahan
              </h3>
              <div className="space-y-2">
                {materials.map((material) => (
                  <button
                    key={material.id}
                    onClick={() => handleMaterialSelect(material.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl transition-colors ${
                      selectedMaterial === material.id
                        ? "bg-emerald-50 text-emerald-700 border-2 border-emerald-200"
                        : "hover:bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <span className="font-medium">{material.name}</span>
                    {selectedMaterial === material.id && (
                      <Icon
                        icon="mdi:check-circle"
                        className="text-emerald-600 text-xl"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Urutkan
              </h3>
              <div className="space-y-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      setActiveSort(option.id);
                      setShowFilterDrawer(false);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors ${
                      activeSort === option.id
                        ? "bg-indigo-50 text-indigo-700 border-2 border-indigo-200"
                        : "hover:bg-gray-50 text-gray-700 border border-gray-200"
                    }`}
                  >
                    <Icon icon={option.icon} className="text-xl" />
                    <span className="font-medium">{option.label}</span>
                    {activeSort === option.id && (
                      <Icon
                        icon="mdi:check"
                        className="ml-auto text-indigo-600 text-xl"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

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
      {/* Modern Hero Banner dengan Gambar Baju */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-950 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Hero Content */}
        <div className="container mx-auto px-4 py-20 lg:py-24 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-white">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-2.5 rounded-full border border-white/20 mb-8">
                <Icon icon="mdi:tshirt-crew" className="text-xl" />
                <span className="font-medium">MN KONVEKSI</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-100">
                  Koleksi
                </span>
                <br />
                <span className="text-amber-300">Produk Premium</span>
              </h1>

              <p className="text-xl text-indigo-100 mb-10 leading-relaxed">
                Temukan berbagai produk konveksi berkualitas dengan bahan
                premium, desain eksklusif, dan harga terbaik. Karya terbaik
                untuk penampilan terbaik.
              </p>

              {/* Modern Search Bar */}
              <div className="max-w-xl">
                <div className="relative bg-white rounded-2xl shadow-2xl p-2">
                  <div className="flex items-center">
                    <div className="pl-4">
                      <Icon
                        icon="mdi:magnify"
                        className="text-gray-400 text-2xl"
                      />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari produk (Kemeja, Jaket, Celana, Seragam...)"
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
                <p className="text-indigo-200 text-sm mt-3 ml-2">
                  Tekan Enter untuk mencari atau gunakan filter
                </p>
              </div>

              {/* Quick Stats */}
              <div className="flex flex-wrap gap-8 mt-12">
                {[
                  { value: "100+", label: "Desain Eksklusif" },
                  { value: "50+", label: "Bahan Premium" },
                  { value: "24/7", label: "Support" },
                ].map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="text-3xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-indigo-200 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Content - Product Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                {heroImages.map((img, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl overflow-hidden shadow-2xl ${
                      index === 1 ? "row-span-2" : ""
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Produk Konveksi ${index + 1}`}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%231e1b4b'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%238b5cf6' text-anchor='middle' dominant-baseline='middle'%3EMN Konveksi%3C/text%3E%3C/svg%3E`;
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* Floating Badge */}
              <div className="absolute -bottom-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-xl shadow-xl">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:star" className="text-lg" />
                  <span className="font-bold">Produk Terbaik</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 100C120 80 240 40 360 30C480 20 600 40 720 50C840 60 960 60 1080 40C1200 20 1320 -20 1380 -40L1440 -60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 -mt-12 relative z-20">
        {/* Modern Filter Header */}
        <div className="mb-10 bg-white rounded-2xl shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  {selectedCategory === "all"
                    ? "Semua Produk"
                    : selectedCategory}
                </h2>
                <span className="px-4 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full font-semibold">
                  {filteredProducts.length} produk
                </span>
              </div>

              {/* Quick Category Chips */}
              <div className="flex flex-wrap gap-2">
                {categories.slice(0, 6).map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 ${
                      selectedCategory === category.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Icon icon={category.icon} />
                    {category.name}
                  </button>
                ))}
                {categories.length > 6 && (
                  <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="px-4 py-2.5 rounded-xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center gap-2"
                  >
                    <Icon icon="mdi:dots-horizontal" />
                    Lainnya
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Controls */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2">
                {popularMaterials.map((material) => (
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
                    {sortOptions.find((s) => s.id === activeSort)?.label}
                  </span>
                  <Icon
                    icon={showSortMenu ? "mdi:chevron-up" : "mdi:chevron-down"}
                    className="text-xl"
                  />
                </button>

                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 z-10 animate-fadeIn">
                    <div className="p-2">
                      {sortOptions.map((option) => (
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
                            <Icon
                              icon="mdi:check"
                              className="ml-auto text-indigo-600"
                            />
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
                className="md:hidden p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-lg"
              >
                <Icon icon="mdi:filter" className="text-2xl" />
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedCategory !== "all" ||
            selectedMaterial !== "all" ||
            searchQuery) && (
            <div className="mt-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:filter" className="text-indigo-600 text-xl" />
                  <span className="font-medium text-gray-700">
                    Filter Aktif:
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 flex-1">
                  {selectedCategory !== "all" && (
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-white text-indigo-700 rounded-lg border border-indigo-200 text-sm">
                      <Icon icon="mdi:tag" />
                      {selectedCategory}
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className="hover:text-indigo-900"
                      >
                        <Icon icon="mdi:close" size={16} />
                      </button>
                    </span>
                  )}
                  {selectedMaterial !== "all" && (
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-white text-emerald-700 rounded-lg border border-emerald-200 text-sm">
                      <Icon icon="mdi:square" />
                      {selectedMaterial}
                      <button
                        onClick={() => setSelectedMaterial("all")}
                        className="hover:text-emerald-900"
                      >
                        <Icon icon="mdi:close" size={16} />
                      </button>
                    </span>
                  )}
                  // Bagian yang terpotong dilanjutkan dari searchQuery filter
                  badge
                  {searchQuery && (
                    <span className="inline-flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg border border-gray-200 text-sm">
                      <Icon icon="mdi:magnify" />"{searchQuery}"
                      <button
                        onClick={() => setSearchQuery("")}
                        className="hover:text-gray-900"
                      >
                        <Icon icon="mdi:close" size={16} />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={resetFilters}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                  >
                    <Icon icon="mdi:refresh" />
                    Hapus Semua
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full mb-6">
              <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              Memuat Produk...
            </h3>
            <p className="text-gray-600">Mohon tunggu sebentar</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:alert-circle" className="text-red-500 text-3xl" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-2">
              Terjadi Kesalahan
            </h3>
            <p className="text-red-600 mb-6 max-w-md mx-auto">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 mx-auto"
            >
              <Icon icon="mdi:refresh" />
              Coba Lagi
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon
                icon="mdi:package-variant-remove"
                className="text-gray-400 text-4xl"
              />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Produk Tidak Ditemukan
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Coba ubah filter pencarian Anda atau cari produk lain
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetFilters}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Icon icon="mdi:refresh" />
                Reset Filter
              </button>
              <button
                onClick={() => setShowFilterDrawer(true)}
                className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Icon icon="mdi:filter" />
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
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <p className="text-gray-600 mb-4 md:mb-0">
                  Menampilkan{" "}
                  <span className="font-semibold text-indigo-600">
                    {filteredProducts.length}
                  </span>{" "}
                  dari{" "}
                  <span className="font-semibold text-indigo-600">
                    {products.length}
                  </span>{" "}
                  produk
                </p>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
                  >
                    <Icon icon="mdi:arrow-up" className="inline mr-2" />
                    Kembali ke Atas
                  </button>
                  <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                  >
                    <Icon icon="mdi:filter" className="inline mr-2" />
                    Filter Lainnya
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Modern CTA Section */}
        <div className="mt-20">
          <div className="relative bg-gradient-to-r from-gray-900 via-indigo-900 to-gray-900 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-white rounded-full translate-x-24 translate-y-24"></div>
            </div>

            <div className="relative p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-5 py-2 rounded-full mb-6">
                <Icon icon="mdi:palette" className="text-white text-xl" />
                <span className="text-white font-medium">Custom Design</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Butuh Produk <span className="text-amber-300">Custom?</span>
              </h2>
              <p className="text-xl text-indigo-100 mb-10 max-w-2xl mx-auto">
                Kami menerima pesanan custom dengan desain dan bahan sesuai
                kebutuhan Anda. Konsultasikan kebutuhan Anda dengan tim ahli
                kami.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const phoneNumber = "6281234567890";
                    const message =
                      "Halo MN Konveksi, saya ingin konsultasi tentang produk custom. Bisa dibantu?";
                    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                      message
                    )}`;
                    window.open(url, "_blank");
                  }}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg"
                >
                  <Icon icon="mdi:whatsapp" className="text-2xl" />
                  Konsultasi via WhatsApp
                </button>
                <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold rounded-xl hover:bg-white/20 transition-all duration-300">
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
