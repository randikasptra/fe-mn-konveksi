import React from "react";
import { Link } from "react-router-dom";
import {
  ShieldExclamationIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const Unauthorized = () => {
  const user = JSON.parse(localStorage.getItem("mn_user") || "{}");
  const isAdmin = user?.role?.toLowerCase().includes("admin");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <ShieldExclamationIcon className="w-24 h-24 text-yellow-500 mx-auto" />
        <h1 className="text-4xl font-bold text-gray-800 mt-6">Akses Ditolak</h1>
        <p className="text-gray-600 mt-2 max-w-md mx-auto">
          Maaf, Anda tidak memiliki izin untuk mengakses halaman ini.
          {isAdmin
            ? " Anda memerlukan hak akses administrator untuk mengakses halaman ini."
            : " Silakan login sebagai administrator untuk melanjutkan."}
        </p>

        <div className="mt-8">
          <Link
            to={isAdmin ? "/admin/dashboard" : "/"}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#57595B] text-white rounded-lg hover:bg-[#3a3c3e] transition-colors"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Kembali ke {isAdmin ? "Dashboard" : "Beranda"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
