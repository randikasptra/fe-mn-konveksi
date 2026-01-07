import React from "react";
import { Link } from "react-router-dom";
import { HomeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mt-4">
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak ditemukan. Mungkin telah
          dipindahkan atau dihapus.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#57595B] text-white rounded-lg hover:bg-[#3a3c3e] transition-colors"
          >
            <HomeIcon className="w-5 h-5" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Kembali Sebelumnya
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
