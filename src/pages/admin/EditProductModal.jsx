import React, { useEffect, useState } from "react";

export default function EditProductModal({ open, onClose, product, onSuccess }) {
  const token = localStorage.getItem("mn_token");
  const [loading, setLoading] = useState(false);
  const [foto, setFoto] = useState(null);

  const [form, setForm] = useState({
    nama_produk: "",
    harga: "",
    estimasi_pengerjaan: "",
    bahan: "",
    deskripsi: "",
  });

  useEffect(() => {
    if (product) {
      setForm({
        nama_produk: product.nama_produk || "",
        harga: product.harga || "",
        estimasi_pengerjaan: product.estimasi_pengerjaan || "",
        bahan: product.bahan || "",
        deskripsi: product.deskripsi || "",
      });
    }
  }, [product]);

  if (!open || !product) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (foto) formData.append("foto", foto);

      const res = await fetch(
        `https://be-mn-konveksi.vercel.app/api/produk/${product.id_produk}`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-full max-w-lg rounded-xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">Edit Produk</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Nama Produk"
            value={form.nama_produk}
            onChange={(e) =>
              setForm({ ...form, nama_produk: e.target.value })
            }
            required
          />

          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Harga"
            value={form.harga}
            onChange={(e) =>
              setForm({ ...form, harga: e.target.value })
            }
            required
          />

          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            placeholder="Estimasi (Hari)"
            value={form.estimasi_pengerjaan}
            onChange={(e) =>
              setForm({ ...form, estimasi_pengerjaan: e.target.value })
            }
            required
          />

          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Bahan"
            value={form.bahan}
            onChange={(e) =>
              setForm({ ...form, bahan: e.target.value })
            }
          />

          <input type="file" onChange={(e) => setFoto(e.target.files[0])} />

          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            placeholder="Deskripsi"
            value={form.deskripsi}
            onChange={(e) =>
              setForm({ ...form, deskripsi: e.target.value })
            }
          />

          <button
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-full"
          >
            {loading ? "Menyimpan..." : "Update Produk"}
          </button>
        </form>
      </div>
    </div>
  );
}
