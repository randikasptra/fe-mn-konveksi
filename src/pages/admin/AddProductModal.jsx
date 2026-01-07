// src/pages/admin/AddProductModal.jsx
import React, { useState } from "react";

export default function AddProductModal({ open, onClose, onSuccess }) {
  const token = localStorage.getItem("mn_token");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    nama_produk: "",
    harga: "",
    estimasi_pengerjaan: "",
    bahan: "",
    deskripsi: "",
  });

  const [foto, setFoto] = useState(null);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("nama_produk", form.nama_produk);
      formData.append("harga", form.harga);
      formData.append("estimasi_pengerjaan", form.estimasi_pengerjaan);
      formData.append("bahan", form.bahan);
      formData.append("deskripsi", form.deskripsi);

      if (foto) {
        formData.append("foto", foto);
      }

      const res = await fetch(
        "https://be-mn-konveksi.vercel.app/api/produk",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message || "Gagal menambahkan produk");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-black"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Tambah Produk</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nama Produk"
            value={form.nama_produk}
            onChange={(e) => setForm({ ...form, nama_produk: e.target.value })}
            required
          />

          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Harga"
            value={form.harga}
            onChange={(e) => setForm({ ...form, harga: e.target.value })}
            required
          />

          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Estimasi Pengerjaan (Hari)"
            value={form.estimasi_pengerjaan}
            onChange={(e) => setForm({ ...form, estimasi_pengerjaan: e.target.value })}
            required
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Bahan (misal: Drill, Canvas)"
            value={form.bahan}
            onChange={(e) => setForm({ ...form, bahan: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto Produk
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFoto(e.target.files[0])}
              className="w-full"
            />
          </div>

          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Deskripsi Produk"
            value={form.deskripsi}
            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}