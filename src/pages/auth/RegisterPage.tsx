// src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ArrowRightIcon, ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";
import { authService } from "../../services/api"; // ✅ IMPORT DARI UNIFIED API

/* ================= COLOR SCHEME ================= */
const COLORS = {
  primary: {
    gradient: "from-blue-500 to-indigo-600",
  },
  status: {
    completed: {
      gradient: "from-emerald-500 to-teal-500",
    },
    revenue: {
      gradient: "from-purple-500 to-violet-600",
    },
  },
};

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    noTelp: "",
    alamat: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validasi form
    if (!form.nama || !form.email || !form.password || !form.confirmPassword) {
      setError("Semua field wajib diisi");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);

    try {
      // ✅ GUNAKAN authService.register() DARI UNIFIED API
      const result = await authService.register({
        nama: form.nama,
        email: form.email,
        password: form.password,
        noTelp: form.noTelp || undefined,
        alamat: form.alamat || undefined,
      });

      // Registrasi berhasil
      setSuccess(true);

      // Redirect ke login setelah 2 detik
      setTimeout(() => {
        navigate("/login", {
          state: { message: "Registrasi berhasil! Silakan login dengan akun Anda." },
        });
      }, 2000);
    } catch (err: any) {
      // Error handling yang lebih baik
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Terjadi kesalahan saat registrasi";
      setError(errorMessage);
      console.error("Register error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Registrasi Berhasil!</h2>
          <p className="text-gray-600 mb-6">
            Akun Anda telah berhasil dibuat. Anda akan diarahkan ke halaman login...
          </p>
          <div className="flex justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      </div>
    );
  }

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

          {/* Left Section - Brand & Benefits */}
          <div className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 p-8 lg:p-12 hidden lg:flex flex-col overflow-hidden">
            {/* Decorative Elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full"></div>

            {/* Content */}
            <div className="relative z-10">
              <Link to="/" className="flex items-center gap-3 group mb-12">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-xl">
                    <Icon icon="mdi:needle" className="text-white text-3xl" />
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
                    <Icon icon="mdi:account-plus" className="text-lg" />
                    Bergabung dengan Kami
                  </div>
                  <h2 className="text-4xl font-bold mb-4 leading-tight">
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-emerald-100">
                      Mulai Perjalanan Anda
                    </span>
                  </h2>
                  <p className="text-indigo-200 text-lg">
                    Daftar sekarang dan nikmati kemudahan mengelola pesanan konveksi Anda.
                  </p>
                </div>

                <div className="space-y-6">
                  <BenefitItem
                    icon="mdi:rocket-launch"
                    title="Proses Cepat"
                    description="Registrasi hanya dalam hitungan menit"
                    gradient={COLORS.primary.gradient}
                  />
                  <BenefitItem
                    icon="mdi:shield-check"
                    title="Keamanan Terjamin"
                    description="Data Anda dilindungi dengan enkripsi"
                    gradient={COLORS.status.completed.gradient}
                  />
                  <BenefitItem
                    icon="mdi:gift"
                    title="Benefit Eksklusif"
                    description="Akses fitur premium untuk member"
                    gradient={COLORS.status.revenue.gradient}
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative z-10 mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-4 text-white/60">
                <Icon icon="mdi:account-group" className="text-xl" />
                <span className="text-sm">Bergabung dengan ribuan customer yang puas</span>
              </div>
            </div>
          </div>

          {/* Right Section - Register Form */}
          <div className="p-6 sm:p-8 lg:p-12">
            {/* Mobile Header */}
            <div className="lg:hidden mb-8">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Icon icon="mdi:needle" className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border border-white"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">MN KONVEKSI</h1>
                  <p className="text-gray-600 text-sm">Premium Tailoring</p>
                </div>
              </Link>
            </div>

            {/* Back Button */}
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 group"
            >
              <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Kembali ke Login</span>
            </Link>

            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Buat Akun Baru
              </h2>
              <p className="text-gray-600">Isi formulir di bawah untuk mendaftar</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nama Lengkap */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:account" className="inline mr-2 text-gray-400" />
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
                  placeholder="John Doe"
                  required
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:email-outline" className="inline mr-2 text-gray-400" />
                  Alamat Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
                  placeholder="email@domain.com"
                  required
                />
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:lock-outline" className="inline mr-2 text-gray-400" />
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
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
                <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
              </div>

              {/* Confirm Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:lock-check" className="inline mr-2 text-gray-400" />
                  Konfirmasi Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                    className="w-full px-4 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* No Telepon (Optional) */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:phone" className="inline mr-2 text-gray-400" />
                  No. Telepon <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <input
                  type="tel"
                  value={form.noTelp}
                  onChange={(e) => setForm({ ...form, noTelp: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300"
                  placeholder="08123456789"
                />
              </div>

              {/* Alamat (Optional) */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Icon icon="mdi:map-marker" className="inline mr-2 text-gray-400" />
                  Alamat <span className="text-gray-400 text-xs">(Opsional)</span>
                </label>
                <textarea
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition hover:border-blue-300 resize-none"
                  placeholder="Jl. Contoh No. 123, Kota"
                  rows={3}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:alert-circle" className="text-red-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-red-600 font-medium">Registrasi Gagal</p>
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
                      <span>Daftar Sekarang</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Terms */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-xl p-4">
                <p className="text-xs text-gray-600 text-center">
                  Dengan mendaftar, Anda menyetujui{" "}
                  <Link to="/terms" className="text-blue-600 hover:underline font-medium">
                    Syarat & Ketentuan
                  </Link>{" "}
                  serta{" "}
                  <Link to="/privacy" className="text-blue-600 hover:underline font-medium">
                    Kebijakan Privasi
                  </Link>{" "}
                  kami.
                </p>
              </div>

              {/* Login Link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Sudah punya akun?{" "}
                  <Link
                    to="/login"
                    className="text-blue-600 font-semibold hover:text-blue-800 hover:underline inline-flex items-center gap-1 group"
                  >
                    Login sekarang
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

// Benefit Item Component
function BenefitItem({
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