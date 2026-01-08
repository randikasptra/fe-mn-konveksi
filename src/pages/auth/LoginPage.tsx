// src/pages/auth/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

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
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.message || "Login gagal");
      }

      if (!result.token || !result.data) {
        throw new Error("Response login tidak valid");
      }

      // Simpan token dan user data sesuai dengan struktur MN Konveksi
      localStorage.setItem("mn_token", result.token);
      localStorage.setItem("mn_user", JSON.stringify(result.data));

      // Trigger event untuk update navbar
      window.dispatchEvent(new Event("authChanged"));

      // Cek role untuk redirect
      const userRole = (result.data.role || "").toString().toLowerCase();
      
      // Redirect sesuai role
      if (userRole.includes("admin")) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        // Untuk user biasa, redirect ke halaman sebelumnya atau home
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk mengisi demo credentials
  // const fillDemoCredentials = (role: "admin" | "user") => {
  //   const demos = {
  //     admin: { email: "admin@konveksi.test", password: "password123" },
  //     user: { email: "user@konveksi.test", password: "password123" },
  //   };
  //   setForm(demos[role]);
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=2070')] bg-cover bg-center opacity-10"></div>
      
      {/* Animated Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full translate-x-48 translate-y-48"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          
          {/* Left Section - Visual */}
          <div className="relative bg-gradient-to-br from-indigo-900 via-purple-900 to-gray-900 p-12 hidden lg:flex flex-col justify-between overflow-hidden">
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 border-2 border-white/30 rounded-full"></div>
              <div className="absolute bottom-10 right-10 w-48 h-48 border-2 border-white/20 rounded-full"></div>
            </div>
            
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
                  <h2 className="text-4xl font-bold text-white mb-4">Selamat Datang Kembali</h2>
                  <p className="text-indigo-200 text-lg">
                    Masuk untuk mengakses akun Anda dan lanjutkan pengalaman berbelanja yang personal.
                  </p>
                </div>

                <div className="space-y-6">
                  <FeatureItem
                    icon="mdi:truck-fast"
                    title="Pesanan Cepat"
                    description="Proses pengiriman yang efisien"
                  />
                  <FeatureItem
                    icon="mdi:shield-check"
                    title="Transaksi Aman"
                    description="Sistem keamanan terenkripsi"
                  />
                  <FeatureItem
                    icon="mdi:account-group"
                    title="Support 24/7"
                    description="Tim kami siap membantu Anda"
                  />
                </div>
              </div>
            </div>

            {/* Testimonial */}
            <div className="relative z-10 mt-12 p-6 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">SR</span>
                </div>
                <div>
                  <h4 className="text-white font-semibold">Sarah Regina</h4>
                  <p className="text-indigo-200 text-sm">Pelanggan Setia</p>
                </div>
              </div>
              <p className="text-white/90 italic">
                "Kualitas jahitan premium dan pelayanan yang sangat memuaskan. Sudah 2 tahun menjadi pelanggan!"
              </p>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="p-8 md:p-12 lg:p-16">
            <div className="mb-10">
              <div className="flex justify-between items-center mb-8">
                <div className="lg:hidden">
                  <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <Icon icon="mdi:needle" className="text-white text-xl" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">MN KONVEKSI</span>
                  </Link>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Belum punya akun?</p>
                  <Link 
                    to="/register" 
                    className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-800 group"
                  >
                    Daftar di sini
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-gray-900 mb-3">Masuk ke Akun</h2>
              <p className="text-gray-600">Gunakan akun Anda untuk mengakses semua fitur</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon icon="mdi:email-outline" className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                    placeholder="nama@email.com"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="group">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon icon="mdi:lock-outline" className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full pl-10 pr-12 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember & Forgot */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Ingat saya
                  </label>
                </div>
                <Link to="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                  Lupa password?
                </Link>
              </div>

              {/* Demo Buttons */}

              {error && (
                <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl animate-shake">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <Icon icon="mdi:alert-circle" className="text-red-600" />
                    </div>
                    <p className="text-red-600 text-sm flex-1">{error}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl active:scale-[0.98] group"
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
                      <span>Masuk ke Akun</span>
                      <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </button>

              {/* Social Login */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Atau masuk dengan</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  className="p-3.5 border border-gray-300 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:google" className="text-red-500 text-xl" />
                  <span className="text-sm font-medium text-gray-700">Google</span>
                </button>
                <button
                  type="button"
                  className="p-3.5 border border-gray-300 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                >
                  <Icon icon="mdi:facebook" className="text-blue-600 text-xl" />
                  <span className="text-sm font-medium text-gray-700">Facebook</span>
                </button>
              </div>

              {/* Register Link */}
              <div className="text-center pt-8 border-t border-gray-200">
                <p className="text-gray-600">
                  Belum punya akun?{" "}
                  <Link
                    to="/register"
                    className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center gap-1 group"
                  >
                    Daftar sekarang
                    <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>
                <p className="text-xs text-gray-500 mt-4">
                  Dengan masuk, Anda menyetujui{" "}
                  <Link to="/terms" className="text-indigo-500 hover:underline">
                    Syarat Layanan
                  </Link>{" "}
                  dan{" "}
                  <Link to="/privacy" className="text-indigo-500 hover:underline">
                    Kebijakan Privasi
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon icon={icon} className="text-indigo-300 text-xl" />
      </div>
      <div>
        <h3 className="text-white font-semibold mb-1">{title}</h3>
        <p className="text-indigo-200 text-sm">{description}</p>
      </div>
    </div>
  );
}