// src/pages/admin/ProductsAdmin.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { Search, Plus, FileEdit, Trash2, Package } from 'lucide-react'

import AddProductModal from './AddProductModal'
import EditProductModal from './EditProductModal'

const API_BASE = 'https://be-mn-konveksi.vercel.app/api'

export default function ProductsAdmin() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')

    const [openAdd, setOpenAdd] = useState(false)
    const [openEdit, setOpenEdit] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    async function fetchProducts() {
        try {
            setLoading(true)
            const res = await fetch(`${API_BASE}/produk`)
            const json = await res.json()
            if (!res.ok) throw new Error(json.message)
            setProducts(json.data || [])
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProducts()
    }, [])

    async function handleDelete(id) {
        if (!window.confirm('Hapus produk ini?')) return

        try {
            const token = localStorage.getItem('mn_token')
            const res = await fetch(`${API_BASE}/produk/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            setProducts((prev) => prev.filter((p) => p.id_produk !== id))
        } catch (err) {
            alert(err.message)
        }
    }

    const filtered = useMemo(() => {
        return products.filter((p) =>
            p.nama_produk.toLowerCase().includes(query.toLowerCase())
        )
    }, [products, query])

    return (
        <div className='space-y-6'>
            {/* HEADER */}
            <div className='flex items-center justify-between'>
                <div>
                    <h2 className='text-2xl font-bold text-gray-900 flex items-center gap-2'>
                        <Package className='w-6 h-6' />
                        Produk
                    </h2>
                    <p className='text-sm text-gray-500'>
                        Kelola produk konveksi
                    </p>
                </div>

                <button
                    onClick={() => setOpenAdd(true)}
                    className='inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition'
                >
                    <Plus className='w-4 h-4' />
                    Tambah Produk
                </button>
            </div>

            {/* SEARCH */}
            <div className='relative max-w-md'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder='Cari produk...'
                    className='w-full pl-11 pr-4 py-2.5 rounded-xl bg-gray-100 focus:bg-white focus:outline-none focus:ring-2 focus:ring-black/10 text-sm transition'
                />
            </div>

            {/* TABLE */}
            <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                <table className='w-full text-sm'>
                    <thead className='bg-gray-50 text-gray-500'>
                        <tr>
                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase'>
                                Produk
                            </th>
                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase'>
                                Deskripsi
                            </th>
                            <th className='px-6 py-4 text-left text-xs font-semibold uppercase'>
                                Harga
                            </th>
                            <th className='px-6 py-4 text-right text-xs font-semibold uppercase'>
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className='py-12 text-center text-gray-400'
                                >
                                    Memuat data...
                                </td>
                            </tr>
                        ) : filtered.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className='py-12 text-center text-gray-400'
                                >
                                    Tidak ada produk
                                </td>
                            </tr>
                        ) : (
                            filtered.map((p, idx) => (
                                <tr
                                    key={p.id_produk}
                                    className={`hover:bg-gray-50 transition ${
                                        idx !== filtered.length - 1
                                            ? 'border-b border-gray-100'
                                            : ''
                                    }`}
                                >
                                    {/* PRODUK */}
                                    <td className='px-6 py-4'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-10 h-10 rounded-lg bg-gray-100 overflow-hidden'>
                                                {p.foto ? (
                                                    <img
                                                        src={p.foto}
                                                        alt={p.nama_produk}
                                                        className='w-full h-full object-cover'
                                                    />
                                                ) : (
                                                    <div className='w-full h-full flex items-center justify-center text-xs text-gray-400'>
                                                        No Image
                                                    </div>
                                                )}
                                            </div>

                                            <span className='font-semibold text-gray-900'>
                                                {p.nama_produk}
                                            </span>
                                        </div>
                                    </td>

                                    {/* DESKRIPSI */}
                                    <td className='px-6 py-4 text-gray-500 max-w-xs'>
                                        <p className='truncate'>
                                            {p.deskripsi ||
                                                'Tidak ada deskripsi'}
                                        </p>
                                    </td>

                                    {/* HARGA */}
                                    <td className='px-6 py-4 font-medium text-gray-900'>
                                        Rp {p.harga?.toLocaleString('id-ID')}
                                    </td>

                                    {/* AKSI */}
                                    <td className='px-6 py-4 text-right'>
                                        <div className='inline-flex items-center gap-2'>
                                            <button
                                                onClick={() => {
                                                    setSelectedProduct(p)
                                                    setOpenEdit(true)
                                                }}
                                                className='inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition'
                                            >
                                                <FileEdit className='w-4 h-4' />
                                                Edit
                                            </button>

                                            <button
                                                onClick={() =>
                                                    handleDelete(p.id_produk)
                                                }
                                                className='inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition'
                                            >
                                                <Trash2 className='w-4 h-4' />
                                                Hapus
                                            </button>
                                        </div>
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
                    setOpenEdit(false)
                    setSelectedProduct(null)
                }}
                product={selectedProduct}
                onSuccess={fetchProducts}
            />
        </div>
    )
}
