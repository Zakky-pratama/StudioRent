import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Download, Eye, Hourglass, ReceiptText, Wallet } from 'lucide-react';
import BackOfficeLayout from '../components/layout/BackOfficeLayout';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import RentalDetailModal from '../components/rentals/RentalDetailModal';
import api from '../lib/api';
import { downloadRentalsCsv, formatRupiah, formatTanggal } from '../utils/formatters';

export default function ReportsPage() {
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [detailRental, setDetailRental] = useState(null);

    useEffect(() => {
        document.title = 'StudioRent - Laporan Penyewaan';
    }, []);

    const fetchRentals = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get('/rentals', { params: { per_page: 100 } });
            setRentals(res.data?.data || []);
        } catch {
            setError('Gagal memuat data laporan penyewaan.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRentals();
    }, [fetchRentals]);

    const filteredRentals = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return rentals.filter((rental) => {
            if (statusFilter !== 'all' && rental.status !== statusFilter) {
                return false;
            }
            if (startDate && rental.tanggal_sewa < startDate) {
                return false;
            }
            if (endDate && rental.tanggal_sewa > endDate) {
                return false;
            }
            if (!keyword) {
                return true;
            }

            const customerName = (rental.customer?.nama || '').toLowerCase();
            const nim = (rental.customer?.nim_nik || '').toLowerCase();
            const kode = (rental.kode_sewa || '').toLowerCase();
            const itemNames = (rental.items || [])
                .map((item) => item.nama_alat || '')
                .join(' ')
                .toLowerCase();

            return (
                customerName.includes(keyword) ||
                nim.includes(keyword) ||
                kode.includes(keyword) ||
                itemNames.includes(keyword)
            );
        });
    }, [rentals, statusFilter, startDate, endDate, search]);

    const summary = useMemo(() => {
        const totalPendapatan = filteredRentals.reduce(
            (sum, row) => sum + Number(row.total_biaya || 0),
            0
        );
        const aktifCount = filteredRentals.filter((r) => r.status !== 'dikembalikan').length;
        const selesaiCount = filteredRentals.filter((r) => r.status === 'dikembalikan').length;
        return { totalPendapatan, aktifCount, selesaiCount };
    }, [filteredRentals]);

    const columns = [
        {
            key: 'kode_sewa',
            label: 'ID Sewa',
            cellClassName: 'font-semibold text-slate-900 whitespace-nowrap',
        },
        {
            key: 'tanggal_sewa',
            label: 'Tanggal Sewa',
            cellClassName: 'whitespace-nowrap text-slate-700',
            render: (row) => formatTanggal(row.tanggal_sewa),
        },
        {
            key: 'customer',
            label: 'Penyewa',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{row.customer?.nama || '-'}</span>
                    <span className="text-xs text-slate-600">
                        {row.customer?.instansi || row.customer?.nim_nik || '-'}
                    </span>
                </div>
            ),
        },
        {
            key: 'petugas',
            label: 'Petugas',
            cellClassName: 'text-slate-700 whitespace-nowrap',
            render: (row) => row.petugas?.name || '-',
        },
        {
            key: 'items',
            label: 'Item Alat',
            render: (row) => (
                <span className="text-xs text-slate-700">
                    {(row.items || []).map((i) => `${i.nama_alat} (${i.jumlah}x)`).join(', ')}
                </span>
            ),
        },
        {
            key: 'total_biaya',
            label: 'Pendapatan',
            headerClassName: 'text-right',
            cellClassName: 'text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap',
            render: (row) => formatRupiah(row.total_biaya),
        },
        {
            key: 'status',
            label: 'Status',
            headerClassName: 'text-center',
            cellClassName: 'text-center whitespace-nowrap',
            render: (row) => <StatusBadge status={row.status} />,
        },
        {
            key: 'aksi',
            label: 'Detail',
            headerClassName: 'text-right',
            cellClassName: 'text-right whitespace-nowrap',
            render: (row) => (
                <button
                    type="button"
                    onClick={() => setDetailRental(row)}
                    aria-label={`Lihat detail laporan ${row.kode_sewa}`}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 inline-flex items-center justify-center"
                >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                </button>
            ),
        },
    ];

    return (
        <BackOfficeLayout breadcrumb="Laporan Penyewaan">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Laporan Penyewaan
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Rekapitulasi transaksi dan pendapatan sewa berdasarkan periode tanggal dan status.
                    </p>
                </div>

                <button
                    type="button"
                    disabled={filteredRentals.length === 0}
                    onClick={() => downloadRentalsCsv(filteredRentals, 'laporan-penyewaan-studiorent.csv')}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-semibold shrink-0"
                >
                    <Download className="w-4 h-4" aria-hidden="true" />
                    <span>Ekspor CSV</span>
                </button>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="flex flex-col gap-1">
                    <label htmlFor="report-date-start" className="text-xs font-semibold text-slate-700">
                        Dari Tanggal
                    </label>
                    <input
                        id="report-date-start"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="report-date-end" className="text-xs font-semibold text-slate-700">
                        Sampai Tanggal
                    </label>
                    <input
                        id="report-date-end"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label htmlFor="report-status" className="text-xs font-semibold text-slate-700">
                        Status Transaksi
                    </label>
                    <select
                        id="report-status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                    >
                        <option value="all">Semua Status</option>
                        <option value="disewa">Disewa</option>
                        <option value="terlambat">Terlambat</option>
                        <option value="dikembalikan">Dikembalikan</option>
                    </select>
                </div>

                <div className="flex items-end">
                    <button
                        type="button"
                        onClick={() => {
                            setStartDate('');
                            setEndDate('');
                            setStatusFilter('all');
                            setSearch('');
                        }}
                        className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                    >
                        Reset Filter
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Transaksi"
                    value={filteredRentals.length}
                    unit="Transaksi"
                    info="Sesuai filter periode & status"
                    icon={ReceiptText}
                />
                <StatCard
                    label="Total Pendapatan"
                    value={formatRupiah(summary.totalPendapatan)}
                    info="Akumulasi total biaya terfilter"
                    icon={Wallet}
                />
                <StatCard
                    label="Masih Berjalan"
                    value={summary.aktifCount}
                    unit="Transaksi"
                    info="Status disewa dan terlambat"
                    icon={Hourglass}
                />
                <StatCard
                    label="Sudah Dikembalikan"
                    value={summary.selesaiCount}
                    unit="Transaksi"
                    info="Transaksi selesai terverifikasi"
                    icon={CheckCircle2}
                />
            </div>

            <DataTable
                title="Rincian Laporan Penyewaan"
                countLabel={`${filteredRentals.length} Baris`}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari ID, penyewa, atau alat..."
                columns={columns}
                data={filteredRentals}
                loading={loading}
                error={error}
                onRetry={fetchRentals}
                emptyTitle="Tidak ada transaksi pada rentang filter ini"
                emptyDescription="Ubah rentang tanggal atau status untuk melihat laporan lainnya."
            />

            <RentalDetailModal
                rental={detailRental}
                onClose={() => setDetailRental(null)}
            />
        </BackOfficeLayout>
    );
}
