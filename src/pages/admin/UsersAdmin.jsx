import React, { useEffect, useState } from 'react'
import userService from './../../services/userService'
import {
    FiEdit,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiShield,
    FiCalendar,
    FiSearch,
    FiChevronRight,
    FiFilter,
} from 'react-icons/fi'
import {
    Check,
    Mail,
    MapPin,
    Phone,
    User,
    X,
    MoreVertical,
    Shield,
} from 'lucide-react'

const UsersAdmin = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        no_hp: '',
        alamat: '',
    })

    // ======================
    // FETCH USERS
    // ======================
    useEffect(() => {
        const fetchUsers = async () => {
            const result = await userService.getAllUsers()
            if (result.success) {
                setUsers(result.data)
            } else {
                console.log(result.message);
                
            }
            setLoading(false)
        }

        fetchUsers()
    }, [])

    // ======================
    // HANDLERS
    // ======================
    const handleEdit = (user) => {
        setSelectedUser(user)
        setFormData({
            nama: user.nama || '',
            email: user.email || '',
            no_hp: user.no_hp || '',
            alamat: user.alamat || '',
        })
        setIsModalOpen(true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await userService.updateUser(
            selectedUser.id_user,
            formData
        )

        if (result.success) {
            setUsers((prev) =>
                prev.map((u) =>
                    u.id_user === selectedUser.id_user
                        ? { ...u, ...formData }
                        : u
                )
            )
            setIsModalOpen(false)
            setSelectedUser(null)
        } else {
            alert(result.message)
        }
    }

    // ======================
    // FILTER (SEARCH ONLY)
    // ======================
    const filteredUsers = users.filter((user) => {
        return (
            user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.no_hp && user.no_hp.includes(searchTerm))
        )
    })

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'from-purple-500 to-indigo-600 shadow-purple-100'
            case 'CUSTOMER':
                return 'from-blue-500 to-cyan-600 shadow-blue-100'
            default:
                return 'from-gray-500 to-gray-600 shadow-gray-100'
        }
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case 'ADMIN':
                return '🛡️'
            case 'CUSTOMER':
                return '👤'
            default:
                return '👤'
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
            {/* Main Content */}
            <div className='p-6 lg:p-8'>
                <div className='max-w-7xl mx-auto'>
                    {/* Header Section */}
                    <div className='mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between'>
                        <div>
                            <div className='flex items-center gap-3 mb-3'>
                                <div className='p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg'>
                                    <Shield className='w-6 h-6 text-white' />
                                </div>
                                <div>
                                    <h1 className='text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent'>
                                        Manajemen Pengguna
                                    </h1>
                                    <p className='text-gray-600 mt-1'>
                                        Kelola dan pantau semua pengguna sistem
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Stats - Modern Design */}
                        <div className='mt-4 lg:mt-0'>
                            <div className='flex gap-4'>
                                <div className='bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300 min-w-[140px] group'>
                                    <div className='flex items-center justify-between mb-3'>
                                        <div className='p-2.5 bg-blue-50 rounded-xl group-hover:bg-blue-100 transition-colors duration-300'>
                                            <svg
                                                className='w-5 h-5 text-blue-600'
                                                fill='none'
                                                stroke='currentColor'
                                                viewBox='0 0 24 24'
                                            >
                                                <path
                                                    strokeLinecap='round'
                                                    strokeLinejoin='round'
                                                    strokeWidth='2'
                                                    d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.67 3.137a6 6 0 00-11.334 0'
                                                />
                                            </svg>
                                        </div>
                                        <div className='text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full'>
                                            Total
                                        </div>
                                    </div>
                                    <div className='text-3xl font-bold text-gray-900 mb-1'>
                                        {users.length}
                                    </div>
                                    <div className='text-sm text-gray-500 font-medium'>
                                        Total Pengguna
                                    </div>
                                    <div className='mt-3 pt-3 border-t border-gray-100'>
                                        <div className='text-xs text-gray-400 flex items-center'>
                                            <svg
                                                className='w-3 h-3 mr-1'
                                                fill='currentColor'
                                                viewBox='0 0 20 20'
                                            >
                                                <path
                                                    fillRule='evenodd'
                                                    d='M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z'
                                                    clipRule='evenodd'
                                                />
                                            </svg>
                                            Semua pengguna terdaftar
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search and Filter Card */}
                    <div className='mb-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6'>
                        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
                            <div className='relative flex-1'>
                                <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                    <FiSearch className='h-5 w-5 text-gray-400' />
                                </div>
                                <input
                                    type='text'
                                    placeholder='Cari berdasarkan nama, email, atau nomor HP...'
                                    className='w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200'
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                />
                            </div>
                            <div className='flex items-center gap-3'>
                                <button className='flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl transition-colors duration-200'>
                                    <FiFilter className='h-4 w-4' />
                                    <span>Filter</span>
                                </button>
                            </div>
                        </div>
                        <div className='mt-4 text-sm text-gray-600 flex items-center'>
                            <span className='px-2 py-1 bg-blue-50 text-blue-600 rounded-lg mr-2'>
                                {filteredUsers.length}
                            </span>
                            pengguna ditemukan
                        </div>
                    </div>

                    {/* Users Table Card */}
                    <div className='bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden'>
                        <div className='overflow-x-auto'>
                            <table className='w-full'>
                                <thead>
                                    <tr className='bg-gradient-to-r from-gray-50 to-gray-100'>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                                                Pengguna
                                            </div>
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                            Kontak
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                            Role
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                            Bergabung
                                        </th>
                                        <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className='divide-y divide-gray-200'>
                                    {loading ? (
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className='px-6 py-16 text-center'
                                            >
                                                <div className='flex flex-col items-center justify-center gap-4'>
                                                    {/* Spinner */}
                                                    <div className='relative w-14 h-14'>
                                                        <div className='w-full h-full rounded-full border-4 border-gray-200'></div>
                                                        <div className='absolute top-0 left-0 w-full h-full rounded-full border-4 border-blue-600 border-t-transparent animate-spin'></div>
                                                    </div>

                                                    {/* Text */}
                                                    <div className='text-sm text-gray-500'>
                                                        Memuat data pengguna...
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredUsers.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan='5'
                                                className='px-6 py-16 text-center'
                                            >
                                                <div className='flex flex-col items-center justify-center'>
                                                    <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
                                                        <FiUser className='w-8 h-8 text-gray-400' />
                                                    </div>
                                                    <h3 className='text-lg font-medium text-gray-900 mb-2'>
                                                        Tidak ada pengguna
                                                        ditemukan
                                                    </h3>
                                                    <p className='text-gray-600'>
                                                        Coba ubah kata kunci
                                                        pencarian Anda
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user, index) => (
                                            <tr
                                                key={user.id_user}
                                                className='hover:bg-gray-50 transition-colors duration-200 group'
                                            >
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-3'>
                                                        <div className='relative'>
                                                            <div className='w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center'>
                                                                <span className='text-xl'>
                                                                    {getRoleIcon(
                                                                        user.role
                                                                    )}
                                                                </span>
                                                            </div>
                                                            <div className='absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full border-2 border-white'>
                                                                <div
                                                                    className={`w-full h-full rounded-full bg-gradient-to-r ${getRoleColor(
                                                                        user.role
                                                                    )}`}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div className='font-semibold text-gray-900 group-hover:text-blue-600 transition-colors'>
                                                                {user.nama}
                                                            </div>
                                                            <div className='text-sm text-gray-600 flex items-center gap-1'>
                                                                <FiMail className='w-3 h-3' />
                                                                {user.email}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <div className='space-y-1'>
                                                        <div className='flex items-center gap-2 text-sm text-gray-700'>
                                                            <FiPhone className='w-4 h-4 text-gray-400' />
                                                            {user.no_hp || '-'}
                                                        </div>
                                                        <div className='flex items-center gap-2 text-sm text-gray-700'>
                                                            <FiMapPin className='w-4 h-4 text-gray-400' />
                                                            <span className='truncate max-w-[200px]'>
                                                                {user.alamat ||
                                                                    '-'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <span
                                                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getRoleColor(
                                                            user.role
                                                        )} text-white text-xs font-medium shadow-sm`}
                                                    >
                                                        <FiShield className='w-3 h-3' />
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <div className='text-sm text-gray-700'>
                                                        {new Date(
                                                            user.created_at
                                                        ).toLocaleDateString(
                                                            'id-ID',
                                                            {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric',
                                                            }
                                                        )}
                                                    </div>
                                                </td>
                                                <td className='px-6 py-4'>
                                                    <div className='flex items-center gap-2'>
                                                        <button
                                                            onClick={() =>
                                                                handleEdit(user)
                                                            }
                                                            className='px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2'
                                                        >
                                                            <FiEdit className='w-4 h-4' />
                                                            Edit
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
                </div>
            </div>

            {/* Modal Edit User */}
            {isModalOpen && (
                <div className='fixed inset-0 z-50 overflow-y-auto'>
                    {/* Backdrop */}
                    <div
                        className='fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity'
                        onClick={() => setIsModalOpen(false)}
                    />

                    {/* Modal Container */}
                    <div className='flex items-center justify-center min-h-screen px-4 py-6'>
                        <div
                            className='relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all'
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6'>
                                <div className='flex items-center justify-between'>
                                    <div className='flex items-center gap-3'>
                                        <div className='p-2 bg-white/20 rounded-lg backdrop-blur-sm'>
                                            <User className='w-5 h-5 text-white' />
                                        </div>
                                        <div>
                                            <h3 className='text-xl font-semibold text-white'>
                                                Edit Pengguna
                                            </h3>
                                            <p className='text-blue-100 text-sm mt-1'>
                                                {selectedUser?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className='p-2 hover:bg-white/10 rounded-lg transition-colors'
                                    >
                                        <X className='w-5 h-5 text-white' />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <form
                                onSubmit={handleSubmit}
                                className='p-6 space-y-5'
                            >
                                {/* Form Fields */}
                                <div className='space-y-4'>
                                    {/* Nama */}
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            <div className='flex items-center gap-2'>
                                                <User className='w-4 h-4 text-gray-500' />
                                                Nama Lengkap
                                            </div>
                                        </label>
                                        <input
                                            name='nama'
                                            value={formData.nama}
                                            onChange={handleChange}
                                            placeholder='Masukkan nama lengkap'
                                            className='w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200'
                                            required
                                        />
                                    </div>

                                    {/* Email (disabled) */}
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            <div className='flex items-center gap-2'>
                                                <Mail className='w-4 h-4 text-gray-500' />
                                                Email
                                            </div>
                                        </label>
                                        <input
                                            value={formData.email}
                                            disabled
                                            className='w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-xl cursor-not-allowed'
                                        />
                                        <p className='mt-1 text-xs text-gray-500'>
                                            Email tidak dapat diubah
                                        </p>
                                    </div>

                                    {/* No HP */}
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            <div className='flex items-center gap-2'>
                                                <Phone className='w-4 h-4 text-gray-500' />
                                                Nomor HP
                                            </div>
                                        </label>
                                        <input
                                            name='no_hp'
                                            value={formData.no_hp}
                                            onChange={handleChange}
                                            placeholder='08xxxxxxxxxx'
                                            className='w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200'
                                        />
                                    </div>

                                    {/* Alamat */}
                                    <div>
                                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                                            <div className='flex items-center gap-2'>
                                                <MapPin className='w-4 h-4 text-gray-500' />
                                                Alamat
                                            </div>
                                        </label>
                                        <textarea
                                            name='alamat'
                                            value={formData.alamat}
                                            onChange={handleChange}
                                            rows='3'
                                            placeholder='Masukkan alamat lengkap'
                                            className='w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all duration-200'
                                        />
                                    </div>
                                </div>

                                {/* Modal Footer */}
                                <div className='pt-4 border-t border-gray-200'>
                                    <div className='flex justify-end gap-3'>
                                        <button
                                            type='button'
                                            onClick={() =>
                                                setIsModalOpen(false)
                                            }
                                            className='px-5 py-2.5 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-colors duration-200'
                                        >
                                            Batal
                                        </button>
                                        <button
                                            type='submit'
                                            className='px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200'
                                        >
                                            <div className='flex items-center gap-2'>
                                                <Check className='w-4 h-4' />
                                                Simpan Perubahan
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default UsersAdmin
