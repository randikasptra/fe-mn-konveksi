import { produkService } from '../api';

// Helper untuk resolve image URL
const resolveImage = (imageData, fallbackImage) => {
  if (!imageData) return fallbackImage;
  
  // Jika sudah URL lengkap
  if (typeof imageData === 'string') {
    if (imageData.startsWith('http')) return imageData;
    if (imageData.startsWith('data:image')) return imageData;
    if (imageData.startsWith('/')) {
      // Relative path, tambahkan base URL jika diperlukan
      return `https://be-mn-konveksi.vercel.app${imageData}`;
    }
    // Jika hanya nama file
    return `https://be-mn-konveksi.vercel.app/uploads/${imageData}`;
  }
  
  // Jika array of images (multiple)
  if (Array.isArray(imageData)) {
    const firstImage = imageData[0];
    return resolveImage(firstImage, fallbackImage);
  }
  
  // Jika object dengan properti tertentu
  if (typeof imageData === 'object') {
    if (imageData.url) return resolveImage(imageData.url, fallbackImage);
    if (imageData.gambar) return resolveImage(imageData.gambar, fallbackImage);
    if (imageData.foto) return resolveImage(imageData.foto, fallbackImage);
  }
  
  return fallbackImage;
};

// Data statis untuk informasi umum
export const getStaticLayanan = () => {
  const staticProducts = [
    // Kategori: Pakaian
    {
      id: "static-1",
      name: "Rompi",
      category: "pakaian",
      description: "Rompi berbagai model untuk seragam kerja, event, atau fashion.",
      priceRange: "Rp 150.000 - 500.000",
      minOrder: "10 pcs",
      duration: "3-7 hari",
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
      materials: ["Taslan", "Taslan Oxford", "Drill", "Kanvas"],
      popular: true,
      type: "static"
    },
    {
      id: "static-2",
      name: "Jas",
      category: "pakaian",
      description: "Jas formal dan semi-formal untuk acara resmi atau seragam kerja.",
      priceRange: "Rp 500.000 - 2.000.000",
      minOrder: "5 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1974",
      materials: ["Wol", "Polyester", "Tweed"],
      popular: true,
      type: "static"
    },
    {
      id: "static-3",
      name: "Jaket",
      category: "pakaian",
      description: "Jaket bomber, hoodie, windbreaker, dan model lainnya.",
      priceRange: "Rp 200.000 - 800.000",
      minOrder: "12 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1970",
      materials: ["Taslan", "Parasut", "Fleece", "Denim"],
      popular: true,
      type: "static"
    },
    {
      id: "static-4",
      name: "Kaos Pendek/Panjang",
      category: "pakaian",
      description: "Kaos lengan pendek dan panjang untuk berbagai keperluan.",
      priceRange: "Rp 50.000 - 150.000",
      minOrder: "24 pcs",
      duration: "3-5 hari",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1974",
      materials: ["Cotton Combed", "Cotton Cardet", "Polyester"],
      popular: true,
      type: "static"
    },
    {
      id: "static-5",
      name: "Kaos Polo",
      category: "pakaian",
      description: "Kaos polo untuk seragam kerja atau kegiatan sehari-hari.",
      priceRange: "Rp 80.000 - 200.000",
      minOrder: "20 pcs",
      duration: "4-7 hari",
      image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=1974",
      materials: ["Pique", "Cotton", "Polyester"],
      popular: true,
      type: "static"
    },
    {
      id: "static-6",
      name: "Rok",
      category: "pakaian",
      description: "Rok berbagai model dan panjang untuk seragam atau fashion.",
      priceRange: "Rp 100.000 - 350.000",
      minOrder: "15 pcs",
      duration: "5-8 hari",
      image: "https://images.unsplash.com/photo-1581092160607-ee22731c5c6d?q=80&w=1970",
      materials: ["Drill", "Wol", "Polyester"],
      popular: false,
      type: "static"
    },
    {
      id: "static-7",
      name: "Dasi",
      category: "pakaian",
      description: "Dasi berbagai warna dan motif untuk seragam formal.",
      priceRange: "Rp 25.000 - 75.000",
      minOrder: "50 pcs",
      duration: "2-4 hari",
      image: "https://images.unsplash.com/photo-1582550945152-4f7d0b3ada8d?q=80&w=1974",
      materials: ["Sutra", "Polyester", "Satin"],
      popular: false,
      type: "static"
    },

    // Kategori: Seragam
    {
      id: "static-8",
      name: "Baju PDL/PDH",
      category: "seragam",
      description: "Seragam dinas lapangan dan harian untuk instansi.",
      priceRange: "Rp 250.000 - 750.000",
      minOrder: "20 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1613243555978-636c48dc653c?q=80&w=1970",
      materials: ["Drill", "Twill", "Katun"],
      popular: true,
      type: "static"
    },
    {
      id: "static-9",
      name: "Seragam Kantor",
      category: "seragam",
      description: "Seragam kantor, sekolah, atau instansi dengan custom design.",
      priceRange: "Rp 300.000 - 900.000",
      minOrder: "25 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=1974",
      materials: ["Bervariasi sesuai kebutuhan"],
      popular: true,
      type: "static"
    },
    {
      id: "static-10",
      name: "Baju Kitchen",
      category: "seragam",
      description: "Seragam dapur untuk restoran, hotel, dan catering.",
      priceRange: "Rp 150.000 - 400.000",
      minOrder: "15 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1970",
      materials: ["Katun Chef", "Polyester Tahan Panas"],
      popular: false,
      type: "static"
    },
    {
      id: "static-11",
      name: "Afron",
      category: "seragam",
      description: "Celemek/apron untuk berbagai keperluan.",
      priceRange: "Rp 75.000 - 200.000",
      minOrder: "20 pcs",
      duration: "4-7 hari",
      image: "https://images.unsplash.com/photo-1581092335873-688c7c6e1c9f?q=80&w=1970",
      materials: ["Kanvas", "Drill", "Parasut"],
      popular: false,
      type: "static"
    },
    {
      id: "static-12",
      name: "Rompi Teknik",
      category: "seragam",
      description: "Rompi safety untuk pekerja teknik dan lapangan.",
      priceRange: "Rp 200.000 - 500.000",
      minOrder: "15 pcs",
      duration: "5-9 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Taslan Oxford", "Drill", "Kanvas"],
      popular: false,
      type: "static"
    },

    // Kategori: Medis
    {
      id: "static-13",
      name: "Jas Operasi",
      category: "medis",
      description: "Jas operasi untuk tenaga medis di rumah sakit.",
      priceRange: "Rp 150.000 - 400.000",
      minOrder: "25 pcs",
      duration: "7-12 hari",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?q=80&w=1974",
      materials: ["Non-Woven", "Katun Medis"],
      popular: true,
      type: "static"
    },
    {
      id: "static-14",
      name: "Seragam Dokter (Stell)",
      category: "medis",
      description: "Seragam dokter dengan standar rumah sakit.",
      priceRange: "Rp 300.000 - 700.000",
      minOrder: "20 pcs",
      duration: "8-14 hari",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=1970",
      materials: ["Katun Stell", "Polyester Medis"],
      popular: true,
      type: "static"
    },
    {
      id: "static-15",
      name: "Seragam Perawat (Stell)",
      category: "medis",
      description: "Seragam perawat untuk rumah sakit dan klinik.",
      priceRange: "Rp 250.000 - 600.000",
      minOrder: "25 pcs",
      duration: "8-14 hari",
      image: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?q=80&w=1974",
      materials: ["Katun Stell", "Polyester Medis"],
      popular: true,
      type: "static"
    },
    {
      id: "static-16",
      name: "Gaun Pasien",
      category: "medis",
      description: "Gaun pasien untuk rumah sakit dan klinik.",
      priceRange: "Rp 80.000 - 180.000",
      minOrder: "30 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1584467735871-8db9ac8d0916?q=80&w=1974",
      materials: ["Katun Medis", "Polyester"],
      popular: false,
      type: "static"
    },
    {
      id: "static-17",
      name: "Baju Pasien",
      category: "medis",
      description: "Baju pasien nyaman untuk perawatan medis.",
      priceRange: "Rp 70.000 - 160.000",
      minOrder: "30 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Katun Medis", "Polyester"],
      popular: false,
      type: "static"
    },
    {
      id: "static-18",
      name: "Jas OK Panjang",
      category: "medis",
      description: "Jas operasi panjang untuk prosedur khusus.",
      priceRange: "Rp 200.000 - 500.000",
      minOrder: "20 pcs",
      duration: "8-12 hari",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1970",
      materials: ["Non-Woven", "Katun Medis"],
      popular: false,
      type: "static"
    },

    // Kategori: Linen
    {
      id: "static-19",
      name: "Duk Atas",
      category: "linen",
      description: "Seprei atas untuk kebutuhan rumah sakit dan hotel.",
      priceRange: "Rp 100.000 - 300.000",
      minOrder: "50 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1970",
      materials: ["Katun", "Polycotton", "Microfiber"],
      popular: true,
      type: "static"
    },
    {
      id: "static-20",
      name: "Duk Bawah",
      category: "linen",
      description: "Seprei bawah dengan berbagai ukuran.",
      priceRange: "Rp 120.000 - 350.000",
      minOrder: "50 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1970",
      materials: ["Katun", "Polycotton", "Microfiber"],
      popular: true,
      type: "static"
    },
    {
      id: "static-21",
      name: "Seprei + Sarung Bantal + Guling",
      category: "linen",
      description: "Paket lengkap sprei dengan sarung bantal dan guling.",
      priceRange: "Rp 300.000 - 800.000",
      minOrder: "25 set",
      duration: "12-18 hari",
      image: "https://images.unsplash.com/photo-1586105251261-72a756497a11?q=80&w=1974",
      materials: ["Katun", "Polycotton", "Satin"],
      popular: true,
      type: "static"
    },
    {
      id: "static-22",
      name: "Duk Bolong",
      category: "linen",
      description: "Duk dengan lubang untuk kebutuhan medis tertentu.",
      priceRange: "Rp 150.000 - 400.000",
      minOrder: "40 pcs",
      duration: "10-15 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Katun Medis", "Polyester"],
      popular: false,
      type: "static"
    },
    {
      id: "static-23",
      name: "Sarung Mayat",
      category: "linen",
      description: "Kain khusus untuk keperluan pemakaman.",
      priceRange: "Rp 200.000 - 500.000",
      minOrder: "10 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1582550945152-4f7d0b3ada8d?q=80&w=1974",
      materials: ["Kain Kafan", "Katun Khusus"],
      popular: false,
      type: "static"
    },
    {
      id: "static-24",
      name: "Sarung Mayo",
      category: "linen",
      description: "Sarung untuk operasi dan prosedur medis.",
      priceRange: "Rp 80.000 - 200.000",
      minOrder: "50 pcs",
      duration: "7-12 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Non-Woven", "Katun Medis"],
      popular: false,
      type: "static"
    },
    {
      id: "static-25",
      name: "Tutup Keranda",
      category: "linen",
      description: "Penutup keranda dengan berbagai bahan.",
      priceRange: "Rp 250.000 - 600.000",
      minOrder: "5 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1582550945152-4f7d0b3ada8d?q=80&w=1974",
      materials: ["Sutra", "Satin", "Velvet"],
      popular: false,
      type: "static"
    },

    // Kategori: Khusus
    {
      id: "static-26",
      name: "Drapping",
      category: "khusus",
      description: "Layanan drapping untuk fashion show dan presentasi.",
      priceRange: "Rp 500.000 - 2.000.000",
      minOrder: "1 project",
      duration: "3-10 hari",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1974",
      materials: ["Bervariasi sesuai desain"],
      popular: false,
      type: "static"
    },
    {
      id: "static-27",
      name: "Alas Trolly",
      category: "khusus",
      description: "Alas trolly untuk rumah sakit dan industri.",
      priceRange: "Rp 300.000 - 700.000",
      minOrder: "10 pcs",
      duration: "7-14 hari",
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?q=80&w=1970",
      materials: ["Kanvas", "Parasut", "Vinyl"],
      popular: false,
      type: "static"
    },
    {
      id: "static-28",
      name: "Syall Pramuka",
      category: "khusus",
      description: "Syall/setangan leher untuk pramuka.",
      priceRange: "Rp 40.000 - 100.000",
      minOrder: "100 pcs",
      duration: "5-10 hari",
      image: "https://images.unsplash.com/photo-1582550945152-4f7d0b3ada8d?q=80&w=1974",
      materials: ["Sutra", "Polyester", "Katun"],
      popular: false,
      type: "static"
    },
    {
      id: "static-29",
      name: "Jasket",
      category: "khusus",
      description: "Jasket untuk berbagai keperluan khusus.",
      priceRange: "Rp 250.000 - 600.000",
      minOrder: "15 pcs",
      duration: "6-12 hari",
      image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1970",
      materials: ["Taslan", "Drill", "Kanvas"],
      popular: false,
      type: "static"
    }
  ];
  
  // Fallback images untuk static products
  const fallbackImages = [
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974",
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=1974",
    "https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1970",
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1974",
    "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?q=80&w=1974",
    "https://images.unsplash.com/photo-1581092160607-ee22731c5c6d?q=80&w=1970",
    "https://images.unsplash.com/photo-1582550945152-4f7d0b3ada8d?q=80&w=1974",
    "https://images.unsplash.com/photo-1613243555978-636c48dc653c?q=80&w=1970",
    "https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?q=80&w=1974",
    "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1970"
  ];
  
  // Pastikan semua static products punya gambar
  return staticProducts.map((product, index) => ({
    ...product,
    image: product.image || fallbackImages[index % fallbackImages.length]
  }));
};

