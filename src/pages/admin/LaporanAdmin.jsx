import React, { useState } from 'react'
import {
    Calendar,
    Filter,
    FileText,
    FileSpreadsheet,
    Loader2,
    Download,
    Eye,
    User,
    Package,
    CreditCard,
    TrendingUp,
    DollarSign,
    Clock,
    Loader,
    CheckCircle,
    XCircle,
} from 'lucide-react'
import laporanService from '../../services/laporanService'

import { useEffect } from 'react'

const StatusIcon = ({ status }) => {
    const map = {
        MENUNGGU_PEMBAYARAN: {
            icon: Clock,
            color: 'text-yellow-500',
            label: 'Menunggu Pembayaran',
        },
        DIPROSES: {
            icon: Loader,
            color: 'text-blue-500 animate-spin',
            label: 'Diproses',
        },
        SELESAI: {
            icon: CheckCircle,
            color: 'text-green-500',
            label: 'Selesai',
        },
        DIBATALKAN: {
            icon: XCircle,
            color: 'text-red-500',
            label: 'Dibatalkan',
        },
    }

    const cfg = map[status] || map.MENUNGGU_PEMBAYARAN
    const Icon = cfg.icon

    return (
        <div className='relative group flex justify-center'>
            <Icon className={`w-5 h-5 ${cfg.color}`} />

            {/* TOOLTIP */}
            <div className='absolute bottom-full mb-2 hidden group-hover:block'>
                <div className='px-3 py-1 text-xs text-white bg-gray-900 rounded-md whitespace-nowrap'>
                    {cfg.label}
                </div>
            </div>
        </div>
    )
}

// =====================
// UTIL
// =====================
const rupiah = (n) =>
    new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(n || 0)

