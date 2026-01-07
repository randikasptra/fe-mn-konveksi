// src/components/customer/ProductDetailModal.jsx
import React, { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { produkService } from "../../services/api";

const ProductDetailModal = ({ productId, isOpen, onClose }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedColor, setSelectedColor] = useState("#57595B");

  useEffect(() => {
    const loadProductDetail = async () => {
      try {
        setLoading(true);
        const response = await produkService.getProdukDetail(productId);
        setProduct(response.data);
      } catch (error) {
        console.error("Error loading product detail:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      loadProductDetail();
    }
  }, [productId]);

  const handleQuantityChange = (delta) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= 100) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    // Implementasi cart logic
    console.log("Added to cart:", {
      product,
      quantity,
      selectedSize,
      selectedColor,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">Detail Produk</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon icon="mdi:close" className="text-2xl" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#57595B]"></div>
            </div>
          ) : product ? (
            <div className="md:flex">
              {/* Left - Image */}
              <div className="md:w-1/2 p-6">
                <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    src={product.foto || "/placeholder.jpg"}
                    alt={product.nama_produk}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right - Details */}
              <div className="md:w-1/2 p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {product.nama_produk}
                </h3>
                <p className="text-gray-600 mb-4">{product.deskripsi}</p>

                {/* Size Selection */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Pilih Ukuran</h4>
                  <div className="flex gap-2">
                    {["XS", "S", "M", "L", "XL"].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-lg ${
                          selectedSize === size
                            ? "bg-[#57595B] text-white border-[#57595B]"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Pilih Warna</h4>
                  <div className="flex gap-3">
                    {[
                      "#57595B",
                      "#3a3c3e",
                      "#ffffff",
                      "#e53e3e",
                      "#3182ce",
                    ].map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 ${
                          selectedColor === color
                            ? "border-gray-800"
                            : "border-gray-300"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-6">
                  <h4 className="font-semibold mb-3">Jumlah</h4>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Icon icon="mdi:minus" />
                    </button>
                    <span className="text-xl font-semibold">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 rounded-lg border flex items-center justify-center hover:bg-gray-100"
                    >
                      <Icon icon="mdi:plus" />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleAddToCart}
                    className="w-full py-3 bg-[#57595B] text-white font-semibold rounded-lg hover:bg-[#3a3c3e] transition-colors"
                  >
                    Tambah ke Keranjang
                  </button>
                  <button
                    onClick={() => {
                      // WhatsApp order logic
                      window.open(
                        `https://wa.me/6281234567890?text=${encodeURIComponent(
                          `Halo, saya ingin memesan:\nProduk: ${product.nama_produk}\nUkuran: ${selectedSize}\nWarna: ${selectedColor}\nJumlah: ${quantity}`
                        )}`,
                        "_blank"
                      );
                    }}
                    className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Icon icon="mdi:whatsapp" />
                    Pesan via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center">
              <p className="text-gray-500">Produk tidak ditemukan</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
