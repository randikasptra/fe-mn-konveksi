// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
import { authService } from "../../services/api"; 
import Logo from "../../assets/LOGO-MN.png"; // ✅ IMPORT LOGO

/* ================= COLOR SCHEME ================= */
const COLORS = {
  primary: {
    light: "#3b82f6",
    dark: "#1d4ed8",
    gradient: "from-blue-500 to-indigo-600",
  },
  status: {
    pending: {
      light: "#f59e0b",
      dark: "#d97706",
      gradient: "from-amber-500 to-orange-500",
    },
    processing: {
      light: "#3b82f6",
      dark: "#1d4ed8",
      gradient: "from-blue-500 to-cyan-500",
    },
    completed: {
      light: "#10b981",
      dark: "#059669",
      gradient: "from-emerald-500 to-teal-500",
    },
    revenue: {
      light: "#8b5cf6",
      dark: "#7c3aed",
      gradient: "from-purple-500 to-violet-600",
    },
  },
};

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ GUNAKAN authService.login() DARI UNIFIED API
      const result = await authService.login({
        email: form.email,
        password: form.password,
      });

      // Validasi response
      if (!result.token || !result.data) {
        throw new Error("Response login tidak valid");
      }

      // Simpan token dan user data
      localStorage.setItem("mn_token", result.token);
      localStorage.setItem("mn_user", JSON.stringify(result.data));
      window.dispatchEvent(new Event("authChanged"));

      // Redirect berdasarkan role
      const userRole = (result.data.role || "").toString().toLowerCase();

      if (userRole.includes("admin")) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      // Error handling yang lebih baik
      const errorMessage = err.response?.data?.message || err.message || "Terjadi kesalahan saat login";
      setError(errorMessage);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4 py-8">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 max-h-[90vh] overflow-y-auto">

          {/* Left Section - Brand & Features */}
          <div className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8 lg:p-12 hidden lg:flex flex-col overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full"></div>

            {/* Content */}
            <div className="relative z-10">
              <Link to="/" className="flex items-center gap-3 group mb-12">
                <div className="relative">
                  {/* Container untuk gambar logo */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl bg-gradient-to-br from-indigo-500 to-purple-600">
                    <img
                      src={Logo} // ✅ MENGGUNAKAN GAMBAR LOGO
                      alt="MN Konveksi Logo"
                      className="w-14 h-14 object-contain p-2"
                    />
                  </div>
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-lg"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">MN KONVEKSI</h1>
                  <p className="text-indigo-200 text-lg">Premium Tailoring</p>
                </div>
              </Link>

              <div className="space-y-8">
                <div>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-4 border border-white/20">
                    <Icon icon="mdi:shield-check" className="text-lg" />
                    Akses Aman & Terenkripsi
                  </div>
                  <h2 className="text-4xl font-bold mb-4 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-100">
                      Selamat Datang
                    </span>
                  </h2>
                  <p className="text-indigo-200 text-lg">
                    Masuk untuk mengelola sistem konveksi Anda dengan lebih efisien.
                  </p>
                </div>

                <div className="space-y-6">
                  <FeatureItem
                    icon="mdi:chart-bar"
                    title="Dashboard Lengkap"
                    description="Monitor semua aktivitas bisnis"
                    gradient={COLORS.primary.gradient}
                  />
                  <FeatureItem
                    icon="mdi:package-variant"
                    title="Kelola Pesanan"
                    description="Pantau status produksi real-time"
                    gradient={COLORS.status.processing.gradient}
                  />
                  <FeatureItem
                    icon="mdi:cash-multiple"
                    title="Analisis Keuangan"
                    description="Laporan pendapatan detail"
                    gradient={COLORS.status.revenue.gradient}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4 text-white/60">
                <Icon icon="mdi:shield-lock" className="text-xl" />
                <span className="text-sm">Sistem terenkripsi dengan standar keamanan tinggi</span>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  {/* Container untuk gambar logo mobile */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
                    <img
                      src={Logo} // ✅ MENGGUNAKAN GAMBAR LOGO
                      alt="MN Konveksi Logo"
                      className="w-10 h-10 object-contain p-1.5"
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">MN KONVEKSI</h1>
                  <p className="text-gray-600 text-sm">Premium Tailoring</p>
                </div>
              </Link>
            </div>

            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Masuk ke Sistem
                  </h2>
                  <p className="text-gray-600 mt-2">Gunakan akun terdaftar untuk melanjutkan</p>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm text-gray-500">Belum punya akun?</p>
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:text-blue-800 group"
                  >
                    Daftar
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Role Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                <div className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100">
                  <Icon icon="mdi:shield-account" className="inline mr-2" />
                  Admin
                </div>
                <div className="px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium border border-emerald-100">
                  <Icon icon="mdi:account-tie" className="inline mr-2" />
                  Production
                </div>
                <div className="px-3 py-1.5 bg-purple-50 text-purple-600 rounded-lg text-sm font-medium border border-purple-100">
                  <Icon icon="mdi:account-cash" className="inline mr-2" />
                  Finance
                </div>
                <div className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium border border-amber-100">
                  <Icon icon="mdi:account-outline" className="inline mr-2" />
                  Customer
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:email-outline" className="inline mr-2 text-gray-400" />
                  Alamat Email
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
                    placeholder="email@domain.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Icon icon="mdi:lock-outline" className="inline mr-2 text-gray-400" />
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Ingat perangkat ini
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:alert-circle" className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-red-600 font-medium">Login Gagal</p>
                      <p className="text-red-500 text-sm mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 bg-gradient-to-r ${COLORS.primary.gradient} text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] group`}
              >
                <div className="flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Memproses...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk ke Sistem</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Security Note */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Icon icon="mdi:shield-check" className="text-blue-500 text-xl mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Keamanan Sistem</p>
                    <p className="text-xs text-gray-600">
                      Login Anda dilindungi dengan enkripsi SSL. Pastikan Anda mengakses dari perangkat yang aman.
                    </p>
                  </div>
                </div>
              </div>

              {/* Register Link (Mobile) */}
              <div className="lg:hidden text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Belum punya akun?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 font-semibold hover:text-blue-800 hover:underline inline-flex items-center gap-1 group"
                  >
                    Daftar sekarang
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
              </div>

              {/* Copyright */}
              <div className="text-center">
                <p className="text-xs text-gray-500">
                  © {new Date().getFullYear()} MN KONVEKSI. Sistem Manajemen Konveksi.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

// Feature Item Component (Tetap menggunakan Icon karena ini untuk fitur, bukan logo)
function FeatureItem({
  icon,
  title,
  description,
  gradient
}: {
  icon: string;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="flex items-start gap-4 group">
      <div className={`w-12 h-12 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        <Icon icon={icon} className="text-white text-xl" />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-indigo-200 text-sm">{description}</p>
      </div>
    </div>
  );
}