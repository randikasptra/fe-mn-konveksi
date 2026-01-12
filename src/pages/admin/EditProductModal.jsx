import React, { useEffect, useState } from 'react'
import { X, Package, ImagePlus, Loader2, Save } from 'lucide-react'
import { toast } from 'react-toastify'

export default function EditProductModal({
    open,
    onClose,
    product,
    onSuccess,
}) {
    const token = localStorage.getItem('mn_token')
    const [loading, setLoading] = useState(false)

    const [form, setForm] = useState({
        nama_produk: '',
        harga: '',
        bahan: '',
        deskripsi: '',
    })

    const [foto, setFoto] = useState(null)

    useEffect(() => {
        if (product) {
            setForm({
                nama_produk: product.nama_produk || '',
                harga: product.harga || '',
                bahan: product.bahan || '',
                deskripsi: product.deskripsi || '',
            })
            setFoto(null)
        }
    }, [product])

    if (!open || !product) return null

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
            onClose()
        } catch (err) {
            toast.error(err.message || 'Gagal memperbarui produk')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4'>
            <div className='bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden'>
                {/* HEADER */}
                <div className='flex items-center justify-between px-6 py-4 border-b'>
                    <h2 className='text-lg font-semibold text-gray-900 flex items-center gap-2'>
                        <Package className='w-5 h-5 text-indigo-600' />
                        Edit Produk
                    </h2>

                    <button
                        onClick={onClose}
                        className='p-2 rounded-lg hover:bg-gray-100 transition'
                    >
                        <X className='w-4 h-4' />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={handleSubmit}
                    className='p-6 space-y-4'
                >
                    {/* NAMA PRODUK */}
                    <div>
                        <label className='text-sm font-medium text-gray-700'>
                            Nama Produk
                        </label>
                        <input
                            required
                            className='mt-1 w-full px-4 py-2.5 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none text-sm'
                            placeholder='Contoh: Kaos Polo'
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
                        <label className='text-sm font-medium text-gray-700'>
                            Harga
                        </label>
                        <input
                            type='number'
                            required
                            className='mt-1 w-full px-4 py-2.5 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none text-sm'
                            placeholder='50000'
                            value={form.harga}
                            onChange={(e) =>
                                setForm({ ...form, harga: e.target.value })
                            }
                        />
                    </div>

                    {/* BAHAN */}
                    <div>
                        <label className='text-sm font-medium text-gray-700'>
                            Bahan
                        </label>
                        <input
                            className='mt-1 w-full px-4 py-2.5 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none text-sm'
                            placeholder='Drill, Cotton, Canvas'
                            value={form.bahan}
                            onChange={(e) =>
                                setForm({ ...form, bahan: e.target.value })
                            }
                        />
                    </div>

                    {/* FOTO */}
                    <div>
                        <label className='text-sm font-medium text-gray-700'>
                            Foto Produk
                        </label>
                        <label className='mt-1 flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-100 cursor-pointer hover:bg-gray-200 transition text-sm text-gray-600'>
                            <ImagePlus className='w-5 h-5' />
                            {foto
                                ? foto.name
                                : 'Upload gambar produk (opsional)'}
                            <input
                                type='file'
                                accept='image/*'
                                hidden
                                onChange={(e) => setFoto(e.target.files[0])}
                            />
                        </label>
                    </div>

                    {/* DESKRIPSI */}
                    <div>
                        <label className='text-sm font-medium text-gray-700'>
                            Deskripsi
                        </label>
                        <textarea
                            rows={3}
                            className='mt-1 w-full px-4 py-2.5 rounded-xl bg-gray-100 focus:bg-white focus:ring-2 focus:ring-indigo-200 outline-none text-sm resize-none'
                            placeholder='Deskripsi singkat produk'
                            value={form.deskripsi}
                            onChange={(e) =>
                                setForm({
                                    ...form,
                                    deskripsi: e.target.value,
                                })
                            }
                        />
                    </div>

                    {/* SUBMIT */}
                    <button
                        disabled={loading}
                        className='w-full inline-flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition disabled:opacity-50'
                    >
                        {loading ? (
                            <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                            <Save className='w-4 h-4' />
                        )}
                        {loading ? 'Menyimpan...' : 'Update Produk'}
                    </button>
                </form>
            </div>
        </div>
    )
}
