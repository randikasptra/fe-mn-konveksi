// src/pages/customer/Kontak.jsx
import React from "react";
import { motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { 
  MapPinIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  ClockIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ArrowRightIcon,
  CalendarIcon,
  ShieldCheckIcon,
  TruckIcon
} from "@heroicons/react/24/outline";

const Kontak = () => {
  const contactCards = [
    {
      icon: <MapPinIcon className="w-7 h-7" />,
      title: "Lokasi Workshop",
      details: [
        "Kp. Jatiwangi, Mugarsari",
        "Kec. Tamansari, Kab. Tasikmalaya",
        "Jawa Barat 46191"
      ],
      gradient: "from-emerald-500 to-teal-500",
      bgGradient: "bg-gradient-to-br from-emerald-50/80 to-teal-50/80",
      action: "https://maps.app.goo.gl/LFQTiv55ijyKVG5C6",
      actionText: "Lihat di Google Maps →",
      mapColor: "bg-emerald-100"
    },
    {
      icon: <PhoneIcon className="w-7 h-7" />,
      title: "Telepon & WhatsApp",
      details: [
        "📱 +62 812-3456-7890",
        "📱 +62 812-9876-5432",
        "Respon cepat 24/7 via WhatsApp"
      ],
      gradient: "from-blue-500 to-indigo-500",
      bgGradient: "bg-gradient-to-br from-blue-50/80 to-indigo-50/80",
      action: "https://wa.me/6281234567890",
      actionText: "Chat via WhatsApp →",
      mapColor: "bg-blue-100"
    },
    {
      icon: <EnvelopeIcon className="w-7 h-7" />,
      title: "Email Resmi",
      details: [
        "📧 info@mnkonveksi.com",
        "📧 marketing@mnkonveksi.com",
        "📧 support@mnkonveksi.com"
      ],
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "bg-gradient-to-br from-purple-50/80 to-pink-50/80",
      action: "mailto:info@mnkonveksi.com",
      actionText: "Kirim Email →",
      mapColor: "bg-purple-100"
    },
    {
      icon: <ClockIcon className="w-7 h-7" />,
      title: "Jam Operasional",
      details: [
        "📅 Senin - Jumat: 08:00 - 17:00",
        "📅 Sabtu: 08:00 - 14:00",
        "📅 Minggu: Libur"
      ],
      gradient: "from-amber-500 to-orange-500",
      bgGradient: "bg-gradient-to-br from-amber-50/80 to-orange-50/80",
      action: "https://wa.me/6281234567890",
      actionText: "Pesan di luar jam →",
      mapColor: "bg-amber-100"
    },
  ];

  const quickActions = [
    {
      icon: <Icon icon="mdi:whatsapp" className="w-5 h-5" />,
      title: "Konsultasi Cepat",
      description: "Chat langsung via WhatsApp untuk respon instan",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      onClick: () => window.open("https://wa.me/6281234567890", "_blank")
    },
    {
      icon: <Icon icon="mdi:calculator" className="w-5 h-5" />,
      title: "Minta Penawaran",
      description: "Dapatkan estimasi harga untuk kebutuhan Anda",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      onClick: () => window.open("https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20minta%20penawaran%20harga", "_blank")
    },
    {
      icon: <Icon icon="mdi:calendar-clock" className="w-5 h-5" />,
      title: "Jadwalkan Meeting",
      description: "Atur pertemuan dengan tim konsultan kami",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      onClick: () => window.open("https://wa.me/6281234567890?text=Halo%2C%20saya%20ingin%20jadwalkan%20meeting", "_blank")
    },
    {
      icon: <Icon icon="mdi:file-document" className="w-5 h-5" />,
      title: "Download Katalog",
      description: "Lihat koleksi produk kami secara lengkap",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      onClick: () => window.open("#", "_blank")
    },
  ];

  const socialMedia = [
    { 
      name: "Instagram", 
      icon: "mdi:instagram", 
      url: "https://instagram.com/mnkonveksi", 
      color: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",
      followers: "12.5K followers",
      handle: "@mnkonveksi"
    },
    { 
      name: "Facebook", 
      icon: "mdi:facebook", 
      url: "https://facebook.com/mnkonveksi", 
      color: "bg-gradient-to-br from-blue-600 to-blue-700",
      followers: "8.3K likes",
      handle: "MN Konveksi"
    },
    { 
      name: "TikTok", 
      icon: "mdi:tiktok", 
      url: "https://tiktok.com/@mnkonveksi", 
      color: "bg-gradient-to-br from-gray-800 to-black",
      followers: "25.7K followers",
      handle: "@mnkonveksi"
    },
    { 
      name: "YouTube", 
      icon: "mdi:youtube", 
      url: "https://youtube.com/@mnkonveksi", 
      color: "bg-gradient-to-br from-red-600 to-red-700",
      followers: "3.2K subscribers",
      handle: "@mnkonveksi"
    },
  ];

  const teamInfo = [
    {
      role: "Customer Service",
      name: "Sari Dewi",
      contact: "cs@mnkonveksi.com",
      expertise: "Penawaran & Konsultasi"
    },
    {
      role: "Technical Support",
      name: "Budi Santoso",
      contact: "technical@mnkonveksi.com",
      expertise: "Desain & Produksi"
    },
    {
      role: "Marketing",
      name: "Rina Andini",
      contact: "marketing@mnkonveksi.com",
      expertise: "Partnership & Event"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-blue-50/30">
      {/* Hero Section - Modern Dark */}
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
              <span>HUBUNGI TIM KAMI</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-100">
                Mari Terhubung
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
              Tim profesional kami siap membantu transformasi ide Anda menjadi produk konveksi berkualitas
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Icon icon="mdi:whatsapp" className="text-2xl" />
                Chat via WhatsApp
                <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <MapPinIcon className="w-5 h-5" />
                Lihat Lokasi
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                Informasi Kontak
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih cara terbaik untuk berkomunikasi dengan tim kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactCards.map((card, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`${card.bgGradient} rounded-2xl p-8 border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm`}
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${card.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {card.icon}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">{card.title}</h3>
                
                <div className="space-y-3 mb-6">
                  {card.details.map((detail, idx) => (
                    <p key={idx} className="text-gray-700 font-medium text-sm">
                      {detail}
                    </p>
                  ))}
                </div>

                {card.action && (
                  <motion.a
                    whileHover={{ x: 5 }}
                    href={card.action}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-gray-900 hover:text-gray-700 font-semibold text-sm"
                  >
                    {card.actionText}
                  </motion.a>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Aksi <span className="text-emerald-600">Cepat</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Layanan yang dapat Anda akses langsung
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                onClick={action.onClick}
                className={`${action.bgColor} p-6 rounded-2xl border border-gray-200 hover:border-gray-300 transition-all duration-300 text-left group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 ${action.color} ${action.bgColor} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    {action.icon}
                  </div>
                  <div>
                    <h4 className={`text-lg font-bold ${action.color} mb-2`}>{action.title}</h4>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Team Contact & Social Media */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Team Contact */}
            <div>
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Tim <span className="text-blue-600">Kontak</span>
                </h3>
                <p className="text-gray-600">
                  Hubungi langsung tim spesialis kami berdasarkan kebutuhan Anda
                </p>
              </div>

              <div className="space-y-6">
                {teamInfo.map((member, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <UserGroupIcon className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-900">{member.role}</h4>
                        <p className="text-gray-700 font-medium mb-1">{member.name}</p>
                        <p className="text-blue-600 text-sm mb-2">{member.contact}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <ShieldCheckIcon className="w-4 h-4" />
                          <span>{member.expertise}</span>
                        </div>
                      </div>
                      <motion.a
                        whileHover={{ scale: 1.1 }}
                        href={`mailto:${member.contact}`}
                        className="p-2 hover:bg-gray-100 rounded-lg"
                      >
                        <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                      </motion.a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Social Media */}
            <div>
              <div className="mb-10">
                <h3 className="text-3xl font-bold text-gray-900 mb-4">
                  Media <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500">Sosial</span>
                </h3>
                <p className="text-gray-600">
                  Ikuti perkembangan dan inspirasi terbaru dari MN Konveksi
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {socialMedia.map((social, index) => (
                  <motion.a
                    key={index}
                    whileHover={{ y: -5 }}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <div className={`${social.color} rounded-2xl p-6 text-white hover:shadow-2xl transition-all duration-300 group overflow-hidden relative`}>
                      {/* Hover effect */}
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                          <Icon icon={social.icon} className="text-3xl" />
                          <span className="text-lg font-bold">{social.name}</span>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm opacity-90">{social.handle}</div>
                          <div className="text-xs opacity-75">{social.followers}</div>
                        </div>
                        
                        <div className="mt-4 text-right">
                          <ArrowRightIcon className="w-4 h-4 inline group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.a>
                ))}
              </div>

              {/* CTA Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white"
              >
                <h4 className="text-xl font-bold mb-4">Butuh Bantuan Cepat?</h4>
                <p className="mb-6 opacity-90">
                  Tim customer service kami siap membantu 24/7 via WhatsApp
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                  className="w-full py-3 bg-white text-emerald-600 font-bold rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:whatsapp" className="text-xl" />
                  Chat Sekarang
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Siap Bekerja Sama?
            </h2>
            <p className="text-indigo-100 text-lg mb-10 leading-relaxed">
              Mari wujudkan ide Anda menjadi produk konveksi berkualitas bersama tim profesional kami
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
            
            <p className="text-indigo-200/70 text-sm mt-8">
              Respon dalam 5 menit selama jam operasional
            </p>
          </div>
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

export default Kontak;