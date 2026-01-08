// src/pages/customer/Tentang.jsx
import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { 
  CalendarIcon, 
  UserGroupIcon, 
  TruckIcon, 
  CogIcon,
  ShieldCheckIcon,
  BoltIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  MapPinIcon,
  ClockIcon,
  PhoneIcon,
  ArrowRightIcon
} from "@heroicons/react/24/outline";

const Tentang = () => {
  const milestoneYears = [
    { year: "2001", title: "Awal Berdiri", desc: "Mulai dengan workshop kecil di Tasikmalaya" },
    { year: "2020", title: "Ekspansi Digital", desc: "Meluncurkan platform online pertama" },
    { year: "2022", title: "Modernisasi", desc: "Upgrade peralatan dengan teknologi terbaru" },
    { year: "2024", title: "Nasional", desc: "Melayani klien dari seluruh Indonesia" },
  ];

  const coreValues = [
    {
      icon: <ShieldCheckIcon className="w-7 h-7" />,
      title: "Kualitas Premium",
      description: "Material Grade A dengan jahitan presisi dan kontrol kualitas ketat.",
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "bg-gradient-to-br from-emerald-50/80 to-teal-50/80"
    },
    {
      icon: <BoltIcon className="w-7 h-7" />,
      title: "Efisiensi Tinggi",
      description: "Proses produksi teroptimasi dengan teknologi modern untuk hasil maksimal.",
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "bg-gradient-to-br from-blue-50/80 to-indigo-50/80"
    },
    {
      icon: <SparklesIcon className="w-7 h-7" />,
      title: "Inovasi Berkelanjutan",
      description: "Selalu update dengan trend dan teknologi terbaru di industri konveksi.",
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "bg-gradient-to-br from-purple-50/80 to-pink-50/80"
    },
    {
      icon: <CurrencyDollarIcon className="w-7 h-7" />,
      title: "Nilai Terbaik",
      description: "Harga kompetitif dengan kualitas yang tidak pernah dikompromikan.",
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "bg-gradient-to-br from-amber-50/80 to-orange-50/80"
    },
  ];

  const stats = [
    { icon: <CalendarIcon className="w-6 h-6" />, value: "5+", label: "Tahun Pengalaman", suffix: "thn" },
    { icon: <UserGroupIcon className="w-6 h-6" />, value: "500+", label: "Klien Puas", suffix: "klien" },
    { icon: <TruckIcon className="w-6 h-6" />, value: "10K+", label: "Produk Terkirim", suffix: "pcs" },
    { icon: <CogIcon className="w-6 h-6" />, value: "50+", label: "Jenis Layanan", suffix: "jenis" },
  ];

  const teamMembers = [
    {
      name: "Ahmad Sopian",
      role: "Founder & Master Tailor",
      experience: "10+ tahun",
      specialty: "Pattern Making & Quality Control",
      image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974",
      color: "bg-gradient-to-br from-emerald-500 to-teal-500"
    },
    {
      name: "Siti Nurhaliza",
      role: "Design Director",
      experience: "8+ tahun",
      specialty: "Fashion Design & Product Development",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976",
      color: "bg-gradient-to-br from-blue-500 to-indigo-500"
    },
    {
      name: "Budi Santoso",
      role: "Production Manager",
      experience: "7+ tahun",
      specialty: "Team Management & Process Optimization",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1974",
      color: "bg-gradient-to-br from-purple-500 to-pink-500"
    },
    {
      name: "Rina Wati",
      role: "Customer Relations",
      experience: "5+ tahun",
      specialty: "Client Consultation & After-Sales Service",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961",
      color: "bg-gradient-to-br from-amber-500 to-orange-500"
    },
  ];

  const services = [
    "🎽 Seragam Perusahaan",
    "🏥 Seragam Medis",
    "🎓 Seragam Sekolah",
    "🎨 Custom Fashion",
    "🛏️ Linen Hotel",
    "👔 Jas & Formal Wear"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 py-24">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-6xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
              <Icon icon="mdi:needle" className="text-lg" />
              <span>SEJARAH & VISI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-100">
                Tentang MN Konveksi
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Transformasi <span className="text-emerald-300 font-semibold">kain menjadi karya</span>, 
              mengukir cerita sukses melalui <span className="text-indigo-300 font-semibold">kualitas dan inovasi</span>
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Pelajari Lebih</span>
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Icon icon="mdi:whatsapp" className="text-xl" />
                Hubungi Kami
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow text-center"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mb-4">
                  <div className="text-indigo-600">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
                <div className="text-indigo-500 text-xs font-medium mt-1">{stat.suffix}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                  Perjalanan Kami
                </span>
              </h2>
              
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Berdiri sejak 2018 di jantung Tasikmalaya, <span className="font-semibold text-indigo-700">MN Konveksi</span> memulai perjalanan dengan visi sederhana: memberikan solusi konveksi terbaik dengan kualitas tak tertandingi.
                </p>
                <p>
                  Dari workshop kecil dengan beberapa mesin jahit, kami tumbuh menjadi perusahaan konveksi modern dengan fasilitas produksi seluas 500m² yang dilengkapi teknologi terbaru.
                </p>
                <p>
                  Setiap produk yang kami hasilkan bukan sekadar pakaian, melainkan <span className="italic text-indigo-600">cerita kesempurnaan</span> yang dirajut dengan dedikasi, keahlian, dan cinta pada setiap detail.
                </p>
              </div>

              {/* Milestone Timeline */}
              <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                {milestoneYears.map((milestone, index) => (
                  <div key={index} className="text-center">
                    <div className="text-2xl font-bold text-indigo-600 mb-2">{milestone.year}</div>
                    <div className="text-sm font-semibold text-gray-800 mb-1">{milestone.title}</div>
                    <div className="text-xs text-gray-600">{milestone.desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1970"
                  alt="Workshop MN Konveksi"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent"></div>
              </div>
              
              {/* Floating Image */}
              <div className="absolute -bottom-6 -right-6 w-48 h-48 rounded-2xl overflow-hidden border-8 border-white shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1974"
                  alt="Detail Jahitan"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nilai <span className="text-emerald-600">Inti</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Prinsip yang menggerakan setiap langkah dan keputusan kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {coreValues.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${value.bgGradient} rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm`}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${value.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {value.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h3>
                <p className="text-gray-700 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Spesialisasi <span className="text-indigo-600">Kami</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai layanan konveksi yang telah kami kuasai
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {services.map((service, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-300 text-center"
              >
                <div className="text-2xl mb-3">{service.split(" ")[0]}</div>
                <div className="text-sm font-medium text-gray-800">{service.split(" ").slice(1).join(" ")}</div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.pathname = '/layanan'}
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 inline-flex items-center gap-3"
            >
              <span>Lihat Semua Layanan</span>
              <ArrowRightIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </section>

      {/* Team Section */}
      {/* <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Tim <span className="text-blue-600">Ahli</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Profesional berpengalaman yang menggerakan MN Konveksi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow overflow-hidden group"
              >
                <div className={`h-48 ${member.color} relative overflow-hidden`}>
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover mix-blend-overlay opacity-90 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold">
                    {member.experience}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                  <div className="text-indigo-600 font-medium mb-3">{member.role}</div>
                  <p className="text-gray-600 text-sm mb-4">{member.specialty}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Location & Contact */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-8 md:p-12 shadow-xl"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Temui <span className="text-emerald-600">Kami</span>
                </h2>
                
                <div className="space-y-6 text-gray-700">
                  <div className="flex items-start gap-4">
                    <MapPinIcon className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">Lokasi Workshop</div>
                      <p>Kp. Jatiwangi, Mugarsari, Kec. Tamansari, Kab. Tasikmalaya, Jawa Barat 46191</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <ClockIcon className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Jam Operasional</div>
                      <p>Senin - Sabtu: 08:00 - 17:00 WIB</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <PhoneIcon className="w-6 h-6 text-indigo-600" />
                    <div>
                      <div className="font-semibold text-gray-900">Kontak Cepat</div>
                      <p>+62 812-3456-7890</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open("https://maps.app.goo.gl/LFQTiv55ijyKVG5C6", "_blank")}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center gap-2"
                  >
                    <Icon icon="mdi:google-maps" className="text-xl" />
                    Buka di Google Maps
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                    className="px-6 py-3 bg-white border-2 border-emerald-500 text-emerald-600 font-semibold rounded-xl hover:bg-emerald-50 transition-colors flex items-center gap-2"
                  >
                    <Icon icon="mdi:whatsapp" className="text-xl" />
                    Chat via WhatsApp
                  </motion.button>
                </div>
              </div>

              {/* Map Visualization */}
              <div className="relative h-96 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100">
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="relative mb-8">
                    <div className="w-32 h-32 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full"></div>
                    <Icon 
                      icon="mdi:map-marker" 
                      className="text-indigo-600 text-5xl absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-800 font-bold text-xl mb-2">Workshop Utama</p>
                    <p className="text-gray-600">Tasikmalaya, Jawa Barat</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 rounded-3xl p-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Siap Bekerja Sama?
            </h2>
            <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
              Mari wujudkan visi Anda melalui keahlian dan dedikasi tim MN Konveksi
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                className="px-8 py-4 bg-white text-indigo-700 font-bold rounded-xl hover:bg-gray-100 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Icon icon="mdi:whatsapp" className="text-2xl" />
                Konsultasi Gratis
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("tel:+6281234567890", "_self")}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <PhoneIcon className="w-5 h-5" />
                Telepon Langsung
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Tentang;