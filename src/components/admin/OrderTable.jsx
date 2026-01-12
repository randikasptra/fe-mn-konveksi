// src/components/admin/OrderTable.jsx
import React from 'react'
import OrderStatusBadge from './OrderStatusBadge'

const OrderTable = ({
    orders,
    loading,
    search,
    setSearch,
    onSelectOrder,
    orderService,
}) => {
    if (loading) {
        return (
            <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                <div className='py-12 text-center'>
                    <div className='flex flex-col items-center justify-center gap-3'>
                        <div className='w-12 h-12 border-4 border-gray-300 border-t-indigo-600 rounded-full animate-spin'></div>
                        <p className='text-gray-500'>Memuat pesanan...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (orders.length === 0) {
        return (
            <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
                <div className='py-16 text-center'>
                    <div className='flex flex-col items-center justify-center gap-3'>
                        <div className='w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center'>
                            <span className='text-gray-400 text-2xl'>📦</span>
                        </div>
                        <p className='text-gray-500'>
                            {search
                                ? 'Tidak ditemukan pesanan dengan kata kunci tersebut'
                                : 'Belum ada pesanan'}
                        </p>
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className='text-sm text-indigo-600 hover:text-indigo-800'
                            >
                                Hapus pencarian
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden'>
            <div className='overflow-x-auto'>
                <table className='w-full'>
                    <thead className='bg-gray-50'>
                        <tr>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                                Produk
                            </th>
                            <th className='px-6 py-4 text-left text-sm font-medium text-gray-500'>
                                Customer
                            </th>
                            <th className='px-6 py-4 text-center text-sm font-medium text-gray-500'>
                                Qty
                            </th>
                            <th className='px-6 py-4 text-center text-sm font-medium text-gray-500'>
                                Total
                            </th>
                            <th className='px-6 py-4 text-center text-sm font-medium text-gray-500'>
                                Status
                            </th>
                            <th className='px-6 py-4 text-center text-sm font-medium text-gray-500'>
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-200'>
                        {orders.map((order) => {
                            const paymentStatus =
                                orderService.checkPaymentStatus(order)

                            return (
                                <tr
                                    key={order.id_pesanan}
                                    className='hover:bg-gray-50 transition-colors'
                                >
                                    <td className='px-6 py-4'>
                                        <div className='flex items-center gap-4'>
                                            <img
                                                src={
                                                    order.produk?.foto ||
                                                    'https://via.placeholder.com/60'
                                                }
                                                className='w-14 h-14 rounded-xl object-cover border'
                                                alt={order.produk?.nama_produk}
                                                onError={(e) => {
                                                    e.target.src =
                                                        'https://via.placeholder.com/60'
                                                }}
                                            />
                                            <div>
                                                <div className='font-medium text-gray-900'>
                                                    {order.produk
                                                        ?.nama_produk ||
                                                        'Produk tidak ditemukan'}
                                                </div>
                                                <div className='text-xs text-gray-400 mt-1'>
                                                    ID: {order.id_pesanan}
                                                </div>
                                                <div className='text-xs text-gray-500 mt-1'>
                                                    {order.catatan
                                                        ? `"${order.catatan}"`
                                                        : 'Tidak ada catatan'}
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className='px-6 py-4'>
                                        {order.user ? (
                                            <div>
                                                <div className='font-medium text-gray-900'>
                                                    {order.user.nama ||
                                                        'Tidak ada nama'}
                                                </div>
                                                <div className='text-xs text-gray-500'>
                                                    {order.user.email ||
                                                        'Tidak ada email'}
                                                </div>
                                                <div className='text-xs text-gray-400 mt-1'>
                                                    {order.user.no_hp ||
                                                        'Tidak ada telepon'}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className='text-gray-400 text-sm'>
                                                Data customer tidak ditemukan
                                            </span>
                                        )}
                                    </td>

                                    <td className='px-6 py-4 text-center'>
                                        <span className='font-medium text-lg'>
                                            {order.qty}
                                        </span>
                                        <div className='text-xs text-gray-500'>
                                            pcs
                                        </div>
                                    </td>

                                    <td className='px-6 py-4 text-center'>
                                        <span className='font-bold text-gray-900'>
                                            {orderService.formatCurrency(
                                                order.total_harga
                                            )}
                                        </span>
                                        {paymentStatus.isPaid && (
                                            <div
                                                className={`text-xs mt-1 ${
                                                    paymentStatus.isFullyPaid
                                                        ? 'text-green-600'
                                                        : 'text-orange-600'
                                                }`}
                                            >
                                                {paymentStatus.isFullyPaid
                                                    ? '✅ Lunas'
                                                    : '💰 DP dibayar'}
                                            </div>
                                        )}
                                    </td>

                                    <td className='px-6 py-4'>
                                        <div className='flex justify-center'>
                                            <OrderStatusBadge
                                                status={orderService.mapStatusToFrontend(
                                                    order.status_pesanan
                                                )}
                                                paymentStatus={paymentStatus}
                                            />
                                        </div>
                                    </td>

                                    <td className='px-6 py-4'>
                                        <div className='flex justify-center gap-2'>
                                            <button
                                                onClick={() =>
                                                    onSelectOrder(order)
                                                }
                                                className='px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium'
                                            >
                                                Kelola
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default OrderTable