// Data dinamis dari API
export const getDynamicLayanan = async () => {
  try {
    console.log("Fetching products from API...");
    const response = await produkService.getProduk({ limit: 100 });
    
    // Debug log
    console.log("API Response structure:", response);
    console.log("Response data:", response.data);
    
    if (response.data && response.data.data) {
      const products = response.data.data;
      console.log(`Fetched ${products.length} products from API`);
      
      return products.map((product, index) => {
        // Log setiap produk untuk debugging
        console.log(`Product ${index + 1}:`, {
          id: product.id || product._id,
          name: product.nama_produk || product.nama,
          imageFields: {
            foto: product.foto,
            gambar: product.gambar,
            image: product.image,
            images: product.images
          }
        });
        
        // Format data dari API
        const formattedProduct = {
          id: product.id || product._id || `db-${Date.now()}-${index}`,
          name: product.nama_produk || product.nama || product.name || `Produk ${index + 1}`,
          category: product.kategori || "umum",
          description: product.deskripsi || product.description || "Produk konveksi berkualitas",
          priceRange: product.harga 
            ? `Rp ${product.harga.toLocaleString('id-ID')}` 
            : "Hubungi Kami",
          minOrder: product.min_order 
            ? `${product.min_order} pcs` 
            : "1 pcs",
          duration: product.estimasi_pengerjaan 
            ? `${product.estimasi_pengerjaan} hari` 
            : product.durasi || "7-14 hari",
          materials: Array.isArray(product.bahan) 
            ? product.bahan 
            : product.bahan 
              ? [product.bahan]
              : ["Katun"],
          popular: product.is_best_seller || product.popular || false,
          type: "dynamic",
          stock: product.stock || 0,
          // Simpan raw data untuk reference
          rawData: product
        };
        
        // Resolve gambar - coba berbagai field
        const fallbackImage = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974&auto=format&fit=crop";
        let resolvedImage = fallbackImage;
        
        // Coba field foto terlebih dahulu (sesuai contoh dari ProductCard)
        if (product.foto) {
          console.log(`Found 'foto' field:`, product.foto);
          resolvedImage = resolveImage(product.foto, fallbackImage);
        }
        // Coba field gambar
        else if (product.gambar) {
          console.log(`Found 'gambar' field:`, product.gambar);
          resolvedImage = resolveImage(product.gambar, fallbackImage);
        }
        // Coba field image
        else if (product.image) {
          console.log(`Found 'image' field:`, product.image);
          resolvedImage = resolveImage(product.image, fallbackImage);
        }
        // Coba array images
        else if (product.images && Array.isArray(product.images) && product.images.length > 0) {
          console.log(`Found 'images' array:`, product.images);
          resolvedImage = resolveImage(product.images[0], fallbackImage);
        }
        // Coba field foto_produk
        else if (product.foto_produk) {
          console.log(`Found 'foto_produk' field:`, product.foto_produk);
          resolvedImage = resolveImage(product.foto_produk, fallbackImage);
        }
        
        console.log(`Resolved image for product ${formattedProduct.name}:`, resolvedImage);
        
        return {
          ...formattedProduct,
          image: resolvedImage
        };
      });
    }
    
    console.warn("API returned no data or unexpected structure");
    return [];
    
  } catch (error) {
    console.error("Error fetching dynamic layanan:", error);
    console.error("Error response:", error.response?.data);
    console.error("Error status:", error.response?.status);
    console.error("Error config:", error.config);
    return [];
  }
};

