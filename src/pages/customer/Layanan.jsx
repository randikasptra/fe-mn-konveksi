import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { 
  getAllLayanan, 
  getCategories, 
  getAllMaterials, 
  filterLayanan,
  getStats,
  getTopMaterials
} from "../../services/customer/layananService";

const Layanan = () => {
  const [filters, setFilters] = useState({
    searchTerm: "",
    category: "all",
    material: "all",
    type: "all"
  });
  const [allLayanan, setAllLayanan] = useState([]);
  const [filteredLayanan, setFilteredLayanan] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [topMaterials, setTopMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [activeSort, setActiveSort] = useState("nama");

  const sortMenuRef = useRef(null);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

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

  // Filter data saat filter berubah
  useEffect(() => {
    if (allLayanan.length > 0) {
      let filtered = filterLayanan(allLayanan, filters);
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (activeSort) {
          case "nama-desc":
            return b.name.localeCompare(a.name);
          case "kategori":
            return a.category.localeCompare(b.category);
          case "type":
            return b.type.localeCompare(a.type);
          case "popular":
            return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
          case "nama":
          default:
            return a.name.localeCompare(b.name);
        }
      });
      
      setFilteredLayanan(filtered);
    }
  }, [filters, allLayanan, activeSort]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await getAllLayanan();
      setAllLayanan(data);
      setFilteredLayanan(data);
      
      const cat = getCategories(data);
      setCategories(cat);
      
      const mats = getAllMaterials(data);
      setMaterials(mats);
      
      const topMats = getTopMaterials(data, 8);
      setTopMaterials(topMats);
      
      const stat = getStats(data);
      setStats(stat);
      
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWhatsAppClick = (item) => {
    const phoneNumber = "6281234567890";
    const categoryName = categories.find(c => c.id === item.category)?.name || item.category;
    
    const message = `Halo MN Konveksi,\n\nSaya tertarik dengan produk:\n\n📌 *${item.name}*\n📋 Kategori: ${categoryName}\n💰 Harga: ${item.priceRange}\n📦 Minimal Order: ${item.minOrder}\n⏱️ Durasi: ${item.duration}\n${item.materials ? `🧵 Bahan: ${item.materials.slice(0, 3).join(', ')}${item.materials.length > 3 ? '...' : ''}` : ''}\n\nBisa info lebih lanjut?`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleImageError = (itemId) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      category: "all",
      material: "all",
      type: "all"
    });
    setActiveSort("nama");
    setImageErrors({});
  };

  const getCategoryName = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.name || categoryId;
  };

  const getCategoryIcon = (categoryId) => {
    return categories.find(c => c.id === categoryId)?.icon || "mdi:tag";
  };

  const handleMaterialClick = (material) => {
    updateFilter("material", material === filters.material ? "all" : material);
  };

  const handleCategoryClick = (categoryId) => {
    updateFilter("category", categoryId === filters.category ? "all" : categoryId);
  };

  const handleTypeClick = (type) => {
    updateFilter("type", type === filters.type ? "all" : type);
  };

  const sortOptions = [
    { id: "nama", label: "Nama A-Z", icon: "mdi:sort-alphabetical-ascending" },
    { id: "nama-desc", label: "Nama Z-A", icon: "mdi:sort-alphabetical-descending" },
    { id: "kategori", label: "Kategori", icon: "mdi:tag" },
    { id: "type", label: "Status", icon: "mdi:filter" },
    { id: "popular", label: "Populer", icon: "mdi:star" }
  ];

  // Render card item
  const renderProductCard = (item) => {
    const hasImageError = imageErrors[item.id];
    
    return (
      <div 
        key={item.id} 
        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200 group"
      >
        {/* Product Image */}
        <div className="relative h-56 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
          {hasImageError || !item.image ? (
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                item.type === 'dynamic' 
                  ? 'bg-gradient-to-br from-emerald-100 to-teal-100' 
                  : 'bg-gradient-to-br from-blue-100 to-cyan-100'
              }`}>
                <Icon 
                  icon={getCategoryIcon(item.category)} 
                  className={`text-3xl ${
                    item.type === 'dynamic' ? 'text-emerald-300' : 'text-blue-300'
                  }`}
                />
              </div>
              <span className="text-gray-400 text-sm text-center">
                {item.type === 'dynamic' ? 'Gambar tidak tersedia' : 'Produk referensi'}
              </span>
            </div>
          ) : (
            <>
              <img 
                src={item.image}
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={() => handleImageError(item.id)}
                loading="lazy"
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </>
          )}
          
          {/* Product Type Badge */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md backdrop-blur-sm ${
              item.type === "dynamic" 
                ? "bg-gradient-to-r from-emerald-600/90 to-teal-600/90 text-white" 
                : "bg-gradient-to-r from-blue-600/90 to-cyan-600/90 text-white"
            }`}>
              {item.type === "dynamic" ? "🟢 Tersedia" : "🔵 Referensi"}
            </div>
          </div>

          {/* Popular Badge */}
          {item.popular && (
            <div className="absolute top-4 right-4">
              <div className="px-3 py-1.5 bg-gradient-to-r from-amber-600/90 to-orange-600/90 text-white rounded-full text-xs font-semibold flex items-center gap-1 shadow-md backdrop-blur-sm">
                <Icon icon="mdi:star" className="text-xs" />
                Populer
              </div>
            </div>
          )}
        </div>

        {/* Product Content */}
        <div className="p-6">
          {/* Category */}
          <div className="mb-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium">
              <Icon icon={getCategoryIcon(item.category)} className="text-sm" />
              {getCategoryName(item.category)}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1">
            {item.name}
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-5 line-clamp-2">
            {item.description || "Produk konveksi berkualitas"}
          </p>

          {/* Materials */}
          {item.materials && item.materials.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-500 mb-2">Bahan Tersedia:</p>
              <div className="flex flex-wrap gap-2">
                {item.materials.slice(0, 2).map((material, idx) => (
                  <span 
                    key={idx} 
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-lg"
                  >
                    {material}
                  </span>
                ))}
                {item.materials.length > 2 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                    +{item.materials.length - 2}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Price and Order Info */}
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-500">Harga</p>
                <p className="text-xl font-bold text-indigo-600">
                  {item.priceRange}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-500">Min. Order</p>
                <p className="text-lg font-semibold text-gray-900">{item.minOrder}</p>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Icon icon="mdi:clock-fast" className="text-base" />
                <span>{item.duration}</span>
              </div>
              {item.type === "dynamic" && item.stock > 0 && (
                <div className="flex items-center gap-2 text-emerald-600 font-medium">
                  <Icon icon="mdi:package-variant" className="text-base" />
                  <span>Stok: {item.stock}</span>
                </div>
              )}
            </div>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={() => handleWhatsAppClick(item)}
            className="w-full px-4 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg"
          >
            <Icon icon="mdi:whatsapp" className="text-xl" />
            <span>Tanya via WhatsApp</span>
          </button>
        </div>
      </div>
    );
  };

  // Mobile Filter Drawer
  const renderFilterDrawer = () => (
    <div className={`fixed inset-0 z-50 ${showFilterDrawer ? 'block' : 'hidden'}`}>
      <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilterDrawer(false)}></div>
      <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-2xl animate-slideInRight">
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Filter</h2>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Icon icon="mdi:close" className="text-xl text-gray-600" />
            </button>
          </div>
          
          {/* Categories */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Kategori</h3>
            <div className="space-y-2">
              {categories.filter(c => c.id !== "all").map(category => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryClick(category.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    filters.category === category.id
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon icon={category.icon} className="text-lg" />
                    <span>{category.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">({category.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Bahan</h3>
            <div className="space-y-2">
              {topMaterials.map(material => (
                <button
                  key={material}
                  onClick={() => handleMaterialClick(material)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-colors ${
                    filters.material === material
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span>{material}</span>
                  <Icon 
                    icon={filters.material === material ? "mdi:check-circle" : "mdi:circle-outline"} 
                    className="text-lg"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Type */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Status</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleTypeClick("dynamic")}
                className={`p-4 rounded-xl transition-colors flex flex-col items-center gap-2 ${
                  filters.type === "dynamic"
                    ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Icon icon="mdi:check-circle" className="text-emerald-600 text-xl" />
                </div>
                <span className="text-sm font-medium">Tersedia</span>
              </button>
              <button
                onClick={() => handleTypeClick("static")}
                className={`p-4 rounded-xl transition-colors flex flex-col items-center gap-2 ${
                  filters.type === "static"
                    ? 'bg-blue-50 text-blue-700 border-2 border-blue-200'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon icon="mdi:information" className="text-blue-600 text-xl" />
                </div>
                <span className="text-sm font-medium">Referensi</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={resetFilters}
              className="w-full py-3.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
            >
              Reset Filter
            </button>
            <button
              onClick={() => setShowFilterDrawer(false)}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-colors"
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
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 border-2 border-white/30 rounded-full -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 border-2 border-white/20 rounded-full translate-x-48 translate-y-48"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full">
              <Icon icon="mdi:needle" className="text-white text-xl" />
              <span className="text-white/90 text-sm">MN KONVEKSI</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Katalog <span className="text-amber-300">Layanan</span>
            </h1>
            
            <p className="text-xl text-indigo-100 mb-10">
              {stats?.hasApiData 
                ? "Temukan produk berkualitas dari koleksi kami" 
                : "Lihat berbagai produk konveksi yang kami tawarkan"}
            </p>

            {/* Modern Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative bg-white rounded-2xl shadow-2xl p-1">
                <div className="flex items-center">
                  <div className="pl-4">
                    <Icon icon="mdi:magnify" className="text-gray-400 text-xl" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari produk (contoh: Rompi, Jas, Seragam...)"
                    value={filters.searchTerm}
                    onChange={(e) => updateFilter("searchTerm", e.target.value)}
                    className="w-full px-4 py-4 focus:outline-none text-gray-700 placeholder-gray-400"
                  />
                  <button
                    onClick={() => setShowFilterDrawer(true)}
                    className="md:hidden px-4 py-2 text-gray-600 hover:text-indigo-600"
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
        {/* Modern Header with Stats and Controls */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">
                  {filters.category === "all" ? "Semua Produk" : getCategoryName(filters.category)}
                </h2>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                  {filteredLayanan.length} produk
                </span>
              </div>
              
              {/* Quick Status Filters */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTypeClick("all")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    filters.type === "all"
                      ? "bg-indigo-100 text-indigo-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => handleTypeClick("dynamic")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                    filters.type === "dynamic"
                      ? "bg-emerald-100 text-emerald-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  Tersedia
                </button>
                <button
                  onClick={() => handleTypeClick("static")}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors flex items-center gap-1.5 ${
                    filters.type === "static"
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Referensi
                </button>
              </div>
            </div>

            {/* Desktop Filter Controls */}
            <div className="flex items-center gap-3">
              {/* Category Chips (Desktop) */}
              <div className="hidden md:flex items-center gap-2">
                {categories.filter(c => c.id !== "all").slice(0, 5).map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                      filters.category === category.id
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    <Icon icon={category.icon} className="text-sm" />
                    {category.name}
                  </button>
                ))}
              </div>

              {/* Sort Menu */}
              <div className="relative" ref={sortMenuRef}>
                <button
                  onClick={() => setShowSortMenu(!showSortMenu)}
                  className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700 font-medium"
                >
                  <Icon icon="mdi:sort" className="text-lg" />
                  <span className="hidden md:inline">
                    {sortOptions.find(s => s.id === activeSort)?.label || "Urutkan"}
                  </span>
                  <Icon 
                    icon={showSortMenu ? "mdi:chevron-up" : "mdi:chevron-down"} 
                    className="text-lg"
                  />
                </button>
                
                {showSortMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-10 animate-fadeIn">
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
                className="md:hidden p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50"
              >
                <Icon icon="mdi:filter" className="text-xl text-gray-700" />
              </button>
            </div>
          </div>

          {/* Material Chips */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <p className="text-sm font-medium text-gray-700">Bahan Populer:</p>
              <button
                onClick={() => handleMaterialClick("all")}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  filters.material === "all"
                    ? "bg-indigo-100 text-indigo-700 font-medium"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Semua Bahan
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {topMaterials.map(material => (
                <button
                  key={material}
                  onClick={() => handleMaterialClick(material)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    filters.material === material
                      ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {material}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(filters.category !== "all" || filters.material !== "all" || filters.type !== "all" || filters.searchTerm) && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 mb-6">
              <Icon icon="mdi:filter" className="text-indigo-600" />
              <div className="flex flex-wrap gap-2">
                {filters.category !== "all" && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-700 rounded-lg border border-indigo-200 text-sm">
                    {getCategoryName(filters.category)}
                    <button
                      onClick={() => updateFilter("category", "all")}
                      className="hover:text-indigo-900"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                  </span>
                )}

                {filters.material !== "all" && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-700 rounded-lg border border-emerald-200 text-sm">
                    Bahan: {filters.material}
                    <button
                      onClick={() => updateFilter("material", "all")}
                      className="hover:text-emerald-900"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                  </span>
                )}

                {filters.type !== "all" && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-blue-700 rounded-lg border border-blue-200 text-sm">
                    {filters.type === "dynamic" ? "Hanya Tersedia" : "Hanya Referensi"}
                    <button
                      onClick={() => updateFilter("type", "all")}
                      className="hover:text-blue-900"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                  </span>
                )}

                {filters.searchTerm && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white text-gray-700 rounded-lg border border-gray-200 text-sm">
                    Pencarian: "{filters.searchTerm}"
                    <button
                      onClick={() => updateFilter("searchTerm", "")}
                      className="hover:text-gray-900"
                    >
                      <Icon icon="mdi:close" className="text-sm" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600 mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-700">Memuat produk...</h3>
          </div>
        ) : filteredLayanan.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:package-variant-remove" className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Produk tidak ditemukan</h3>
            <p className="text-gray-600 mb-6">Coba filter atau kata kunci lain</p>
            <button
              onClick={resetFilters}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Tampilkan Semua Produk
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLayanan.map(renderProductCard)}
            </div>

            {/* Results Info */}
            <div className="mt-12 pt-8 border-t border-gray-200 text-center">
              <p className="text-gray-600">
                Menampilkan <span className="font-semibold">{filteredLayanan.length}</span> dari{" "}
                <span className="font-semibold">{allLayanan.length}</span> produk
              </p>
            </div>
          </>
        )}

        {/* CTA Section */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center overflow-hidden relative">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-48 translate-y-48"></div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-4">Butuh produk custom?</h2>
              <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
                Kami menerima pesanan custom dengan bahan dan desain sesuai kebutuhan Anda.
              </p>
              <button
                onClick={() => {
                  const phoneNumber = "6281234567890";
                  const message = "Halo MN Konveksi, saya ingin konsultasi tentang produk custom. Bisa dibantu?";
                  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                  window.open(url, "_blank");
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl"
              >
                <Icon icon="mdi:whatsapp" className="text-2xl" />
                <span>Konsultasi via WhatsApp</span>
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Icon icon="mdi:check-circle" className="text-emerald-600 text-xl" />
                </div>
                <h3 className="font-bold text-gray-900">🟢 Tersedia</h3>
              </div>
              <p className="text-gray-600">
                Produk dari database kami, informasi lengkap tersedia untuk pemesanan langsung.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon icon="mdi:information" className="text-blue-600 text-xl" />
                </div>
                <h3 className="font-bold text-gray-900">🔵 Referensi</h3>
              </div>
              <p className="text-gray-600">
                Contoh produk yang bisa kami buat, hubungi kami untuk konsultasi dan penawaran.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Icon icon="mdi:star" className="text-amber-600 text-xl" />
                </div>
                <h3 className="font-bold text-gray-900">⭐ Populer</h3>
              </div>
              <p className="text-gray-600">
                Produk favorit pelanggan kami dengan kualitas terjamin dan kepuasan tinggi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {renderFilterDrawer()}

      {/* Add custom animation styles */}
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
          animation: slideInRight 0.3s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Layanan;