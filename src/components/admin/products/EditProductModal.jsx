// src/components/admin/products/EditProductModal.jsx
import React, { useEffect, useState } from 'react'
import { X, Package, ImagePlus, Loader2, Save } from 'lucide-react'
import { toast } from 'react-toastify'

export default function EditProductModal({ open, onClose, product, onSuccess }) {
    const token = localStorage.getItem('mn_token')
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        nama_produk: '',
        harga: '',
        bahan: '',
        deskripsi: '',
    })

    const [foto, setFoto] = useState(null)
    const [previewUrl, setPreviewUrl] = useState(null)

    useEffect(() => {
        if (product) {
            setForm({
                nama_produk: product.nama_produk || '',
                harga: product.harga || '',
                bahan: product.bahan || '',
                deskripsi: product.deskripsi || '',
            })
            setFoto(null)
            setPreviewUrl(product.foto || null)
        }
    }, [product])

    if (!open || !product) return null

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFoto(file)
            // Create preview URL
            const url = URL.createObjectURL(file)
            setPreviewUrl(url)
        }
    }

    const handleClose = () => {
        setFoto(null)
        setPreviewUrl(null)
        onClose()
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            const formData = new FormData()
            formData.append('nama_produk', form.nama_produk)
            formData.append('harga', form.harga)
            formData.append('bahan', form.bahan)
            formData.append('deskripsi', form.deskripsi)
            if (foto) formData.append('foto', foto)

            const res = await fetch(
                `https://be-mn-konveksi.vercel.app/api/produk/${product.id_produk}`,
                {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            )

            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            toast.success('Produk berhasil diperbarui')
            onSuccess()
            handleClose()
        } catch (err) {
            toast.error(err.message || 'Gagal memperbarui produk')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4'>
            <div className='bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden animate-fadeIn'>
                {/* HEADER */}
                <div className='flex items-center justify-between px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50'>
                    <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                        <div className='w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center'>
                            <Package className='w-5 h-5 text-white' />
                        </div>
                        Edit Produk
                    </h2>

                    <button
                        onClick={handleClose}
                        className='p-2 rounded-lg hover:bg-white/80 transition'
                    >
                        <X className='w-5 h-5 text-gray-500' />
                    </button>
                </div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className='p-6'>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {/* LEFT COLUMN */}
                        <div className='space-y-4'>
                            {/* NAMA PRODUK */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Nama Produk <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    required
                                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm transition'
                                    placeholder='Contoh: Kaos Polo Premium'
                                    value={form.nama_produk}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            nama_produk: e.target.value,
                                        })
                                    }
                                />
                            </div>

                            {/* HARGA */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Harga (Rp) <span className='text-red-500'>*</span>
                                </label>
                                <input
                                    type='number'
                                    required
                                    min='0'
                                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm transition'
                                    placeholder='50000'
                                    value={form.harga}
                                    onChange={(e) =>
                                        setForm({ ...form, harga: e.target.value })
                                    }
                                />
                            </div>

                            {/* BAHAN */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Bahan
                                </label>
                                <input
                                    className='w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm transition'
                                    placeholder='Contoh: Cotton Combed 30s'
                                    value={form.bahan}
                                    onChange={(e) =>
                                        setForm({ ...form, bahan: e.target.value })
                                    }
                                />
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className='space-y-4'>
                            {/* FOTO PRODUK */}
                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-2'>
                                    Foto Produk
                                </label>
                                
                                {previewUrl ? (
                                    <div className='relative'>
                                        <img
                                            src={previewUrl}
                                            alt='Preview'
                                            className='w-full h-48 object-cover rounded-xl border-2 border-gray-200'
                                        />
                                        <button
                                            type='button'
                                            onClick={() => {
                                                setFoto(null)
                                                setPreviewUrl(null)
                                            }}
                                            className='absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition'
                                        >
                                            <X className='w-4 h-4' />
                                        </button>
                                        <div className='absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded'>
                                            {foto ? foto.name : 'Foto saat ini'}
                                        </div>
                                    </div>
                                ) : (
                                    <label className='flex flex-col items-center justify-center w-full h-48 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 cursor-pointer hover:bg-gray-100 transition'>
                                        <div className='flex flex-col items-center justify-center py-6'>
                                            <ImagePlus className='w-12 h-12 text-gray-400 mb-3' />
                                            <p className='text-sm text-gray-600 font-medium'>
                                                Upload Gambar Baru
                                            </p>
                                            <p className='text-xs text-gray-400 mt-1'>
                                                PNG, JPG, JPEG (Max 5MB)
                                            </p>
                                        </div>
                                        <input
                                            type='file'
                                            accept='image/*'
                                            hidden
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* DESKRIPSI - FULL WIDTH */}
                    <div className='mt-6'>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Deskripsi Produk
                        </label>
                        <textarea
                            rows={4}
                            className='w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none text-sm resize-none transition'
                            placeholder='Deskripsi detail tentang produk, kualitas, keunggulan, dll.'
                            value={form.deskripsi}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    deskripsi: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* FOOTER BUTTONS */}
                    <div className='flex items-center gap-3 mt-6 pt-6 border-t'>
                        <button
                            type='button'
                            onClick={handleClose}
                            className='flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition'
                        >
                            Batal
                        </button>
                        
                        <button
                            type='submit'
                            disabled={loading}
                            className='flex-1 inline-flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-medium hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {loading ? (
                                <>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    Menyimpan...
                                </>
                            ) : (
                                <>
                                    <Save className='w-5 h-5' />
                                    Update Produk
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}