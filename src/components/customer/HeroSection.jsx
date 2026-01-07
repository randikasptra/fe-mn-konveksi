// src/components/customer/HeroSection.jsx
import React from "react";
import { Icon } from "@iconify/react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-left">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-8 border border-white/20">
              <Icon icon="mdi:needle" className="text-lg" />
              Konveksi Profesional sejak 2001
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-100">
                MN KONVEKSI
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
              Transformasi <span className="text-emerald-300 font-semibold">kain menjadi karya</span>, 
              inovasi <span className="text-indigo-300 font-semibold">ide menjadi kenyataan</span>
            </p>
            
            <p className="text-gray-400 mb-12 max-w-xl text-lg">
              Solusi konveksi terpercaya untuk kebutuhan seragam, pakaian custom, 
              dan berbagai produk tekstil dengan kualitas premium dan harga kompetitif.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}
                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-3"
              >
                <span>Jelajahi Produk</span>
                <Icon icon="mdi:arrow-down" className="group-hover:translate-y-1 transition-transform" />
              </button>
              
              <button
                onClick={() => window.open("https://wa.me/6281234567890", "_blank")}
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white font-bold rounded-xl hover:bg-white/20 hover:border-white/50 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Icon icon="mdi:whatsapp" className="text-xl" />
                Konsultasi Gratis
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-16">
              {[
                { value: "500+", label: "Klien Puas" },
                { value: "10K+", label: "Produk Terkirim" },
                { value: "100%", label: "Garansi Kualitas" },
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">{stat.value}</div>
                  <div className="text-gray-400 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/src/assets/hero.jpg"
                alt="Banner Produk Konveksi"
                className="w-full h-[500px] object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='500' viewBox='0 0 600 500'%3E%3Crect width='600' height='500' fill='%231e1b4b'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='32' fill='%238b5cf6' text-anchor='middle' dominant-baseline='middle'%3EMN KONVEKSI%3C/text%3E%3C/svg%3E";
                }}
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/60 via-transparent to-transparent"></div>
              
              {/* Floating Elements */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:quality-high" className="text-emerald-600 text-2xl" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Premium Quality</div>
                    <div className="text-sm text-gray-600">Bahan Grade A</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm p-4 rounded-2xl shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:clock-fast" className="text-purple-600 text-2xl" />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Fast Delivery</div>
                    <div className="text-sm text-gray-600">Estimasi Akurat</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-3xl rotate-12 opacity-80"></div>
            <div className="absolute -top-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl -rotate-12 opacity-80"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="animate-bounce">
          <Icon icon="mdi:chevron-down" className="text-white/50 text-3xl" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;