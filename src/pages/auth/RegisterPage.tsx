// src/pages/RegisterPage.tsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AcademicCapIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    // Step 1: Identitas
    nama_lengkap: "",
    email: "",
    no_telepon: "",
    jenis_kelamin: "",
    
    // Step 2: Akun & Unit
    password: "",
    confirm_password: "",
    unit_id: "",
    role: "mahasiswa", // mahasiswa, dosen, staff
    
    // Step 3: Tambahan untuk mahasiswa
    nim: "",
    program_studi: "",
    angkatan: "",
    
    // Step 3: Tambahan untuk dosen
    nidn: "",
    jabatan: "",
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const units = [
    { id: 1, name: "Fakultas Teknik", programs: ["Teknik Informatika", "Teknik Sipil", "Teknik Elektro"] },
    { id: 2, name: "Fakultas Ilmu Komputer", programs: ["Sistem Informasi", "Ilmu Komputer", "Teknologi Informasi"] },
    { id: 3, name: "Fakultas Ekonomi", programs: ["Manajemen", "Akuntansi", "Ekonomi Pembangunan"] },
    { id: 4, name: "Administrasi Universitas", programs: ["Administrasi"] },
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const validateStep1 = () => {
    if (!form.nama_lengkap.trim()) return "Nama lengkap harus diisi";
    if (!form.email.includes("@") || !form.email.includes(".")) return "Email tidak valid";
    if (form.no_telepon && form.no_telepon.length < 10) return "Nomor telepon tidak valid";
    return "";
  };

  const validateStep2 = () => {
    if (!form.unit_id) return "Pilih unit/fakultas terlebih dahulu";
    if (!form.role) return "Pilih peran Anda";
    if (form.password.length < 8) return "Password minimal 8 karakter";
    if (form.password !== form.confirm_password) return "Konfirmasi password tidak cocok";
    return "";
  };

  const validateStep3 = () => {
    if (form.role === "mahasiswa") {
      if (!form.nim) return "NIM harus diisi";
      if (!form.program_studi) return "Program studi harus dipilih";
      if (!form.angkatan) return "Angkatan harus diisi";
    }
    if (form.role === "dosen" && !form.nidn) return "NIDN harus diisi";
    return "";
  };

  const handleNext = () => {
    setError("");
    let validationError = "";

    if (step === 1) validationError = validateStep1();
    if (step === 2) validationError = validateStep2();
    if (step === 3) validationError = validateStep3();

    if (validationError) {
      setError(validationError);
      return;
    }

    setStep(prev => prev + 1);
  };

  const handleSubmit = async () => {
    setError("");
    setIsLoading(true);

    try {
      // Filter data berdasarkan role
      const payload: any = {
        nama_lengkap: form.nama_lengkap,
        email: form.email,
        no_telepon: form.no_telepon || null,
        jenis_kelamin: form.jenis_kelamin || null,
        password: form.password,
        unit_id: parseInt(form.unit_id),
        role: form.role,
      };

      if (form.role === "mahasiswa") {
        payload.nim = form.nim;
        payload.program_studi = form.program_studi;
        payload.angkatan = parseInt(form.angkatan);
      }

      if (form.role === "dosen") {
        payload.nidn = form.nidn;
        payload.jabatan = form.jabatan || null;
      }

      const response = await fetch("http://localhost:8000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registrasi gagal");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="border-b border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => step > 1 ? setStep(prev => prev - 1) : navigate("/login")}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ArrowLeftIcon className="h-5 w-5 text-gray-600" />
            </button>
            <div className="flex items-center gap-2">
              <AcademicCapIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Registrasi Akun</h1>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  s === step 
                    ? "bg-blue-600 text-white" 
                    : s < step 
                    ? "bg-green-100 text-green-600" 
                    : "bg-gray-100 text-gray-400"
                }`}>
                  {s}
                </div>
                <span className={`text-sm hidden md:inline ${
                  s === step ? "font-semibold text-blue-600" : "text-gray-500"
                }`}>
                  {s === 1 ? "Identitas" : s === 2 ? "Akun" : "Lengkap"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600">{success}</p>
              <p className="text-sm text-green-500 mt-1">Mengarahkan ke halaman login...</p>
            </div>
          )}

          {/* Step 1: Identitas */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Identitas Diri</h2>
              <p className="text-gray-600">Isi data pribadi Anda dengan benar</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Nama Lengkap *"
                  name="nama_lengkap"
                  value={form.nama_lengkap}
                  onChange={handleInputChange}
                  placeholder="Masukkan nama lengkap"
                  required
                />
                
                <InputField
                  label="Email Kampus *"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleInputChange}
                  placeholder="nama@univ.ac.id"
                  required
                />
                
                <InputField
                  label="Nomor Telepon"
                  name="no_telepon"
                  value={form.no_telepon}
                  onChange={handleInputChange}
                  placeholder="08XXXXXXXXXX"
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Kelamin
                  </label>
                  <select
                    name="jenis_kelamin"
                    value={form.jenis_kelamin}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="">Pilih jenis kelamin</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Akun & Unit */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Akun & Unit</h2>
              <p className="text-gray-600">Buat akun dan pilih unit Anda</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Password *"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleInputChange}
                  placeholder="Minimal 8 karakter"
                  required
                />
                
                <InputField
                  label="Konfirmasi Password *"
                  name="confirm_password"
                  type="password"
                  value={form.confirm_password}
                  onChange={handleInputChange}
                  placeholder="Ulangi password"
                  required
                />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit / Fakultas *
                  </label>
                  <select
                    name="unit_id"
                    value={form.unit_id}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                    required
                  >
                    <option value="">Pilih unit/fakultas</option>
                    {units.map(unit => (
                      <option key={unit.id} value={unit.id}>{unit.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peran / Role *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["mahasiswa", "dosen", "staff"].map((roleOption) => (
                      <button
                        key={roleOption}
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, role: roleOption }))}
                        className={`p-4 border rounded-xl text-center transition ${
                          form.role === roleOption
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 hover:border-blue-300"
                        }`}
                      >
                        <div className="text-sm font-medium capitalize">
                          {roleOption === "staff" ? "Staff/Tendik" : roleOption}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Detail Berdasarkan Role */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {form.role === "mahasiswa" 
                  ? "Data Mahasiswa" 
                  : form.role === "dosen" 
                  ? "Data Dosen" 
                  : "Data Tambahan"}
              </h2>
              
              {form.role === "mahasiswa" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="NIM *"
                    name="nim"
                    value={form.nim}
                    onChange={handleInputChange}
                    placeholder="Masukkan NIM"
                    required
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Program Studi *
                    </label>
                    <select
                      name="program_studi"
                      value={form.program_studi}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                      required
                    >
                      <option value="">Pilih program studi</option>
                      {units
                        .find(u => u.id === parseInt(form.unit_id))
                        ?.programs.map((prodi, idx) => (
                          <option key={idx} value={prodi}>{prodi}</option>
                        ))}
                    </select>
                  </div>
                  
                  <InputField
                    label="Angkatan *"
                    name="angkatan"
                    value={form.angkatan}
                    onChange={handleInputChange}
                    placeholder="Contoh: 2023"
                    required
                  />
                </div>
              ) : form.role === "dosen" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField
                    label="NIDN *"
                    name="nidn"
                    value={form.nidn}
                    onChange={handleInputChange}
                    placeholder="Masukkan NIDN"
                    required
                  />
                  
                  <InputField
                    label="Jabatan"
                    name="jabatan"
                    value={form.jabatan}
                    onChange={handleInputChange}
                    placeholder="Contoh: Dosen Tetap"
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">Tidak ada data tambahan yang diperlukan untuk staff.</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-12 flex justify-between items-center">
            <button
              type="button"
              onClick={() => step > 1 ? setStep(prev => prev - 1) : navigate("/login")}
              className="px-8 py-3 border border-gray-300 rounded-xl hover:bg-gray-50"
            >
              {step === 1 ? "Kembali ke Login" : "Sebelumnya"}
            </button>
            
            <button
              type="button"
              onClick={step < 3 ? handleNext : handleSubmit}
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isLoading ? "Memproses..." : step < 3 ? "Selanjutnya" : "Daftar Akun"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              Sudah punya akun?{" "}
              <Link to="/login" className="text-blue-600 font-semibold hover:underline">
                Login di sini
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Dengan mendaftar, Anda menyetujui Ketentuan Layanan dan Kebijakan Privasi kami.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, name, type = "text", value, onChange, placeholder, required = false }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
        required={required}
      />
    </div>
  );
}