// src/pages/LoginPage.tsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({
    email: "",
    password: "",
    unit_id: "" // untuk pilihan fakultas/jurusan
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Mock data fakultas/unit (nanti bisa dari API)
  const units = [
    { id: 1, name: "Fakultas Teknik" },
    { id: 2, name: "Fakultas Ilmu Komputer" },
    { id: 3, name: "Fakultas Ekonomi" },
    { id: 4, name: "Administrasi Universitas" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || !form.unit_id) {
      setError("Harap lengkapi semua bidang");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          unit_id: parseInt(form.unit_id),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login gagal");
      }

      // Simpan token dan user data
      localStorage.setItem("univ_token", data.token);
      localStorage.setItem("univ_user", JSON.stringify(data.user));
      localStorage.setItem("univ_unit_id", form.unit_id);

      // Trigger event untuk update context/header
      window.dispatchEvent(new Event("authChanged"));

      // Redirect ke halaman sebelumnya atau dashboard
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat login");
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (role: "admin" | "user" | "dosen") => {
    const demos = {
      admin: { email: "admin@univ.ac.id", password: "admin123", unit_id: "4" },
      dosen: { email: "dosen@univ.ac.id", password: "dosen123", unit_id: "2" },
      user: { email: "mahasiswa@univ.ac.id", password: "mhs123", unit_id: "1" },
    };
    setForm(demos[role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left - Hero Section */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white p-12 hidden lg:flex flex-col justify-center">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <AcademicCapIcon className="h-12 w-12" />
                <h1 className="text-3xl font-bold">CMS Universitas</h1>
              </div>
              <p className="text-blue-100 text-lg">
                Sistem Manajemen Konten Terpadu untuk Civitas Akademika
              </p>
            </div>

            <div className="space-y-6">
              <FeatureItem
                title="Akses Terpadu"
                description="Satu akun untuk semua layanan kampus"
              />
              <FeatureItem
                title="Manajemen Konten"
                description="Kelola artikel, pengumuman, dan informasi kampus"
              />
              <FeatureItem
                title="Kolaborasi Efisien"
                description="Kerja sama antar fakultas dan unit"
              />
            </div>

            <div className="mt-12 pt-8 border-t border-blue-500">
              <p className="text-sm text-blue-200">
                Masalah login? Hubungi UPT TIK di ext. 1234
              </p>
            </div>
          </div>

          {/* Right - Login Form */}
          <div className="p-8 md:p-12">
            <div className="mb-10">
              <h2 className="text-3xl font-bold text-gray-900">Selamat Datang</h2>
              <p className="text-gray-600 mt-2">Masuk ke akun Anda</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Unit/Fakultas Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit / Fakultas *
                </label>
                <select
                  value={form.unit_id}
                  onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                >
                  <option value="">Pilih unit/fakultas</option>
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Kampus *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="nama@univ.ac.id"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition pr-12"
                    placeholder="Masukkan password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Demo Buttons */}
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("admin")}
                  className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                >
                  Demo Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("dosen")}
                  className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                >
                  Demo Dosen
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoCredentials("user")}
                  className="px-4 py-2 text-sm bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                >
                  Demo Mahasiswa
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </button>

              {/* Register Link */}
              <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                  Belum punya akun?{" "}
                  <Link
                    to="/register"
                    className="text-blue-600 font-semibold hover:text-blue-800 hover:underline"
                  >
                    Daftar di sini
                  </Link>
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  <Link to="/forgot-password" className="hover:text-blue-600">
                    Lupa password?
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

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1">
        <div className="h-2 w-2 rounded-full bg-blue-400" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-blue-200 text-sm">{description}</p>
      </div>
    </div>
  );
}