// Gabungkan data: API dulu, jika kosong baru statis
export const getAllLayanan = async () => {
  try {
    console.log("=== Fetching all layanan ===");
    
    // Coba ambil dari API dulu
    const dynamicData = await getDynamicLayanan();
    console.log(`Got ${dynamicData.length} products from API`);
    
    // Jika ada data dari API, return API data saja
    if (dynamicData.length > 0) {
      console.log("Using API data only");
      return dynamicData;
    }
    
    // Jika API kosong, tambahkan data statis
    console.log("API returned empty, using static data");
    const staticData = getStaticLayanan();
    console.log(`Got ${staticData.length} static products`);
    
    return staticData;
    
  } catch (error) {
    console.error("Error combining data:", error);
    // Fallback ke data statis saja
    return getStaticLayanan();
  }
};

// Get semua bahan yang tersedia (unik)
export const getAllMaterials = (layanan) => {
  const materials = new Set();
  
  layanan.forEach(item => {
    if (item.materials && Array.isArray(item.materials)) {
      item.materials.forEach(material => {
        if (material && typeof material === 'string' && material.trim() !== "") {
          materials.add(material.trim());
        }
      });
    }
  });
  
  return Array.from(materials).sort();
};

// Get semua kategori dengan icon
export const getCategories = (layanan) => {
  // Kategori default dengan icon
  const categoryConfig = {
    "pakaian": { name: "Pakaian", icon: "mdi:tshirt-crew" },
    "seragam": { name: "Seragam", icon: "mdi:hospital-box" },
    "medis": { name: "Medis", icon: "mdi:medical-bag" },
    "linen": { name: "Linen", icon: "mdi:bed" },
    "khusus": { name: "Khusus", icon: "mdi:star" },
    "umum": { name: "Umum", icon: "mdi:package-variant" }
  };
  
  // Kumpulkan kategori unik dari data
  const uniqueCategories = new Set();
  layanan.forEach(item => {
    if (item.category) {
      uniqueCategories.add(item.category);
    }
  });
  
  // Buat array kategori
  const categories = [
    { id: "all", name: "Semua Produk", icon: "mdi:view-grid", count: layanan.length }
  ];
  
  // Tambahkan kategori dari data
  uniqueCategories.forEach(catId => {
    const config = categoryConfig[catId] || { name: catId, icon: "mdi:tag" };
    const count = layanan.filter(item => item.category === catId).length;
    
    categories.push({
      id: catId,
      name: config.name,
      icon: config.icon,
      count: count
    });
  });
  
  return categories;
};

