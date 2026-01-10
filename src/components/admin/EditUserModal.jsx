import { User, Mail, Phone, Lock, MapPin, X, Check } from 'lucide-react'

const EditUserModal = ({ open, onClose, formData, onChange, onSubmit }) => {
    if (!open) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm'>
            <div
                className='bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl'
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER */}
                <div className='px-6 py-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-blue-100 rounded-lg'>
                            <User className='w-5 h-5 text-blue-600' />
                        </div>
                        <div>
                            <h3 className='text-xl font-bold text-gray-800'>
                                Edit Pengguna
                            </h3>
                            <p className='text-sm text-gray-600'>
                                Perbarui informasi pengguna
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className='p-2 hover:bg-gray-100 rounded-full transition'
                        aria-label='Tutup'
                    >
                        <X className='w-5 h-5 text-gray-500' />
                    </button>
                </div>

                {/* FORM */}
                <form
                    onSubmit={onSubmit}
                    className='p-6 space-y-5'
                >
                    {/* Nama */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <User className='w-4 h-4 text-gray-500' />
                            Nama Lengkap
                        </label>
                        <input
                            type='text'
                            name='nama'
                            value={formData.nama}
                            onChange={onChange}
                            required
                            className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* Email */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Mail className='w-4 h-4 text-gray-500' />
                            Alamat Email
                        </label>
                        <div className='relative'>
                            <input
                                type='email'
                                value={formData.email}
                                disabled
                                className='w-full border rounded-xl px-4 py-3 bg-gray-100 text-gray-500 cursor-not-allowed'
                            />
                            <span className='absolute right-3 top-3 text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-md'>
                                Tidak dapat diubah
                            </span>
                        </div>
                    </div>

                    {/* No HP */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Phone className='w-4 h-4 text-gray-500' />
                            Nomor Telepon
                        </label>
                        <input
                            type='tel'
                            name='no_hp'
                            value={formData.no_hp}
                            onChange={onChange}
                            className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* Password */}
                    <div className='space-y-2'>
                        <div className='flex justify-between'>
                            <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                                <Lock className='w-4 h-4 text-gray-500' />
                                Password Baru
                            </label>
                            <span className='text-xs text-gray-500'>
                                Kosongkan jika tidak diubah
                            </span>
                        </div>
                        <input
                            type='password'
                            name='password'
                            value={formData.password || ''}
                            onChange={onChange}
                            minLength={6}
                            className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                        />
                    </div>

                    {/* Alamat */}
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <MapPin className='w-4 h-4 text-gray-500' />
                            Alamat Lengkap
                        </label>
                        <textarea
                            name='alamat'
                            value={formData.alamat}
                            onChange={onChange}
                            rows='3'
                            className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none'
                        />
                    </div>

                    {/* ACTION */}
                    <div className='pt-5 border-t flex justify-end gap-3'>
                        <button
                            type='button'
                            onClick={onClose}
                            className='px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100 flex items-center gap-2'
                        >
                            <X className='w-4 h-4' />
                            Batal
                        </button>

                        <button
                            type='submit'
                            className='px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl flex items-center gap-2'
                        >
                            <Check className='w-4 h-4' />
                            Simpan Perubahan
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default EditUserModal
