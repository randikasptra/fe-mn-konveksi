// src/components/customer/ProductCard.jsx
import React from "react";
import { Icon } from "@iconify/react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({ product, onOrderClick, isLoggedIn }) => {
  const navigate = useNavigate();

  const resolveImage = (foto) => {
    if (!foto) return null;
    if (typeof foto === "string" && foto.startsWith("http")) return foto;
    return null;
  };

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      window.dispatchEvent(new Event("openLoginModal"));
      return;
    }

    const phoneNumber = "6281234567890"; // Ganti dengan nomor WhatsApp konveksi
    const message = `Halo, saya tertarik dengan produk ${product.nama_produk} (ID: ${product.id_produk}). Bisa info detail harganya?`;
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;
    window.open(url, "_blank");
  };

  return (
    <article className="group bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* Image Container */}
      <div className="relative h-64 md:h-72 w-full overflow-hidden bg-gray-100">
        {resolveImage(product.foto) ? (
          <img
            src={resolveImage(product.foto)}
            alt={product.nama_produk}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <Icon icon="mdi:tshirt-crew" className="text-gray-400 text-4xl" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
          {product.nama_produk}
        </h3>

        {product.deskripsi && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
            {product.deskripsi}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={(e) => onOrderClick(e, product)}
            disabled={!isLoggedIn}
            className={`
              flex-1 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200
              ${
                isLoggedIn
                  ? "bg-[#57595B] text-white hover:bg-[#3a3c3e] active:scale-[0.98]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }
            `}
          >
            {isLoggedIn ? "Pesan Sekarang" : "Login untuk Pesan"}
          </button>

          <button
            onClick={handleWhatsAppClick}
            disabled={!isLoggedIn}
            className={`
              w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-200
              ${
                isLoggedIn
                  ? "bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-md active:scale-[0.95]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }
            `}
          >
            <Icon icon="mdi:whatsapp" className="text-xl" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
