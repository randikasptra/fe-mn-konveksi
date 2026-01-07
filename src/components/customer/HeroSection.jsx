// src/components/customer/HeroSection.jsx
import React from "react";

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-[#57595B] to-[#3a3c3e] text-white py-16 md:py-20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 border-2 border-white rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4 tracking-tight">
            MN KONVEKSI
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8">
            Dari Kain Menjadi Karya, Dari Ide Menjadi Kenyataan
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <button
              onClick={() => window.scrollTo({ top: 700, behavior: "smooth" })}
              className="px-8 py-3 bg-white text-[#57595B] font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-300"
            >
              Lihat Produk
            </button>
            <button
              onClick={() => window.open("/about", "_self")}
              className="px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors duration-300"
            >
              Tentang Kami
            </button>
          </div>
        </div>

        {/* Banner Image */}
        <div className="mt-12 max-w-6xl mx-auto">
          <div className="relative w-full aspect-[16/7] overflow-hidden rounded-2xl shadow-2xl">
            <img
              src="/src/assets/hero.jpg"
              alt="Banner Produk Konveksi"
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='400' viewBox='0 0 800 400'%3E%3Crect width='800' height='400' fill='%23333'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial' font-size='24' fill='%23fff' text-anchor='middle' dominant-baseline='middle'%3EMN KONVEKSI%3C/text%3E%3C/svg%3E";
              }}
            />

            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

            {/* Banner Text */}
            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl font-bold">Kualitas Premium</h3>
              <p className="text-sm">Konveksi Terpercaya sejak 2010</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
