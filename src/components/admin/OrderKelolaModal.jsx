import React from 'react'
import {
    MdClose,
    MdPerson,
    MdShoppingBag,
    MdAttachMoney,
    MdCalendarToday,
    MdCheckCircle,
    MdCancel,
    MdPayment,
    MdReceipt,
    MdInfoOutline,
    MdCheck,
    MdClose as MdCloseIcon,
} from 'react-icons/md'
import { FaBoxOpen, FaClipboardList, FaTag } from 'react-icons/fa'

export default function OrderKelolaModal({
    order,
    onClose,
    onSelesaikan,
    onBatalkan,
    formatCurrency,
    formatDate,
}) {
    if (!order) return null

    // ================= HITUNG PEMBAYARAN =================
    const totalDibayar = (order.transaksi || []).reduce(
        (sum, t) => sum + (Number(t.jumlah) || 0),
        0
    )

    const isLunas = totalDibayar >= order.total_harga
    const canSelesai = order.status_pesanan === 'DIPROSES' && isLunas
    const sisaTagihan = Math.max(0, order.total_harga - totalDibayar)

    // Fungsi untuk mendapatkan warna status
    const getStatusColor = (status) => {
        switch (status) {
            case 'MENUNGGU_PEMBAYARAN':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'DIPROSES':
                return 'bg-blue-100 text-blue-800 border-blue-200'
            case 'SELESAI':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'DIBATALKAN':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    // Format status untuk tampilan
    const formatStatus = (status) => {
        return status
            .replace(/_/g, ' ')
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
    }

    return (
        <div className='fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
            <div className='bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden'>
                {/* HEADER */}
                <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6'>
                    <div className='flex justify-between items-center'>
                        <div className='flex items-center gap-3'>
                            <div className='p-2 bg-white/20 rounded-lg'>
                                <FaBoxOpen
                                    size={22}
                                    className='text-white'
                                />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-white'>
                                    Pesanan #{order.id_pesanan}
                                </h2>
                                <div
                                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(
                                        order.status_pesanan
                                    )}`}
                                >
                                    {order.status_pesanan === 'SELESAI' && (
                                        <MdCheckCircle size={12} />
                                    )}
                                    {order.status_pesanan === 'DIBATALKAN' && (
                                        <MdCancel size={12} />
                                    )}
                                    {formatStatus(order.status_pesanan)}
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className='p-2 hover:bg-white/20 rounded-full transition-colors'
                        >
                            <MdClose
                                size={24}
                                className='text-white'
                            />
                        </button>
                    </div>
                </div>

                {/* CONTENT */}
                <div className='p-6 space-y-6 overflow-y-auto flex-1'>
                    {/* INFO PESANAN */}
                    <div className='bg-gray-50 rounded-xl p-4'>
                        <h3 className='font-semibold text-gray-700 mb-3 flex items-center gap-2'>
                            <FaClipboardList className='text-blue-600' />
                            Informasi Pesanan
                        </h3>

                        <div className='grid grid-cols-2 gap-3'>
                            <div className='space-y-2'>
                                <div className='flex items-center gap-2'>
                                    <MdPerson
                                        className='text-gray-500'
                                        size={16}
                                    />
                                    <span className='text-sm text-gray-600'>
                                        Customer
                                    </span>
                                </div>
                                <p className='font-medium text-gray-900 ml-6'>
                                    {order.user?.nama}
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <div className='flex items-center gap-2'>
                                    <MdShoppingBag
                                        className='text-gray-500'
                                        size={16}
                                    />
                                    <span className='text-sm text-gray-600'>
                                        Produk
                                    </span>
                                </div>
                                <p className='font-medium text-gray-900 ml-6 truncate'>
                                    {order.produk?.nama_produk}
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <div className='flex items-center gap-2'>
                                    <FaTag
                                        className='text-gray-500'
                                        size={16}
                                    />
                                    <span className='text-sm text-gray-600'>
                                        Quantity
                                    </span>
                                </div>
                                <p className='font-medium text-gray-900 ml-6'>
                                    {order.qty}
                                </p>
                            </div>

                            <div className='space-y-2'>
                                <div className='flex items-center gap-2'>
                                    <MdAttachMoney
                                        className='text-gray-500'
                                        size={16}
                                    />
                                    <span className='text-sm text-gray-600'>
                                        Total Harga
                                    </span>
                                </div>
                                <p className='font-medium text-gray-900 ml-6'>
                                    {formatCurrency(order.total_harga)}
                                </p>
                            </div>

                            <div className='space-y-2 col-span-2'>
                                <div className='flex items-center gap-2'>
                                    <MdCalendarToday
                                        className='text-gray-500'
                                        size={16}
                                    />
                                    <span className='text-sm text-gray-600'>
                                        Tanggal Pesan
                                    </span>
                                </div>
                                <p className='font-medium text-gray-900 ml-6'>
                                    {formatDate(order.tanggal_pesan)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* PEMBAYARAN */}
                    <div className='border border-gray-200 rounded-xl overflow-hidden'>
                        <div className='bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-b'>
                            <h3 className='font-semibold text-gray-700 flex items-center gap-2'>
                                <MdPayment className='text-green-600' />
                                Ringkasan Pembayaran
                            </h3>
                        </div>

                        <div className='p-4'>
                            <div className='space-y-3 mb-4'>
                                {(order.transaksi || []).length === 0 ? (
                                    <div className='text-center py-4'>
                                        <MdReceipt
                                            size={32}
                                            className='text-gray-300 mx-auto mb-2'
                                        />
                                        <p className='text-sm text-gray-500'>
                                            Belum ada pembayaran
                                        </p>
                                    </div>
                                ) : (
                                    (order.transaksi || []).map((trx) => (
                                        <div
                                            key={trx.id_transaksi}
                                            className='flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:border-green-200 transition-colors'
                                        >
                                            <div className='flex items-center gap-3'>
                                                <div
                                                    className={`p-2 rounded-lg ${
                                                        trx.midtrans_status ===
                                                        'settlement'
                                                            ? 'bg-green-100 text-green-600'
                                                            : 'bg-blue-100 text-blue-600'
                                                    }`}
                                                >
                                                    <MdReceipt size={18} />
                                                </div>
                                                <div>
                                                    <div className='font-medium text-gray-900'>
                                                        {trx.jenis_pembayaran}
                                                    </div>
                                                    <div className='text-xs text-gray-500'>
                                                        {formatDate(
                                                            trx.created_at
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='text-right'>
                                                <div className='font-semibold text-gray-900'>
                                                    {formatCurrency(trx.jumlah)}
                                                </div>
                                                <div
                                                    className={`text-xs font-medium px-2 py-1 rounded-full inline-block ${
                                                        trx.midtrans_status ===
                                                        'settlement'
                                                            ? 'bg-green-100 text-green-800'
                                                            : trx.midtrans_status ===
                                                              'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {trx.midtrans_status}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className='space-y-2 pt-4 border-t border-gray-200'>
                                <div className='flex justify-between items-center'>
                                    <span className='text-gray-600'>
                                        Total Dibayar
                                    </span>
                                    <span className='font-semibold text-lg'>
                                        {formatCurrency(totalDibayar)}
                                    </span>
                                </div>

                                {!isLunas && (
                                    <div className='flex justify-between items-center pt-2'>
                                        <span className='text-red-600 font-medium'>
                                            Sisa Tagihan
                                        </span>
                                        <span className='font-bold text-lg text-red-600'>
                                            {formatCurrency(sisaTagihan)}
                                        </span>
                                    </div>
                                )}

                                <div className='flex justify-between items-center pt-2'>
                                    <span className='text-gray-600'>
                                        Status Pembayaran
                                    </span>
                                    <div
                                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                                            isLunas
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                    >
                                        {isLunas ? (
                                            <>
                                                <MdCheckCircle size={14} />
                                                Lunas
                                            </>
                                        ) : (
                                            <>
                                                <MdInfoOutline size={14} />
                                                Belum Lunas
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFO DP SAJA */}
                    {order.status_pesanan === 'DIPROSES' && !isLunas && (
                        <div className='bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-4'>
                            <div className='flex items-start gap-3'>
                                <div className='p-2 bg-orange-100 rounded-lg'>
                                    <MdInfoOutline
                                        className='text-orange-600'
                                        size={20}
                                    />
                                </div>
                                <div>
                                    <h4 className='font-medium text-orange-800'>
                                        Perhatian
                                    </h4>
                                    <p className='text-sm text-orange-700 mt-1'>
                                        Pesanan belum lunas. Selesaikan
                                        pembayaran sebelum menandai pesanan
                                        sebagai selesai.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER / AKSI */}
                <div className='p-6 bg-gray-50 border-t border-gray-200'>
                    <div className='flex flex-col sm:flex-row gap-3'>
                        <button
                            onClick={onClose}
                            className='flex-1 px-4 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2'
                        >
                            <MdCloseIcon size={18} />
                            Tutup
                        </button>

                        {/* 🔴 BATALKAN PESANAN */}
                        {order.status_pesanan === 'MENUNGGU_PEMBAYARAN' && (
                            <button
                                onClick={() => onBatalkan(order)}
                                className='flex-1 px-4 py-3 rounded-xl font-medium text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 transition-all flex items-center justify-center gap-2 shadow-sm hover:shadow'
                            >
                                <MdCancel size={18} />
                                Batalkan Pesanan
                            </button>
                        )}

                        {/* 🟢 SELESAIKAN PESANAN */}
                        <button
                            disabled={!canSelesai}
                            onClick={() => canSelesai && onSelesaikan(order)}
                            className={`flex-1 px-4 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                                canSelesai
                                    ? 'text-white bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-sm hover:shadow cursor-pointer'
                                    : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                            }`}
                        >
                            <MdCheck size={18} />
                            Selesaikan Pesanan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
