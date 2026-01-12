// src/pages/admin/ProductsAdmin.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
    Search,
    Plus,
    FileEdit,
    Trash2,
    Package,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Tag,
    Hash,
    DollarSign,
    Calendar,
    TrendingUp,
    AlertCircle,
    Layers
} from 'lucide-react'

import AddProductModal from './AddProductModal'
import EditProductModal from './EditProductModal'

const API_BASE = 'https://be-mn-konveksi.vercel.app/api'

export default function ProductsAdmin() {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [stats, setStats] = useState({
        total: 0,
        avgPrice: 0,
        lastUpdated: null,
    })

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

            // Calculate stats
            if (json.data && json.data.length > 0) {
                const total = json.data.length
                const avgPrice =
                    json.data.reduce((sum, p) => sum + (p.harga || 0), 0) /
                    total
                setStats({
                    total,
                    avgPrice,
                    lastUpdated: new Date().toLocaleDateString('id-ID'),
                })
            }
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
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6'>
            {/* HEADER */}
            <div className='mb-8'>
                <div className='flex items-center justify-between mb-6'>
                    <div className='flex items-center gap-4'>
                        <div className='p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg'>
                            <Package className='w-7 h-7 text-white' />
                        </div>
                        <div>
                            <h1 className='text-3xl font-bold text-gray-900'>
                                Manajemen Produk
                            </h1>
                            <p className='text-gray-500 mt-1'>
                                Kelola katalog produk konveksi Anda
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setOpenAdd(true)}
                        className='inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group'
                    >
                        <Plus className='w-5 h-5 group-hover:rotate-90 transition-transform duration-300' />
                        <span>Tambah Produk Baru</span>
                    </button>
                </div>

                {/* STATS CARDS */}
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
                    <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-gray-500 font-medium mb-1'>
                                    Total Produk
                                </p>
                                <p className='text-3xl font-bold text-gray-900'>
                                    {stats.total}
                                </p>
                            </div>
                            <div className='p-3 bg-blue-50 rounded-xl'>
                                <Package className='w-6 h-6 text-blue-600' />
                            </div>
                        </div>
                    </div>

                    <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-gray-500 font-medium mb-1'>
                                    Rata-rata Harga
                                </p>
                                <p className='text-3xl font-bold text-gray-900'>
                                    Rp{' '}
                                    {stats.avgPrice.toLocaleString('id-ID', {
                                        maximumFractionDigits: 0,
                                    })}
                                </p>
                            </div>
                            <div className='p-3 bg-green-50 rounded-xl'>
                                <DollarSign className='w-6 h-6 text-green-600' />
                            </div>
                        </div>
                        <div className='mt-4 flex items-center gap-2 text-sm text-gray-500'>
                            <TrendingUp className='w-4 h-4 text-blue-500' />
                            <span>Harga terkini</span>
                        </div>
                    </div>

                    <div className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100'>
                        <div className='flex items-center justify-between'>
                            <div>
                                <p className='text-sm text-gray-500 font-medium mb-1'>
                                    Terakhir Diperbarui
                                </p>
                                <p className='text-3xl font-bold text-gray-900'>
                                    {stats.lastUpdated || '-'}
                                </p>
                            </div>
                            <div className='p-3 bg-purple-50 rounded-xl'>
                                <Calendar className='w-6 h-6 text-purple-600' />
                            </div>
                        </div>
                        <div className='mt-4 flex items-center gap-2 text-sm text-gray-500'>
                            <AlertCircle className='w-4 h-4 text-amber-500' />
                            <span>Update secara berkala</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* SEARCH & FILTER BAR */}
            <div className='mb-6'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-4'>
                    <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
                        <div className='relative w-full md:w-auto flex-1'>
                            <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
                            <input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder='Cari produk berdasarkan nama...'
                                className='w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm transition-all duration-300'
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* PRODUCTS TABLE */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                <div className='px-6 py-5 border-b border-gray-100'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                        Daftar Produk
                    </h2>
                    <p className='text-gray-500 text-sm mt-1'>
                        {filtered.length} produk ditemukan dari total{' '}
                        {products.length}
                    </p>
                </div>

                <div className='overflow-x-auto'>
                    <table className='w-full'>
                        <thead className='bg-gradient-to-r from-gray-50 to-gray-100'>
                            <tr>
                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                    <div className='flex items-center gap-2'>
                                        <Package className='w-4 h-4' />
                                        Produk
                                    </div>
                                </th>

                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                    <div className='flex items-center gap-2'>
                                        <Tag className='w-4 h-4' />
                                        Harga
                                    </div>
                                </th>

                                {/* BAHAN */}
                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                    <div className='flex items-center gap-2'>
                                        <Layers className='w-4 h-4' />
                                        Bahan
                                    </div>
                                </th>

                                <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                    Deskripsi
                                </th>

                                <th className='px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                    Aksi
                                </th>
                            </tr>
                        </thead>

                        <tbody className='divide-y divide-gray-100'>
                            {loading ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className='px-6 py-12 text-center'
                                    >
                                        <div className='flex flex-col items-center justify-center gap-3'>
                                            <div className='w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin'></div>
                                            <p className='text-gray-500'>
                                                Memuat data produk...
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className='px-6 py-12 text-center'
                                    >
                                        <div className='flex flex-col items-center justify-center gap-3'>
                                            <Package className='w-16 h-16 text-gray-300' />
                                            <div>
                                                <p className='text-gray-500 font-medium'>
                                                    Tidak ada produk ditemukan
                                                </p>
                                                <p className='text-gray-400 text-sm mt-1'>
                                                    {query
                                                        ? `Tidak ada hasil untuk "${query}"`
                                                        : 'Tambahkan produk pertama Anda'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((p) => (
                                    <tr
                                        key={p.id_produk}
                                        className='hover:bg-gray-50/50 transition-colors duration-150 group'
                                    >
                                        {/* PRODUK */}
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center gap-4'>
                                                <div className='relative'>
                                                    <div className='w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden shadow-sm'>
                                                        {p.foto ? (
                                                            <img
                                                                src={p.foto}
                                                                alt={
                                                                    p.nama_produk
                                                                }
                                                                className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-300'
                                                            />
                                                        ) : (
                                                            <div className='w-full h-full flex items-center justify-center'>
                                                                <Package className='w-6 h-6 text-gray-400' />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className='absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                                                </div>

                                                <div>
                                                    <h3 className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                                                        {p.nama_produk}
                                                    </h3>
                                                </div>
                                            </div>
                                        </td>

                                        {/* HARGA */}
                                        <td className='px-6 py-4'>
                                            <p className='font-bold text-gray-900 text-lg'>
                                                Rp{' '}
                                                {p.harga?.toLocaleString(
                                                    'id-ID'
                                                )}
                                            </p>
                                            <p className='text-xs text-gray-500'>
                                                Harga satuan
                                            </p>
                                        </td>

                                        {/* BAHAN */}
                                        <td className='px-6 py-4'>
                                            <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-50 text-amber-700 text-sm font-medium'>
                                                {p.bahan || '—'}
                                            </div>
                                        </td>

                                        {/* DESKRIPSI */}
                                        <td className='px-6 py-4'>
                                            <p className='text-gray-600 line-clamp-2 max-w-xs'>
                                                {p.deskripsi ||
                                                    'Tidak ada deskripsi'}
                                            </p>
                                        </td>

                                        {/* AKSI */}
                                        <td className='px-6 py-4'>
                                            <div className='flex items-center justify-end gap-2'>
                                                <button
                                                    onClick={() => {
                                                        setSelectedProduct(p)
                                                        setOpenEdit(true)
                                                    }}
                                                    className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-200 transition-all'
                                                >
                                                    <FileEdit className='w-4 h-4' />
                                                    Edit
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            p.id_produk
                                                        )
                                                    }
                                                    className='inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-red-50 to-red-100 text-red-700 hover:from-red-100 hover:to-red-200 transition-all'
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
