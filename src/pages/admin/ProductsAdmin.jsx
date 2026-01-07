// src/pages/admin/ProductsAdmin.jsx
import React, { useEffect, useMemo, useState } from "react";
import { MdSearch, MdAdd, MdEdit, MdDelete } from "react-icons/md";
import AddProductModal from "./AddProductModal"; // 🔴 PERBAIKI PATH
import EditProductModal from "./EditProductModal"; // 🔴 PERBAIKI PATH

const API_BASE = "https://be-mn-konveksi.vercel.app/api";

export default function ProductsAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  async function fetchProducts() {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/produk`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.message);
      setProducts(json.data || []);
    } catch (err) {
      console.error("Fetch produk error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  async function handleDelete(id) {
    if (!window.confirm("Hapus produk ini?")) return;

    try {
      const token = localStorage.getItem("mn_token");
      const res = await fetch(`${API_BASE}/produk/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.message);

      setProducts((prev) => prev.filter((p) => p.id_produk !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  const filtered = useMemo(() => {
    return products.filter((p) =>
      p.nama_produk.toLowerCase().includes(query.toLowerCase())
    );
  }, [products, query]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Produk</h2>
          <p className="text-sm text-gray-500">Kelola produk konveksi</p>
        </div>

        <button
          onClick={() => setOpenAdd(true)}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800"
        >
          <MdAdd />
          Tambah Produk
        </button>
      </div>

      {/* SEARCH */}
      <div className="relative">
        <MdSearch className="absolute left-3 top-3 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari produk..."
          className="pl-10 pr-4 py-2 border rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-black/20"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-5 py-3 text-left">Produk</th>
              <th className="px-5 py-3 text-left">Harga</th>
              <th className="px-5 py-3 text-left">Estimasi</th>
              <th className="px-5 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  Memuat data...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-400">
                  Tidak ada produk
                </td>
              </tr>
            ) : (
              filtered.map((p) => (
                <tr key={p.id_produk} className="border-t hover:bg-gray-50">
                  <td className="px-5 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                      {p.foto && (
                        <img
                          src={p.foto}
                          alt={p.nama_produk}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        {p.nama_produk}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">
                        {p.deskripsi}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    Rp {p.harga?.toLocaleString("id-ID")}
                  </td>

                  <td className="px-5 py-4 text-gray-700">
                    {p.estimasi_pengerjaan} Hari
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setOpenEdit(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      <MdEdit size={18} />
                    </button>

                    <button
                      onClick={() => handleDelete(p.id_produk)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <MdDelete size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODALS */}
      <AddProductModal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        onSuccess={fetchProducts}
      />

      <EditProductModal
        open={openEdit}
        onClose={() => {
          setOpenEdit(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        onSuccess={fetchProducts}
      />
    </div>
  );
}