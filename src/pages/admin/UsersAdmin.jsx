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
    FiFilter,
} from 'react-icons/fi'
import { MapPin, X, User, Mail, Phone, Lock, Check } from 'lucide-react'
import EditUserModal from '../../components/admin/EditUserModal'

const UsersAdmin = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedUser, setSelectedUser] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [roleFilter, setRoleFilter] = useState('ALL')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        no_hp: '',
        alamat: '',
        role: 'CUSTOMER',
    })

    useEffect(() => {
        const fetchUsers = async () => {
            const result = await userService.getAllUsers()

            if (result.success) {
                setUsers(result.data)
            } else {
                alert(result.message)
            }

            setLoading(false)
        }

        fetchUsers()
    }, [])

    const handleEdit = (user) => {
        setSelectedUser(user)
        setFormData({
            nama: user.nama || '',
            email: user.email || '',
            no_hp: user.no_hp || '',
            alamat: user.alamat || '',
            role: user.role || 'CUSTOMER',
        })
        setIsModalOpen(true)
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        const result = await userService.updateUser(
            selectedUser.id_user,
            formData
        )

        if (result.success) {
            // update data di tabel tanpa reload
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

    // Filter users based on search term and role filter
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.no_hp && user.no_hp.includes(searchTerm))

        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter

        return matchesSearch && matchesRole
    })

    const getRoleColor = (role) => {
        switch (role) {
            case 'ADMIN':
                return 'bg-purple-100 text-purple-800 border-purple-200'
            case 'CUSTOMER':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    if (loading)
        return (
            <div className='flex justify-center items-center h-64'>
                <div className='text-center'>
                    <div className='w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto'></div>
                    <p className='mt-4 text-gray-600'>
                        Memuat data pengguna...
                    </p>
                </div>
            </div>
        )

    return (
        <div className='p-6 bg-gray-50 min-h-screen'>
            <div className='max-w-7xl mx-auto'>
                {/* Header */}
                <div className='mb-8'>
                    <h1 className='text-3xl font-bold text-gray-900'>
                        Manajemen Pengguna
                    </h1>
                    <p className='text-gray-600 mt-2'>
                        Kelola data pengguna dan akses sistem
                    </p>
                </div>

                {/* Filters and Search */}
                <div className='bg-white rounded-xl shadow-sm p-4 mb-6'>
                    <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
                        <div className='relative flex-1'>
                            <FiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                            <input
                                type='text'
                                placeholder='Cari berdasarkan nama, email, atau nomor HP...'
                                className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition'
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className='flex items-center space-x-4'>
                            <div className='flex items-center'>
                                <FiFilter className='text-gray-400 mr-2' />
                                <select
                                    className='border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    value={roleFilter}
                                    onChange={(e) =>
                                        setRoleFilter(e.target.value)
                                    }
                                >
                                    <option value='ALL'>Semua Role</option>
                                    <option value='ADMIN'>Admin</option>
                                    <option value='CUSTOMER'>Customer</option>
                                </select>
                            </div>

                            <div className='text-sm text-gray-600'>
                                {filteredUsers.length} dari {users.length}{' '}
                                pengguna
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full divide-y divide-gray-200'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        No
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Pengguna
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Kontak
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Alamat
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Role
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Bergabung
                                    </th>
                                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className='bg-white divide-y divide-gray-200'>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan='7'
                                            className='px-6 py-12 text-center'
                                        >
                                            <div className='flex flex-col items-center justify-center'>
                                                <FiUser className='w-12 h-12 text-gray-300 mb-4' />
                                                <p className='text-gray-500 text-lg'>
                                                    Tidak ada data pengguna
                                                </p>
                                                {searchTerm ||
                                                roleFilter !== 'ALL' ? (
                                                    <p className='text-gray-400 mt-1'>
                                                        Coba ubah filter
                                                        pencarian
                                                    </p>
                                                ) : null}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <tr
                                            key={user.id_user}
                                            className={`hover:bg-gray-50 transition-colors ${
                                                selectedUser?.id_user ===
                                                user.id_user
                                                    ? 'bg-blue-50'
                                                    : ''
                                            }`}
                                            onClick={() =>
                                                setSelectedUser(user)
                                            }
                                        >
                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='text-sm font-medium text-gray-900'>
                                                    {index + 1}
                                                </div>
                                            </td>

                                            <td className='px-6 py-4'>
                                                <div className='flex items-center'>
                                                    <div className='ml-4'>
                                                        <div className='text-sm font-medium text-gray-900'>
                                                            {user.nama}
                                                        </div>
                                                        <div className='text-sm text-gray-500'>
                                                            {user.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className='px-6 py-4'>
                                                <div className='space-y-1'>
                                                    <div className='flex items-center text-sm text-gray-600'>
                                                        <FiMail className='mr-2 text-gray-400' />
                                                        {user.email}
                                                    </div>
                                                    {user.no_hp && (
                                                        <div className='flex items-center text-sm text-gray-600'>
                                                            <FiPhone className='mr-2 text-gray-400' />
                                                            {user.no_hp}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            <td className='px-6 py-4'>
                                                <div className='flex items-center text-sm text-gray-600'>
                                                    <FiMapPin className='mr-2 text-gray-400' />
                                                    {user.alamat ||
                                                        'Tidak ada alamat'}
                                                </div>
                                            </td>

                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <span
                                                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(
                                                        user.role
                                                    )}`}
                                                >
                                                    <FiShield className='mr-1.5' />
                                                    {user.role}
                                                </span>
                                            </td>

                                            <td className='px-6 py-4 whitespace-nowrap'>
                                                <div className='flex items-center text-sm text-gray-600'>
                                                    <FiCalendar className='mr-2 text-gray-400' />
                                                    {new Date(
                                                        user.created_at
                                                    ).toLocaleDateString(
                                                        'id-ID',
                                                        {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                        }
                                                    )}
                                                </div>
                                            </td>

                                            <td className='px-6 py-4 whitespace-nowrap text-sm font-medium'>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleEdit(user)
                                                    }}
                                                    className='inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition'
                                                >
                                                    <FiEdit className='mr-1.5' />
                                                    Edit
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isModalOpen && (
                    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-all'>
                        <div
                            className='bg-white w-full max-w-md mx-4 rounded-2xl shadow-2xl transform transition-all'
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
                                    onClick={() => setIsModalOpen(false)}
                                    className='p-2 hover:bg-gray-100 rounded-full transition'
                                    aria-label='Tutup'
                                >
                                    <X className='w-5 h-5 text-gray-500' />
                                </button>
                            </div>

                            {/* FORM */}
                            <form
                                onSubmit={handleSubmit}
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
                                        onChange={handleChange}
                                        className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
                                        required
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
                                        onChange={handleChange}
                                        className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
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
                                        onChange={handleChange}
                                        minLength={6}
                                        className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition'
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
                                        onChange={handleChange}
                                        rows='3'
                                        className='w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none'
                                    />
                                </div>

                                {/* ACTION */}
                                <div className='pt-5 border-t flex justify-end gap-3'>
                                    <button
                                        type='button'
                                        onClick={() => setIsModalOpen(false)}
                                        className='px-5 py-2.5 border rounded-xl text-gray-700 hover:bg-gray-100 transition flex items-center gap-2'
                                    >
                                        <X className='w-4 h-4' />
                                        Batal
                                    </button>

                                    <button
                                        type='submit'
                                        className='px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition flex items-center gap-2'
                                    >
                                        <Check className='w-4 h-4' />
                                        Simpan Perubahan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            <EditUserModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
        </div>
    )
}

export default UsersAdmin
