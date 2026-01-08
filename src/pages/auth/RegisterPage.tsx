// src/pages/auth/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { Icon } from "@iconify/react";

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    password: "",
    confirm_password: "",
    alamat: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.nama || !form.email) {
        setError("Nama dan email wajib diisi");
        return;
      }
      if (!form.email.includes("@")) {
        setError("Format email tidak valid");
        return;
      }
    }
    
    if (step === 2) {
      if (!form.password || !form.confirm_password) {
        setError("Password dan konfirmasi password wajib diisi");
        return;
      }
      if (form.password !== form.confirm_password) {
        setError("Password dan konfirmasi password tidak sama");
        return;
      }
      if (form.password.length < 6) {
        setError("Password minimal 6 karakter");
        return;
      }
    }
    
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Format nomor HP
    const no_hp = form.no_hp ? form.no_hp.replace(/[^0-9]/g, "") : null;

    setIsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: form.nama,
            email: form.email,
            password: form.password,
            confirm_password: form.confirm_password,
            no_hp,
            alamat: form.alamat || null,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Registrasi gagal");
      }

      setSuccess("Registrasi berhasil! Silakan login dengan akun Anda.");

      // Auto redirect ke login setelah 3 detik
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat registrasi");
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { number: 1, title: "Data Diri" },
    { number: 2, title: "Keamanan" },
    { number: 3, title: "Selesai" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full -translate-y-48 translate-x-48 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-100 to-orange-100 rounded-full translate-y-32 -translate-x-32 opacity-50"></div>
      
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="max-w-5xl w-full bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/30">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Side - Brand & Progress */}
            <div className="bg-gradient-to-b from-indigo-600 via-purple-600 to-indigo-700 p-8 lg:p-12">
              <Link to="/" className="flex items-center gap-3 group mb-12">
                <div className="relative">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform backdrop-blur-sm">
                    <Icon icon="mdi:needle" className="text-white text-2xl" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">MN KONVEKSI</h1>
                  <p className="text-indigo-200 text-sm">Buat Akun Baru</p>
                </div>
              </Link>

              {/* Progress Steps */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-4">Langkah Mudah Bergabung</h2>
                  <p className="text-indigo-200">
                    Ikuti 3 langkah sederhana untuk menjadi bagian dari komunitas MN Konveksi
                  </p>
                </div>

                <div className="space-y-6">
                  {steps.map((s, index) => (
                    <div key={s.number} className="flex items-center gap-4 group">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300
                        ${step > s.number 
                          ? "bg-emerald-500 text-white shadow-lg" 
                          : step === s.number
                          ? "bg-white text-indigo-600 shadow-xl scale-110"
                          : "bg-white/20 text-white/60"
                        }
                      `}>
                        {step > s.number ? (
                          <CheckCircleIcon className="w-6 h-6" />
                        ) : (
                          s.number
                        )}
                      </div>
                      <div>
                        <h3 className={`font-semibold transition-colors ${
                          step >= s.number ? "text-white" : "text-indigo-200"
                        }`}>
                          {s.title}
                        </h3>
                        {index < steps.length - 1 && (
                          <div className={`w-0.5 h-8 ml-5 mt-2 ${
                            step > s.number ? "bg-emerald-400" : "bg-white/20"
                          }`}></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Benefits */}
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 mt-8 border border-white/20">
                  <h4 className="text-white font-semibold mb-3">Keuntungan Member:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-indigo-200 text-sm">
                      <Icon icon="mdi:check-circle" className="text-emerald-300" />
                      <span>Diskon member eksklusif</span>
                    </li>
                    <li className="flex items-center gap-2 text-indigo-200 text-sm">
                      <Icon icon="mdi:check-circle" className="text-emerald-300" />
                      <span>Tracking pesanan real-time</span>
                    </li>
                    <li className="flex items-center gap-2 text-indigo-200 text-sm">
                      <Icon icon="mdi:check-circle" className="text-emerald-300" />
                      <span>Prioritas pelayanan</span>
                    </li>
                    <li className="flex items-center gap-2 text-indigo-200 text-sm">
                      <Icon icon="mdi:check-circle" className="text-emerald-300" />
                      <span>Notifikasi promo khusus</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Middle - Form */}
            <div className="lg:col-span-2 p-8 md:p-12">
              <div className="max-w-lg mx-auto">
                {/* Header */}
                <div className="mb-10">
                  <button
                    onClick={() => step > 1 ? prevStep() : navigate("/login")}
                    className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-8 group"
                  >
                    <ArrowLeftIcon className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                    <span>{step > 1 ? "Kembali" : "Kembali ke Login"}</span>
                  </button>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-3">
                    {step === 1 && "Data Pribadi Anda"}
                    {step === 2 && "Keamanan Akun"}
                    {step === 3 && "Ringkasan Data"}
                  </h2>
                  <p className="text-gray-600">
                    {step === 1 && "Isi data diri Anda untuk memulai"}
                    {step === 2 && "Buat password yang kuat untuk akun Anda"}
                    {step === 3 && "Tinjau data Anda sebelum mendaftar"}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="mb-10">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Langkah {step} dari 3</span>
                    <span className="text-sm font-medium text-indigo-600">{Math.round((step / 3) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Step 1: Personal Data */}
                  {step === 1 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nama Lengkap *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon icon="mdi:account-outline" className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <input
                              name="nama"
                              value={form.nama}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                              placeholder="Masukkan nama lengkap"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon icon="mdi:email-outline" className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <input
                              name="email"
                              type="email"
                              value={form.email}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                              placeholder="contoh@email.com"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            No. WhatsApp
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon icon="mdi:phone-outline" className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <input
                              name="no_hp"
                              value={form.no_hp}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                              placeholder="081234567890"
                            />
                          </div>
                        </div>
                        
                        <div className="md:col-span-2 group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                          <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                              <Icon icon="mdi:map-marker-outline" className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <textarea
                              name="alamat"
                              value={form.alamat}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300 h-32 resize-none"
                              placeholder="Masukkan alamat lengkap"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Step 2: Security */}
                  {step === 2 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon icon="mdi:lock-outline" className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <input
                              name="password"
                              type="password"
                              value={form.password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                              placeholder="Minimal 6 karakter"
                              required
                            />
                          </div>
                          <div className="mt-2">
                            <PasswordStrength password={form.password} />
                          </div>
                        </div>
                        
                        <div className="group">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Konfirmasi Password *
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Icon icon="mdi:lock-check-outline" className="text-gray-400 group-hover:text-indigo-500" />
                            </div>
                            <input
                              name="confirm_password"
                              type="password"
                              value={form.confirm_password}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition group-hover:border-indigo-300"
                              placeholder="Ulangi password"
                              required
                            />
                          </div>
                          {form.password && form.confirm_password && form.password === form.confirm_password && (
                            <div className="mt-2 flex items-center gap-1 text-emerald-600 text-sm">
                              <CheckCircleIcon className="w-4 h-4" />
                              <span>Password cocok</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Password Requirements */}
                      <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-xl p-5 border border-gray-200">
                        <h4 className="font-semibold text-gray-700 mb-3">Kriteria Password yang Baik:</h4>
                        <ul className="space-y-2">
                          <PasswordRequirement 
                            met={form.password.length >= 6}
                            text="Minimal 6 karakter"
                          />
                          <PasswordRequirement 
                            met={/[A-Z]/.test(form.password)}
                            text="Mengandung huruf besar"
                          />
                          <PasswordRequirement 
                            met={/[0-9]/.test(form.password)}
                            text="Mengandung angka"
                          />
                          <PasswordRequirement 
                            met={/[!@#$%^&*]/.test(form.password)}
                            text="Mengandung simbol"
                          />
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Step 3: Review */}
                  {step === 3 && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                            <CheckCircleIcon className="w-6 h-6 text-emerald-600" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">Data Siap Didaftarkan!</h3>
                            <p className="text-sm text-gray-600">Tinjau kembali data Anda sebelum mendaftar</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <DataRow label="Nama Lengkap" value={form.nama} />
                        <DataRow label="Email" value={form.email} />
                        <DataRow label="No. WhatsApp" value={form.no_hp || "-"} />
                        <DataRow label="Alamat" value={form.alamat || "-"} />
                      </div>

                      <div className="p-5 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
                        <h4 className="font-semibold text-indigo-700 mb-2">Dengan mendaftar, Anda setuju:</h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          <li className="flex items-start gap-2">
                            <Icon icon="mdi:check" className="text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>Menyetujui Syarat & Ketentuan penggunaan layanan</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Icon icon="mdi:check" className="text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>Menyetujui Kebijakan Privasi dan pengolahan data</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Icon icon="mdi:check" className="text-indigo-500 mt-0.5 flex-shrink-0" />
                            <span>Bersedia menerima informasi promo dan update</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                          <Icon icon="mdi:alert-circle" className="text-red-600" />
                        </div>
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Icon icon="mdi:check-circle" className="text-green-600" />
                        </div>
                        <div>
                          <p className="text-green-600 font-medium">{success}</p>
                          <p className="text-sm text-green-500 mt-1">Mengarahkan ke halaman login...</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex justify-between pt-8 border-t border-gray-200">
                    {step > 1 ? (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-8 py-3.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Kembali
                      </button>
                    ) : (
                      <div></div>
                    )}
                    
                    {step < 3 ? (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-8 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                      >
                        Lanjutkan
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-xl hover:from-emerald-600 hover:to-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                      >
                        {isLoading ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Memproses...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Icon icon="mdi:check" />
                            Daftar Sekarang
                          </span>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Login Link */}
                  <div className="text-center pt-6">
                    <p className="text-gray-600">
                      Sudah punya akun?{" "}
                      <Link
                        to="/login"
                        className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline"
                      >
                        Masuk di sini
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Komponen Pendukung
function PasswordStrength({ password }: { password: string }) {
  const getStrength = (pass: string) => {
    if (!pass) return { level: 0, text: "", color: "bg-gray-200" };
    
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[!@#$%^&*]/.test(pass)) score++;
    
    if (score <= 1) return { level: score, text: "Lemah", color: "bg-red-500" };
    if (score <= 3) return { level: score, text: "Sedang", color: "bg-amber-500" };
    return { level: score, text: "Kuat", color: "bg-emerald-500" };
  };
  
  const strength = getStrength(password);
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-600">Kekuatan password:</span>
        <span className={`font-medium ${
          strength.text === "Lemah" ? "text-red-600" :
          strength.text === "Sedang" ? "text-amber-600" : "text-emerald-600"
        }`}>
          {strength.text}
        </span>
      </div>
      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.color} transition-all duration-300`}
          style={{ width: `${(strength.level / 5) * 100}%` }}
        ></div>
      </div>
    </div>
  );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
  return (
    <li className="flex items-center gap-2">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
        met ? "bg-emerald-100 text-emerald-600" : "bg-gray-100 text-gray-400"
      }`}>
        {met ? <CheckCircleIcon className="w-4 h-4" /> : <span className="text-xs">○</span>}
      </div>
      <span className={`text-sm ${met ? "text-gray-700" : "text-gray-500"}`}>{text}</span>
    </li>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-100">
      <span className="text-gray-600 font-medium">{label}</span>
      <span className="text-gray-900 font-semibold">{value}</span>
    </div>
  );
}