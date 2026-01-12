// src/pages/admin/AddProductModal.jsx
import React, { useState } from 'react'
import {
    X,
    Package,
    ImagePlus,
    Loader2,
    Save,
    Tag,
    DollarSign,
    FileText,
    Layers,
    Sparkles,
    Upload,
    CheckCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'

export default function AddProductModal({ open, onClose, onSuccess }) {
    const token = localStorage.getItem('mn_token')
    const [loading, setLoading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)

    const [form, setForm] = useState({
        nama_produk: '',
        harga: '',
        bahan: '',
        deskripsi: '',
    })

    const [foto, setFoto] = useState(null)
    const [preview, setPreview] = useState(null)

    if (!open) return null

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setFoto(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result)
            }
            reader.readAsDataURL(file)

            // Simulate upload progress
            let progress = 0
            const interval = setInterval(() => {
                progress += 10
                setUploadProgress(progress)
                if (progress >= 100) {
                    clearInterval(interval)
                }
            }, 50)
        }
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
                'https://be-mn-konveksi.vercel.app/api/produk',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    body: formData,
                }
            )

            const json = await res.json()
            if (!res.ok) throw new Error(json.message)

            toast.success('Produk berhasil ditambahkan')
            onSuccess()
            onClose()
        } catch (err) {
            toast.error(err.message || 'Gagal menambahkan produk')
        } finally {
            setLoading(false)
            setUploadProgress(0)
        }
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto py-6'>
            {/* BACKDROP */}
            <div
                className='fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-md'
                onClick={onClose}
            />

            {/* MODAL */}
            <div className='relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 my-auto'>
                {/* HEADER */}
                <div className='bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-white/20 rounded-xl backdrop-blur-sm'>
                                <Package className='w-5 h-5 text-white' />
                            </div>
                            <div>
                                <h2 className='text-lg font-semibold text-white'>
                                    Tambah Produk Baru
                                </h2>
                                <p className='text-blue-100 text-sm'>
                                    Lengkapi detail produk konveksi
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-white/20 rounded-xl transition-colors duration-200'
                        >
                            <X className='w-5 h-5 text-white' />
                        </button>
                    </div>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className='p-6 space-y-5 max-h-[70vh] overflow-y-auto'
                >
                    {/* NAMA PRODUK */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Tag className='w-4 h-4 text-blue-600' />
                            Nama Produk
                        </label>
                        <div className='relative'>
                            <input
                                required
                                className='w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300'
                                placeholder='Contoh: Kaos Polo Cotton Premium'
                                value={form.nama_produk}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        nama_produk: e.target.value,
                                    })
                                }
                            />
                            <Sparkles className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        </div>
                    </div>

                    {/* HARGA */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <DollarSign className='w-4 h-4 text-green-600' />
                            Harga Produk
                        </label>
                        <div className='relative'>
                            <input
                                type='number'
                                required
                                className='w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300'
                                placeholder='50000'
                                value={form.harga}
                                onChange={(e) =>
                                    setForm({ ...form, harga: e.target.value })
                                }
                            />
                            <span className='absolute left-4 top-1/2 -translate-y-1/2 text-gray-400'>
                                Rp
                            </span>
                        </div>
                    </div>

                    {/* BAHAN */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Layers className='w-4 h-4 text-amber-600' />
                            Bahan Produk
                        </label>
                        <div className='relative'>
                            <input
                                className='w-full px-4 py-3 pl-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300'
                                placeholder='Drill, Cotton Combed 30s, Canvas'
                                value={form.bahan}
                                onChange={(e) =>
                                    setForm({ ...form, bahan: e.target.value })
                                }
                            />
                            <Layers className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                        </div>
                    </div>

                    {/* FOTO PRODUK */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <ImagePlus className='w-4 h-4 text-purple-600' />
                            Foto Produk
                        </label>

                        {preview ? (
                            <div className='relative'>
                                <img
                                    src={preview}
                                    alt='Preview'
                                    className='w-full h-48 object-cover rounded-xl border-2 border-dashed border-blue-200'
                                />
                                {uploadProgress > 0 && uploadProgress < 100 && (
                                    <div className='absolute bottom-3 left-3 right-3 bg-white/90 backdrop-blur-sm rounded-full overflow-hidden'>
                                        <div
                                            className='h-2 bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-300'
                                            style={{
                                                width: `${uploadProgress}%`,
                                            }}
                                        />
                                    </div>
                                )}
                                <div className='absolute top-3 right-3'>
                                    <button
                                        type='button'
                                        onClick={() => {
                                            setFoto(null)
                                            setPreview(null)
                                            setUploadProgress(0)
                                        }}
                                        className='p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
                                    >
                                        <X className='w-4 h-4' />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <label className='block'>
                                <div className='border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer group'>
                                    <div className='flex flex-col items-center justify-center gap-3'>
                                        <div className='p-3 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl group-hover:scale-110 transition-transform duration-300'>
                                            <Upload className='w-6 h-6 text-blue-600' />
                                        </div>
                                        <div>
                                            <p className='font-medium text-gray-700'>
                                                Upload Foto Produk
                                            </p>
                                            <p className='text-sm text-gray-500 mt-1'>
                                                PNG, JPG (max. 5MB)
                                            </p>
                                        </div>
                                    </div>
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

                    {/* DESKRIPSI */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <FileText className='w-4 h-4 text-emerald-600' />
                            Deskripsi Produk
                        </label>
                        <div className='relative'>
                            <textarea
                                rows={4}
                                className='w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all duration-300 resize-none'
                                placeholder='Deskripsi lengkap produk...\n• Material berkualitas\n• Jahitan rapi\n• Tersedia berbagai ukuran'
                                value={form.deskripsi}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        deskripsi: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className='flex items-center gap-3 pt-4'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors duration-300'
                        >
                            Batal
                        </button>
                        <button
                            disabled={loading}
                            className='flex-1 inline-flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-300 group'
                        >
                            {loading ? (
                                <>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <Save className='w-5 h-5 group-hover:scale-110 transition-transform' />
                                    <span>Simpan</span>
                                    <CheckCircle className='w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity' />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                {/* FOOTER NOTES */}
                <div className='px-6 py-4 bg-gray-50 border-t border-gray-100'>
                    <div className='flex items-center gap-2 text-sm text-gray-500'>
                        <Package className='w-4 h-4' />
                        <span>
                            Pastikan data produk sudah benar sebelum disimpan
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
