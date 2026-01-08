// src/pages/customer/Layanan.jsx
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const Layanan = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Cek status login
  useEffect(() => {
    const token = localStorage.getItem("mn_token");
    const userRaw = localStorage.getItem("mn_user");
    setIsLoggedIn(!!token && !!userRaw);
  }, []);

  // Data semua layanan
  const allLayanan = [
    // Kategori: Pakaian
    {
      id: 1,
      name: "Rompi",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Rompi berbagai model untuk seragam kerja, event, atau fashion.",
      priceRange: "Rp 150.000 - 500.000",
      minOrder: "10 pcs",
      duration: "3-7 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Taslan", "Taslan Oxford", "Drill", "Kanvas"],
      popular: true
    },
    {
      id: 2,
      name: "Jas",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Jas formal dan semi-formal untuk acara resmi atau seragam kerja.",
      priceRange: "Rp 500.000 - 2.000.000",
      minOrder: "5 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1974",
      materials: ["Wol", "Polyester", "Tweed"],
      popular: true
    },
    {
      id: 3,
      name: "Jaket",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Jaket bomber, hoodie, windbreaker, dan model lainnya.",
      priceRange: "Rp 200.000 - 800.000",
      minOrder: "12 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1970",
      materials: ["Taslan", "Parasut", "Fleece", "Denim"],
      popular: true
    },
    {
      id: 4,
      name: "Kaos Pendek/Panjang",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Kaos lengan pendek dan panjang untuk berbagai keperluan.",
      priceRange: "Rp 50.000 - 150.000",
      minOrder: "24 pcs",
      duration: "3-5 hari",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1974",
      materials: ["Cotton Combed", "Cotton Cardet", "Polyester"],
      popular: true
    },
    {
      id: 5,
      name: "Kaos Polo",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Kaos polo untuk seragam kerja atau kegiatan sehari-hari.",
      priceRange: "Rp 80.000 - 200.000",
      minOrder: "20 pcs",
      duration: "4-7 hari",
      image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=1974",
      materials: ["Pique", "Cotton", "Polyester"],
      popular: true
    },
    {
      id: 6,
      name: "Rok",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Rok berbagai model dan panjang untuk seragam atau fashion.",
      priceRange: "Rp 100.000 - 350.000",
      minOrder: "15 pcs",
      duration: "5-8 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Drill", "Wol", "Polyester"],
      popular: false
    },
    {
      id: 7,
      name: "Dasi",
      category: "pakaian",
      icon: "mdi:tshirt-crew",
      description: "Dasi berbagai warna dan motif untuk seragam formal.",
      priceRange: "Rp 25.000 - 75.000",
      minOrder: "50 pcs",
      duration: "2-4 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Sutra", "Polyester", "Satin"],
      popular: false
    },

    // Kategori: Seragam
    {
      id: 8,
      name: "Baju PDL/PDH",
      category: "seragam",
      icon: "mdi:hospital-box",
      description: "Seragam dinas lapangan dan harian untuk instansi.",
      priceRange: "Rp 250.000 - 750.000",
      minOrder: "20 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1613243555978-636c48dc653c?q=80&w=1970",
      materials: ["Drill", "Twill", "Katun"],
      popular: true
    },
    {
      id: 9,
      name: "Seragam",
      category: "seragam",
      icon: "mdi:hospital-box",
      description: "Seragam kantor, sekolah, atau instansi dengan custom design.",
      priceRange: "Rp 300.000 - 900.000",
      minOrder: "25 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=1974",
      materials: ["Bervariasi sesuai kebutuhan"],
      popular: true
    },
    {
      id: 10,
      name: "Baju Kitchen",
      category: "seragam",
      icon: "mdi:chef-hat",
      description: "Seragam dapur untuk restoran, hotel, dan catering.",
      priceRange: "Rp 150.000 - 400.000",
      minOrder: "15 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1970",
      materials: ["Katun Chef", "Polyester Tahan Panas"],
      popular: false
    },
    {
      id: 11,
      name: "Afron",
      category: "seragam",
      icon: "mdi:tshirt-crew",
      description: "Celemek/apron untuk berbagai keperluan.",
      priceRange: "Rp 75.000 - 200.000",
      minOrder: "20 pcs",
      duration: "4-7 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Kanvas", "Drill", "Parasut"],
      popular: false
    },
    {
      id: 12,
      name: "Rompi Teknik",
      category: "seragam",
      icon: "mdi:toolbox",
      description: "Rompi safety untuk pekerja teknik dan lapangan.",
      priceRange: "Rp 200.000 - 500.000",
      minOrder: "15 pcs",
      duration: "5-9 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Taslan Oxford", "Drill", "Kanvas"],
      popular: false
    },

    // Kategori: Medis
    {
      id: 13,
      name: "Jas Operasi",
      category: "medis",
      icon: "mdi:medical-bag",
      description: "Jas operasi untuk tenaga medis di rumah sakit.",
      priceRange: "Rp 150.000 - 400.000",
      minOrder: "25 pcs",
      duration: "7-12 hari",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1974",
      materials: ["Non-Woven", "Katun Medis"],
      popular: true
    },
    {
      id: 14,
      name: "Seragam Dokter (Stell)",
      category: "medis",
      icon: "mdi:doctor",
      description: "Seragam dokter dengan standar rumah sakit.",
      priceRange: "Rp 300.000 - 700.000",
      minOrder: "20 pcs",
      duration: "8-14 hari",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1970",
      materials: ["Katun Stell", "Polyester Medis"],
      popular: true
    },
    {
      id: 15,
      name: "Seragam Perawat (Stell)",
      category: "medis",
      icon: "mdi:nurse",
      description: "Seragam perawat untuk rumah sakit dan klinik.",
      priceRange: "Rp 250.000 - 600.000",
      minOrder: "25 pcs",
      duration: "8-14 hari",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1974",
      materials: ["Katun Stell", "Polyester Medis"],
      popular: true
    },
    {
      id: 16,
      name: "Gaun Pasien",
      category: "medis",
      icon: "mdi:hospital",
      description: "Gaun pasien untuk rumah sakit dan klinik.",
      priceRange: "Rp 80.000 - 180.000",
      minOrder: "30 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1584467735871-8db9ac8d0916?q=80&w=1974",
      materials: ["Katun Medis", "Polyester"],
      popular: false
    },
    {
      id: 17,
      name: "Baju Pasien",
      category: "medis",
      icon: "mdi:hospital",
      description: "Baju pasien nyaman untuk perawatan medis.",
      priceRange: "Rp 70.000 - 160.000",
      minOrder: "30 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Katun Medis", "Polyester"],
      popular: false
    },
    {
      id: 18,
      name: "Jas OK Panjang",
      category: "medis",
      icon: "mdi:medical-bag",
      description: "Jas operasi panjang untuk prosedur khusus.",
      priceRange: "Rp 200.000 - 500.000",
      minOrder: "20 pcs",
      duration: "8-12 hari",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1970",
      materials: ["Non-Woven", "Katun Medis"],
      popular: false
    },

    // Kategori: Linen
    {
      id: 19,
      name: "Duk Atas",
      category: "linen",
      icon: "mdi:bed",
      description: "Seprei atas untuk kebutuhan rumah sakit dan hotel.",
      priceRange: "Rp 100.000 - 300.000",
      minOrder: "50 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1970",
      materials: ["Katun", "Polycotton", "Microfiber"],
      popular: true
    },
    {
      id: 20,
      name: "Duk Bawah",
      category: "linen",
      icon: "mdi:bed",
      description: "Seprei bawah dengan berbagai ukuran.",
      priceRange: "Rp 120.000 - 350.000",
      minOrder: "50 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1970",
      materials: ["Katun", "Polycotton", "Microfiber"],
      popular: true
    },
    {
      id: 21,
      name: "Seprei + Sarung Bantal + Guling",
      category: "linen",
      icon: "mdi:bed",
      description: "Paket lengkap sprei dengan sarung bantal dan guling.",
      priceRange: "Rp 300.000 - 800.000",
      minOrder: "25 set",
      duration: "12-18 hari",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=1974",
      materials: ["Katun", "Polycotton", "Satin"],
      popular: true
    },
    {
      id: 22,
      name: "Duk Bolong",
      category: "linen",
      icon: "mdi:bed",
      description: "Duk dengan lubang untuk kebutuhan medis tertentu.",
      priceRange: "Rp 150.000 - 400.000",
      minOrder: "40 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Katun Medis", "Polyester"],
      popular: false
    },
    {
      id: 23,
      name: "Sarung Mayat",
      category: "linen",
      icon: "mdi:bed",
      description: "Kain khusus untuk keperluan pemakaman.",
      priceRange: "Rp 200.000 - 500.000",
      minOrder: "10 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Kain Kafan", "Katun Khusus"],
      popular: false
    },
    {
      id: 24,
      name: "Sarung Mayo",
      category: "linen",
      icon: "mdi:bed",
      description: "Sarung untuk operasi dan prosedur medis.",
      priceRange: "Rp 80.000 - 200.000",
      minOrder: "50 pcs",
      duration: "7-12 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Non-Woven", "Katun Medis"],
      popular: false
    },
    {
      id: 25,
      name: "Tutup Keranda",
      category: "linen",
      icon: "mdi:bed",
      description: "Penutup keranda dengan berbagai bahan.",
      priceRange: "Rp 250.000 - 600.000",
      minOrder: "5 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Sutra", "Satin", "Velvet"],
      popular: false
    },

    // Kategori: Khusus
    {
      id: 26,
      name: "Drapping",
      category: "khusus",
      icon: "mdi:ruler",
      description: "Layanan drapping untuk fashion show dan presentasi.",
      priceRange: "Rp 500.000 - 2.000.000",
      minOrder: "1 project",
      duration: "3-10 hari",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1974",
      materials: ["Bervariasi sesuai desain"],
      popular: false
    },
    {
      id: 27,
      name: "Alas Trolly",
      category: "khusus",
      icon: "mdi:cart",
      description: "Alas trolly untuk rumah sakit dan industri.",
      priceRange: "Rp 300.000 - 700.000",
      minOrder: "10 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Kanvas", "Parasut", "Vinyl"],
      popular: false
    },
    {
      id: 28,
      name: "Syall Pramuka",
      category: "khusus",
      icon: "mdi:scarf",
      description: "Syall/setangan leher untuk pramuka.",
      priceRange: "Rp 40.000 - 100.000",
      minOrder: "100 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Sutra", "Polyester", "Katun"],
      popular: false
    },
    {
      id: 29,
      name: "Jasket",
      category: "khusus",
      icon: "mdi:tshirt-crew",
      description: "Jasket untuk berbagai keperluan khusus.",
      priceRange: "Rp 250.000 - 600.000",
      minOrder: "15 pcs",
      duration: "6-12 hari",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1970",
      materials: ["Taslan", "Drill", "Kanvas"],
      popular: false
    },
  ];

  // Kategori untuk filter
  const categories = [
    { id: "all", name: "Semua Layanan", icon: "mdi:view-grid", count: allLayanan.length },
    { id: "pakaian", name: "Pakaian", icon: "mdi:tshirt-crew", count: allLayanan.filter(l => l.category === "pakaian").length },
    { id: "seragam", name: "Seragam", icon: "mdi:hospital-box", count: allLayanan.filter(l => l.category === "seragam").length },
    { id: "medis", name: "Medis", icon: "mdi:medical-bag", count: allLayanan.filter(l => l.category === "medis").length },
    { id: "linen", name: "Linen", icon: "mdi:bed", count: allLayanan.filter(l => l.category === "linen").length },
    { id: "khusus", name: "Khusus", icon: "mdi:star", count: allLayanan.filter(l => l.category === "khusus").length },
  ];

  // Filter layanan berdasarkan search dan kategori
  const filteredLayanan = allLayanan.filter(layanan => {
    const matchesSearch = layanan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         layanan.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || layanan.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle WhatsApp click
  const handleWhatsAppClick = (layanan) => {
    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp
    const message = `Halo, saya tertarik dengan layanan:\n\n📌 *${layanan.name}*\n📋 Kategori: ${categories.find(c => c.id === layanan.category)?.name}\n💰 Rentang Harga: ${layanan.priceRange}\n📦 Minimal Order: ${layanan.minOrder}\n⏱️ Durasi: ${layanan.duration}\n\nBisa info detail lebih lanjut?`;
    
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Handle order click
  const handleOrderClick = (layanan) => {
    if (!isLoggedIn) {
      navigate("/login", { 
        state: { 
          from: { 
            pathname: "/layanan",
            search: `?layanan=${layanan.name}`
          } 
        } 
      });
      return;
    }
    // Logic untuk user yang sudah login
    console.log("Order layanan:", layanan);
    // Bisa navigate ke halaman pemesanan atau buka modal
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-indigo-900 via-purple-800 to-indigo-900 py-20 overflow-hidden">
        {/* Background Pattern */}
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
              Layanan <span className="text-amber-300">Konveksi</span> Terlengkap
            </h1>
            
            <p className="text-xl text-indigo-100 mb-10">
              Dari seragam medis hingga pakaian khusus, kami menyediakan solusi konveksi berkualitas tinggi
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Icon icon="mdi:magnify" className="text-gray-400 text-xl" />
                </div>
                <input
                  type="text"
                  placeholder="Cari layanan (contoh: Jas, Seragam, Linen...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white rounded-2xl shadow-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <div className="flex flex-wrap gap-3 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`
                  px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-300
                  ${selectedCategory === category.id 
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }
                `}
              >
                <Icon icon={category.icon} className="text-lg" />
                <span className="font-medium">{category.name}</span>
                <span className={`
                  px-2 py-0.5 text-xs rounded-full
                  ${selectedCategory === category.id 
                    ? "bg-white/20" 
                    : "bg-gray-100 text-gray-600"
                  }
                `}>
                  {category.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {selectedCategory === "all" ? "Semua Layanan" : 
               categories.find(c => c.id === selectedCategory)?.name}
            </h2>
            <p className="text-gray-600">
              Menampilkan {filteredLayanan.length} dari {allLayanan.length} layanan
            </p>
          </div>
          {!isLoggedIn && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800">
                <button 
                  onClick={() => navigate("/login")}
                  className="font-semibold hover:underline"
                >
                  Login
                </button>{" "}
                untuk mendapatkan penawaran khusus
              </p>
            </div>
          )}
        </div>

        {/* Layanan Grid */}
        {filteredLayanan.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icon icon="mdi:package-variant-closed" className="text-gray-400 text-4xl" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Layanan tidak ditemukan</h3>
            <p className="text-gray-600 mb-6">Coba kata kunci lain atau pilih kategori berbeda</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Tampilkan Semua Layanan
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredLayanan.map((layanan) => (
              <div 
                key={layanan.id} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-200 hover:border-indigo-200 group"
              >
                {/* Image */}
                <div className="relative h-56 overflow-hidden">
                  <img 
                    src={layanan.image} 
                    alt={layanan.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
                      {categories.find(c => c.id === layanan.category)?.name}
                    </span>
                  </div>
                  
                  {/* Popular Badge */}
                  {layanan.popular && (
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                        <Icon icon="mdi:star" className="text-xs" />
                        Populer
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{layanan.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Icon icon={layanan.icon} />
                        <span>{categories.find(c => c.id === layanan.category)?.name}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-indigo-600">{layanan.priceRange}</div>
                      <div className="text-xs text-gray-500">per pcs</div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-6 line-clamp-2">{layanan.description}</p>

                  {/* Materials */}
                  {layanan.materials && (
                    <div className="mb-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">Bahan Tersedia:</p>
                      <div className="flex flex-wrap gap-2">
                        {layanan.materials.slice(0, 3).map((material, idx) => (
                          <span 
                            key={idx} 
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {material}
                          </span>
                        ))}
                        {layanan.materials.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{layanan.materials.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Info Box */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:package-variant" className="text-indigo-500" />
                        <span className="text-sm font-medium text-gray-700">Minimal Order</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{layanan.minOrder}</p>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon icon="mdi:clock-fast" className="text-emerald-500" />
                        <span className="text-sm font-medium text-gray-700">Durasi</span>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{layanan.duration}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleOrderClick(layanan)}
                      className={`
                        flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                        flex items-center justify-center gap-2
                        ${isLoggedIn
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg"
                          : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900"
                        }
                      `}
                    >
                      {isLoggedIn ? (
                        <>
                          <Icon icon="mdi:shopping" />
                          Pesan Layanan
                        </>
                      ) : (
                        <>
                          <Icon icon="mdi:lock" />
                          Login untuk Pesan
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleWhatsAppClick(layanan)}
                      className="
                        px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                        bg-gradient-to-r from-emerald-500 to-teal-500 text-white
                        hover:from-emerald-600 hover:to-teal-600 hover:shadow-lg
                        flex items-center justify-center gap-2
                      "
                    >
                      <Icon icon="mdi:whatsapp" />
                      Tanya
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-20">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Butuh Layanan Khusus?</h2>
            <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
              Kami menerima custom order untuk kebutuhan khusus Anda. Konsultasikan kebutuhan Anda dengan tim kami.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleWhatsAppClick({ name: "Layanan Kustom", category: "khusus" })}
                className="px-8 py-4 bg-white text-indigo-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="mdi:whatsapp" className="text-xl" />
                Konsultasi via WhatsApp
              </button>
              <button
                onClick={() => navigate("/kontak")}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors"
              >
                Lihat Kontak Lainnya
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layanan;