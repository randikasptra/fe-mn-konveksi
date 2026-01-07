// src/components/customer/ProductCard.jsx
import React from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onOrderClick, isLoggedIn }) => {
  const navigate = useNavigate();

  // Format harga ke Rupiah
  const formatPrice = (price) => {
    if (!price) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Format estimasi pengerjaan
  const formatEstimation = (days) => {
    if (!days) return "-";
    return `${days} hari`;
  };

  // Resolve image URL
  const resolveImage = (foto) => {
    if (!foto) return null;
    if (typeof foto === "string") {
      if (foto.startsWith("http")) return foto;
      if (foto.startsWith("data:image")) return foto;
      if (foto.startsWith("/")) return foto;
    }
    return null;
  };

  // Handle WhatsApp click
  const handleWhatsAppClick = (e) => {
    e.stopPropagation();

    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp konveksi

    let message;
    if (isLoggedIn) {
      message = `Halo, saya tertarik dengan produk:\n\n📌 *${
        product.nama_produk
      }*\n🆔 ID: ${product.id_produk}\n💰 Harga: ${formatPrice(
        product.harga
      )}\n⏱️ Estimasi: ${formatEstimation(
        product.estimasi_pengerjaan
      )}\n\nBisa info lebih detail dan cara pemesanannya?`;
    } else {
      message = `Halo, saya melihat produk *${product.nama_produk}* di website konveksi Anda. Bisa info harga dan cara pemesanannya?`;
    }

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  // Handle order click
  const handleOrderClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      window.dispatchEvent(
        new CustomEvent("openLoginModal", {
          detail: { redirectAfterLogin: `/product/${product.id_produk}` },
        })
      );
      return;
    }
    onOrderClick(e, product);
  };

  return (
    <div className="group relative flex flex-col h-full bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-200 hover:border-indigo-200 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
        {resolveImage(product.foto) ? (
          <>
            <img
              src={resolveImage(product.foto)}
              alt={product.nama_produk}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              loading="lazy"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <Icon
              icon="mdi:tshirt-crew-outline"
              className="text-gray-300 text-6xl mb-3"
            />
            <span className="text-gray-400 text-sm">Gambar tidak tersedia</span>
          </div>
        )}

        {/* Badge Estimasi */}
        {product.estimasi_pengerjaan && (
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
            <div className="flex items-center gap-2">
              <Icon
                icon="mdi:clock-fast"
                className="text-emerald-500 text-sm"
              />
              <span className="text-xs font-semibold text-gray-800">
                {formatEstimation(product.estimasi_pengerjaan)}
              </span>
            </div>
          </div>
        )}

        {/* Hover Action */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="flex gap-2">
            <button
              onClick={() => navigate(`/produk/${product.id_produk}`)}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Icon icon="mdi:eye" className="text-indigo-600 text-lg" />
            </button>
            <button
              onClick={handleOrderClick}
              className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 transition-transform"
            >
              <Icon icon="mdi:cart-plus" className="text-emerald-600 text-lg" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {/* Category Tag */}
        {product.kategori && (
          <div className="inline-flex items-center gap-1.5 mb-3">
            <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
            <span className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
              {product.kategori}
            </span>
          </div>
        )}

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-snug">
          {product.nama_produk}
        </h3>

        {/* Description */}
        {product.deskripsi && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {product.deskripsi}
          </p>
        )}

        {/* Bahan & Price */}
        <div className="space-y-3 mb-6">
          {product.bahan && (
            <div className="flex items-center gap-2">
              <Icon icon="mdi:tag-outline" className="text-gray-400 text-sm" />
              <span className="text-xs text-gray-500">
                Bahan:{" "}
                <span className="font-medium text-gray-700">
                  {product.bahan}
                </span>
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {formatPrice(product.harga)}
            </span>
            <span className="text-xs text-gray-400">/pcs</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            {/* Main Order Button */}
            <button
              onClick={handleOrderClick}
              className={`
                flex-1 px-4 py-3 rounded-xl font-semibold text-sm transition-all duration-300
                flex items-center justify-center gap-2
                ${
                  isLoggedIn
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 hover:shadow-lg active:scale-[0.98]"
                    : "bg-gradient-to-r from-gray-700 to-gray-800 text-white hover:from-gray-800 hover:to-gray-900"
                }
              `}
            >
              {isLoggedIn ? (
                <>
                  <Icon icon="mdi:shopping" className="text-lg" />
                  Pesan Sekarang
                </>
              ) : (
                <>
                  <Icon icon="mdi:lock" className="text-lg" />
                  Login untuk Pesan
                </>
              )}
            </button>

            {/* WhatsApp Button */}
            <button
              onClick={handleWhatsAppClick}
              className="
                w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300
                bg-gradient-to-br from-emerald-500 to-emerald-600 text-white
                hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg
                active:scale-[0.95]
              "
              title="Tanya via WhatsApp"
            >
              <Icon icon="mdi:whatsapp" className="text-xl" />
            </button>
          </div>

          {/* Login Prompt */}
          {!isLoggedIn && (
            <div className="mt-3 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
              <div className="flex items-center gap-2">
                <Icon
                  icon="mdi:information"
                  className="text-indigo-500 text-sm flex-shrink-0"
                />
                <p className="text-xs text-indigo-700">
                  Login untuk harga khusus & kemudahan pesan
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ribbon Best Seller */}
      {product.is_best_seller && (
        <div className="absolute top-4 left-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 text-xs font-bold shadow-lg rounded-r-lg">
            🏆 BEST SELLER
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;