const LaporanAdmin = () => {
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [status, setStatus] = useState('')

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [summary, setSummary] = useState(null)
    const [list, setList] = useState([])

    // =====================
    // LOAD JSON (TAMPILAN)
    // =====================
    const loadLaporan = async () => {
        setLoading(true)
        setError('')

        const res = await laporanService.getLaporanPesananJson({
            from,
            to,
            status,
        })

        if (!res.success) {
            setError(res.message)
            setLoading(false)
            return
        }

        setSummary(res.data.summary)
        setList(res.data.data)
        setLoading(false)
    }
    useEffect(() => {
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

        setFrom(firstDay.toISOString().slice(0, 10))
        setTo(lastDay.toISOString().slice(0, 10))
    }, [])

    useEffect(() => {
        if (from && to) {
            loadLaporan()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [from, to])

    // =====================
    // EXPORT PDF / EXCEL
    // =====================
    const exportLaporan = async (format) => {
        if (!from || !to) {
            alert('Pilih tanggal terlebih dahulu')
            return
        }

        const res = await laporanService.cetakLaporanPesanan({
            from,
            to,
            status,
            format,
        })

        if (!res.success) {
            alert(res.message)
            return
        }

        laporanService.downloadFile(
            res.data,
            `laporan-pesanan-${from}-${to}.${format === 'pdf' ? 'pdf' : 'xlsx'}`
        )
    }

    return (
        <div className='min-h-screen bg-gray-50 p-6'>
            {/* HEADER */}
            <div className='mb-8'>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <div className='p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm'>
                            <FileText className='w-6 h-6 text-white' />
                        </div>
                        <div>
                            <h1 className='text-2xl font-bold text-gray-900'>
                                Laporan Pesanan
                            </h1>
                            <p className='text-gray-500 text-sm'>
                                Analisis dan ringkasan transaksi pesanan
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTER CARD */}
            <div className='bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8'>
                <div className='grid md:grid-cols-4 gap-4'>
                    <div className='space-y-1'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Calendar className='w-4 h-4' />
                            Tanggal Mulai
                        </label>
                        <input
                            type='date'
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                        />
                    </div>

                    <div className='space-y-1'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Calendar className='w-4 h-4' />
                            Tanggal Akhir
                        </label>
                        <input
                            type='date'
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                        />
                    </div>

                    <div className='space-y-1'>
                        <label className='text-sm font-medium text-gray-700 flex items-center gap-2'>
                            <Filter className='w-4 h-4' />
                            Status Pesanan
                        </label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className='w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200'
                        >
                            <option value=''>Semua Status</option>
                            <option value='MENUNGGU_PEMBAYARAN'>
                                Menunggu Pembayaran
                            </option>
                            <option value='DIPROSES'>Diproses</option>
                            <option value='SELESAI'>Selesai</option>
                            <option value='DIBATALKAN'>Dibatalkan</option>
                        </select>
                    </div>

                    <div className='flex items-end'>
                        <button
                            onClick={loadLaporan}
                            disabled={loading}
                            className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50'
                        >
                            {loading ? (
                                <>
                                    <Loader2 className='w-5 h-5 animate-spin' />
                                    <span>Memuat...</span>
                                </>
                            ) : (
                                <>
                                    <Eye className='w-5 h-5' />
                                    <span>Tampilkan Laporan</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && (
                <div className='mb-6 p-4 bg-red-50 border border-red-100 rounded-xl'>
                    <p className='text-red-600 text-sm flex items-center gap-2'>
                        <span className='w-2 h-2 bg-red-500 rounded-full'></span>
                        {error}
                    </p>
                </div>
            )}

            {/* SUMMARY CARDS */}
            {summary && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8'>
                    <SummaryCard
                        title='Total Pesanan'
                        value={summary.total_pesanan}
                        icon={<Package className='w-5 h-5 text-blue-600' />}
                        color='from-blue-50 to-blue-100'
                    />
                    <SummaryCard
                        title='Transaksi'
                        value={summary.total_transaksi}
                        icon={<TrendingUp className='w-5 h-5 text-green-600' />}
                        color='from-green-50 to-green-100'
                    />
                    <SummaryCard
                        title='Nilai Pesanan'
                        value={rupiah(summary.total_nilai_pesanan)}
                        icon={
                            <DollarSign className='w-5 h-5 text-purple-600' />
                        }
                        color='from-purple-50 to-purple-100'
                    />
                    <SummaryCard
                        title='Pendapatan'
                        value={rupiah(summary.total_pendapatan)}
                        icon={
                            <CreditCard className='w-5 h-5 text-emerald-600' />
                        }
                        color='from-emerald-50 to-emerald-100'
                    />
                    <SummaryCard
                        title='Sisa Tagihan'
                        value={rupiah(summary.total_sisa_tagihan)}
                        icon={<DollarSign className='w-5 h-5 text-amber-600' />}
                        color='from-amber-50 to-amber-100'
                    />
                </div>
            )}

            <div className='flex gap-2 mb-3'>
                <button
                    onClick={() => exportLaporan('pdf')}
                    className='flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200'
                >
                    <svg
                        className='w-4 h-4 text-red-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                    </svg>
                    <span className='font-medium'>Export PDF</span>
                </button>

                <button
                    onClick={() => exportLaporan('excel')}
                    className='flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200'
                >
                    <svg
                        className='w-4 h-4 text-green-500'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                    >
                        <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth='2'
                            d='M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                        />
                    </svg>
                    <span className='font-medium'>Export Excel</span>
                </button>
            </div>

            {/* TABLE */}
            {list.length > 0 && (
                <div className='bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden'>
                    <div className='px-6 py-4 border-b border-gray-100'>
                        <h2 className='text-lg font-semibold text-gray-900'>
                            Detail Pesanan
                        </h2>
                        <p className='text-gray-500 text-sm'>
                            {list.length} pesanan ditemukan
                        </p>
                    </div>

                    <div className='overflow-x-auto'>
                        <table className='w-full'>
                            <thead className='bg-gray-50'>
                                <tr>
                                    <Th>No</Th>
                                    <Th>Pelanggan</Th>
                                    <Th>Produk</Th>
                                    <Th>Harga Satuan</Th>
                                    <Th>Jumlah</Th>
                                    <Th>Total Pesanan</Th>
                                    <Th>Pembayaran</Th>
                                    <Th>Status</Th>
                                </tr>
                            </thead>

                            <tbody className='divide-y divide-gray-100'>
                                {list.map((item, i) => (
                                    <tr
                                        key={i}
                                        className='hover:bg-gray-50 transition-colors duration-150'
                                    >
                                        {/* NO */}
                                        <Td>{i + 1}</Td>

                                        {/* CUSTOMER */}
                                        <Td className='font-medium'>
                                            {item.customer}
                                        </Td>

                                        {/* PRODUK */}
                                        <Td>{item.produk}</Td>

                                        {/* HARGA SATUAN */}
                                        <Td>
                                            <div className='font-medium'>
                                                {rupiah(item.harga_satuan)}
                                            </div>
                                            <div className='text-xs text-gray-500'>
                                                per item
                                            </div>
                                        </Td>

                                        {/* QTY */}
                                        <Td>
                                            <span className='px-3 py-1 bg-gray-100 rounded-full text-sm font-medium'>
                                                {item.qty}
                                            </span>
                                        </Td>

                                        {/* TOTAL PESANAN */}
                                        <Td className='font-semibold'>
                                            {rupiah(item.total_pesanan)}
                                        </Td>

                                        {/* PEMBAYARAN */}
                                        <Td>
                                            <div className='text-sm font-medium'>
                                                {item.pembayaran.jenis} –{' '}
                                                {rupiah(item.pembayaran.jumlah)}
                                            </div>
                                            <div className='text-xs text-gray-500'>
                                                {item.pembayaran.status}
                                            </div>
                                        </Td>

                                        {/* STATUS ICON */}
                                        <Td>
                                            <StatusIcon status={item.status} />
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

// =====================
// KOMPONEN KECIL
// =====================
const SummaryCard = ({ title, value, icon, color }) => (
    <div
        className={`bg-gradient-to-br ${color} border border-gray-100 rounded-2xl p-5 shadow-sm`}
    >
        <div className='flex items-center justify-between mb-3'>
            <div className='p-2 bg-white rounded-lg shadow-xs'>{icon}</div>
        </div>
        <p className='text-sm text-gray-600 font-medium mb-1'>{title}</p>
        <p className='text-2xl font-bold text-gray-900'>{value}</p>
    </div>
)

const Th = ({ children }) => (
    <th className='px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider'>
        {children}
    </th>
)

const Td = ({ children }) => (
    <td className='px-6 py-4 whitespace-nowrap'>{children}</td>
)

const StatusBadge = ({ status }) => {
    const map = {
        MENUNGGU_PEMBAYARAN: {
            bg: 'bg-yellow-50',
            text: 'text-yellow-700',
            border: 'border-yellow-200',
            dot: 'bg-yellow-500',
        },
        DIPROSES: {
            bg: 'bg-blue-50',
            text: 'text-blue-700',
            border: 'border-blue-200',
            dot: 'bg-blue-500',
        },
        SELESAI: {
            bg: 'bg-green-50',
            text: 'text-green-700',
            border: 'border-green-200',
            dot: 'bg-green-500',
        },
        DIBATALKAN: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            border: 'border-red-200',
            dot: 'bg-red-500',
        },
    }

    const config = map[status] || map.MENUNGGU_PEMBAYARAN

    return (
        <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${config.bg} ${config.text} ${config.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            <span className='text-sm font-medium'>
                {status.replace('_', ' ')}
            </span>
        </div>
    )
}

export default LaporanAdmin
