import React, { useState } from 'react'
import {
    Calendar,
    Filter,
    FileText,
    FileSpreadsheet,
    Loader2,
} from 'lucide-react'
import laporanService from '../../services/laporanService'

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
            status, // 🔥 WAJIB DIKIRIM
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
        <div className='p-6 space-y-8'>
            {/* HEADER */}
            <div className='flex items-center gap-3'>
                <FileText className='w-7 h-7 text-blue-600' />
                <h1 className='text-2xl font-bold'>Laporan Pesanan</h1>
            </div>

            {/* FILTER */}
            <div className='bg-white border rounded-xl p-4 grid md:grid-cols-5 gap-4'>
                <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <input
                        type='date'
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className='border rounded px-2 py-1 w-full'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <Calendar className='w-4 h-4 text-gray-500' />
                    <input
                        type='date'
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className='border rounded px-2 py-1 w-full'
                    />
                </div>

                <div className='flex items-center gap-2'>
                    <Filter className='w-4 h-4 text-gray-500' />
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className='border rounded px-2 py-1 w-full'
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

                <button
                    onClick={loadLaporan}
                    disabled={loading}
                    className='bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 flex items-center justify-center gap-2'
                >
                    {loading ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                    ) : (
                        'Tampilkan'
                    )}
                </button>

                <div className='flex gap-2'>
                    <button
                        onClick={() => exportLaporan('pdf')}
                        className='bg-red-600 hover:bg-red-700 text-white rounded px-3 py-2 flex items-center gap-1'
                    >
                        <FileText className='w-4 h-4' />
                        PDF
                    </button>

                    <button
                        onClick={() => exportLaporan('excel')}
                        className='bg-green-600 hover:bg-green-700 text-white rounded px-3 py-2 flex items-center gap-1'
                    >
                        <FileSpreadsheet className='w-4 h-4' />
                        Excel
                    </button>
                </div>
            </div>

            {/* ERROR */}
            {error && <p className='text-red-600'>{error}</p>}

            {/* SUMMARY */}
            {summary && (
                <div className='grid md:grid-cols-5 gap-4'>
                    <SummaryCard
                        title='Total Pesanan'
                        value={summary.total_pesanan}
                    />
                    <SummaryCard
                        title='Transaksi'
                        value={summary.total_transaksi}
                    />
                    <SummaryCard
                        title='Nilai Pesanan'
                        value={rupiah(summary.total_nilai_pesanan)}
                    />
                    <SummaryCard
                        title='Pendapatan'
                        value={rupiah(summary.total_pendapatan)}
                    />
                    <SummaryCard
                        title='Sisa Tagihan'
                        value={rupiah(summary.total_sisa_tagihan)}
                    />
                </div>
            )}

            {/* TABLE */}
            {list.length > 0 && (
                <div className='overflow-auto bg-white border rounded-xl'>
                    <table className='w-full text-sm'>
                        <thead className='bg-gray-100'>
                            <tr>
                                <Th>No</Th>
                                <Th>Customer</Th>
                                <Th>Produk</Th>
                                <Th>Qty</Th>
                                <Th>Total</Th>
                                <Th>Pembayaran</Th>
                                <Th>Status</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((item, i) => {
                                let bayar = 0
                                if (item.pembayaran.jenis === 'DP')
                                    bayar = item.total / 2
                                if (item.pembayaran.jenis === 'FULL')
                                    bayar = item.pembayaran.jumlah

                                return (
                                    <tr
                                        key={i}
                                        className='border-t'
                                    >
                                        <Td>{i + 1}</Td>
                                        <Td>{item.customer}</Td>
                                        <Td>{item.produk}</Td>
                                        <Td>{item.qty}</Td>
                                        <Td>{rupiah(item.total)}</Td>
                                        <Td>
                                            {item.pembayaran.jenis} –{' '}
                                            {rupiah(bayar)}
                                            <br />
                                            <span className='text-xs text-gray-500'>
                                                {item.pembayaran.status}
                                            </span>
                                        </Td>
                                        <Td>
                                            <StatusBadge status={item.status} />
                                        </Td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

// =====================
// KOMPONEN KECIL
// =====================
const SummaryCard = ({ title, value }) => (
    <div className='bg-white border rounded-xl p-4'>
        <p className='text-sm text-gray-500'>{title}</p>
        <p className='text-lg font-bold'>{value}</p>
    </div>
)

const Th = ({ children }) => (
    <th className='px-3 py-2 text-left border-b'>{children}</th>
)

const Td = ({ children }) => <td className='px-3 py-2 border-b'>{children}</td>

const StatusBadge = ({ status }) => {
    const map = {
        MENUNGGU_PEMBAYARAN: 'bg-yellow-100 text-yellow-700',
        DIPROSES: 'bg-blue-100 text-blue-700',
        SELESAI: 'bg-green-100 text-green-700',
        DIBATALKAN: 'bg-red-100 text-red-700',
    }

    return (
        <span className={`px-2 py-1 rounded text-xs ${map[status]}`}>
            {status}
        </span>
    )
}

export default LaporanAdmin
