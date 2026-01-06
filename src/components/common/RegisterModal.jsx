import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function RegisterModal({ open, onClose, onOpenLogin }) {
  // ✅ HOOK HARUS DI ATAS
  const [form, setForm] = useState({
    nama: "",
    email: "",
    emailConfirm: "",
    no_hp: "",
    password: "",
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

    if (!form.nama || !form.email || !form.password || !form.no_hp) {
      setError("Nama, email, password, dan nomor HP wajib diisi");
      return;
    }

    if (form.email !== form.emailConfirm) {
      setError("Email dan konfirmasi email tidak sama");
      return;
    }

    if (form.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    const no_hp = form.no_hp.replace(/[^0-9]/g, "");

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
            no_hp,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Registrasi gagal");
      }

      setSuccess("Registrasi berhasil, silakan login.");

      setTimeout(() => {
        onClose?.();
        onOpenLogin?.();
      }, 1200);
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
            <Input label="Email*" name="email" onChange={handleChange} />
            <Input label="No HP*" name="no_hp" onChange={handleChange} />
            <Input
              label="Konfirmasi Email*"
              name="emailConfirm"
              onChange={handleChange}
            />
            <Input label="Nama Lengkap*" name="nama" onChange={handleChange} />
            <Input
              label="Password*"
              name="password"
              type="password"
              onChange={handleChange}
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white px-10 py-3 rounded-full text-sm font-medium"
            >
              {loading ? "Memproses..." : "Lanjutkan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, name, type = "text", onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        name={name}
        type={type}
        onChange={onChange}
        className="w-full border border-gray-300 px-3 py-2 text-sm outline-none focus:border-black"
      />
    </div>
  );
}
