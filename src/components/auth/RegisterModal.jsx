import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function RegisterModal({ open, onClose, onOpenLogin }) {
  // ✅ HOOK HARUS DI ATAS
  const [form, setForm] = useState({
    nama: "",
    email: "",
    no_hp: "",
    password: "",
    confirm_password: "",
    alamat: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // ✅ CONDITIONAL RETURN SETELAH HOOK
  if (!open) return null;

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validasi frontend
    if (!form.nama || !form.email || !form.password || !form.confirm_password) {
      setError("Nama, email, password, dan konfirmasi password wajib diisi");
      return;
    }

    if (!form.email.includes("@")) {
      setError("Format email tidak valid");
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

    // Format nomor HP (opsional)
    const no_hp = form.no_hp ? form.no_hp.replace(/[^0-9]/g, "") : null;

    setLoading(true);

    try {
      const res = await fetch(
        "https://be-mn-konveksi.vercel.app/api/auth/register",
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

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Registrasi gagal");
      }

      setSuccess("Registrasi berhasil, silakan login.");

      // Reset form setelah sukses
      setForm({
        nama: "",
        email: "",
        no_hp: "",
        password: "",
        confirm_password: "",
        alamat: ""
      });

      // Auto redirect ke login setelah 2 detik
      setTimeout(() => {
        onClose?.();
        onOpenLogin?.();
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-5xl rounded-2xl p-8 relative shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h2 className="text-xl font-semibold text-gray-900">Buat akunmu</h2>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input 
              label="Nama Lengkap*" 
              name="nama" 
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
            />
            
            <Input 
              label="Email*" 
              name="email" 
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="contoh@email.com"
            />
            
            <Input 
              label="Password*" 
              name="password" 
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
            />
            
            <Input
              label="Konfirmasi Password*"
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Ulangi password"
            />
            
            <Input 
              label="No HP" 
              name="no_hp" 
              value={form.no_hp}
              onChange={handleChange}
              placeholder="081234567890 (opsional)"
            />
            
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Alamat</label>
              <textarea
                name="alamat"
                value={form.alamat}
                onChange={handleChange}
                className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black h-20 resize-none"
                placeholder="Masukkan alamat lengkap (opsional)"
              />
            </div>
          </div>

          <div className="text-sm text-gray-500">
            <p>* Wajib diisi</p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-600">{success}</p>
            </div>
          )}

          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onOpenLogin}
              className="text-sm text-gray-600 hover:text-black"
            >
              Sudah punya akun? <span className="font-semibold">Login</span>
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-10 py-3 rounded-full text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", value, onChange, placeholder }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black rounded-md"
      />
    </div>
  );
}