// Filter layanan berdasarkan kriteria
export const filterLayanan = (layanan, filters) => {
  const { 
    searchTerm = "", 
    category = "all", 
    material = "all",
    type = "all" 
  } = filters;
  
  return layanan.filter(item => {
    // Filter pencarian
    let matchesSearch = true;
    if (searchTerm && searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase().trim();
      matchesSearch = 
        item.name.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query)) ||
        (item.materials && item.materials.some(m => 
          m.toLowerCase().includes(query)
        ));
    }
    
    // Filter kategori
    const matchesCategory = category === "all" || item.category === category;
    
    // Filter bahan
    let matchesMaterial = true;
    if (material !== "all") {
      matchesMaterial = item.materials && item.materials.some(m => 
        m.toLowerCase().includes(material.toLowerCase())
      );
    }
    
    // Filter tipe (dynamic/static)
    let matchesType = true;
    if (type !== "all") {
      matchesType = item.type === type;
    }
    
    return matchesSearch && matchesCategory && matchesMaterial && matchesType;
  });
};

// Get bahan yang paling banyak digunakan
export const getTopMaterials = (layanan, limit = 10) => {
  const materialCount = {};
  
  layanan.forEach(item => {
    if (item.materials) {
      item.materials.forEach(material => {
        if (material) {
          materialCount[material] = (materialCount[material] || 0) + 1;
        }
      });
    }
  });
  
  return Object.entries(materialCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, limit)
    .map(([material]) => material);
};

// Cek apakah ada data dari API
export const hasApiData = (layanan) => {
  return layanan.some(item => item.type === "dynamic");
};

// Get statistik data
export const getStats = (layanan) => {
  const apiProducts = layanan.filter(item => item.type === "dynamic");
  const staticProducts = layanan.filter(item => item.type === "static");
  
  return {
    total: layanan.length,
    fromApi: apiProducts.length,
    fromStatic: staticProducts.length,
    hasApiData: apiProducts.length > 0
  };
};