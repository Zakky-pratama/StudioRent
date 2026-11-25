import React, { useCallback, useEffect, useState } from 'react';
import {
    Download,
    Hourglass,
    Plus,
    RefreshCw,
    Speaker,
    Users,
    Wallet,
} from 'lucide-react';
import BackOfficeLayout from '../components/layout/BackOfficeLayout';
import StatCard from '../components/ui/StatCard';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import RentalCreateModal from '../components/rentals/RentalCreateModal';
import RentalDeleteModal from '../components/rentals/RentalDeleteModal';
import RentalDetailModal from '../components/rentals/RentalDetailModal';
import RentalRescheduleModal from '../components/rentals/RentalRescheduleModal';
import RentalRowActions from '../components/rentals/RentalRowActions';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import {
    downloadRentalsCsv,
    extractApiError,
    formatRentalCreatedMessage,
    formatRupiah,
    formatTanggal,
    getInitials,
} from '../utils/formatters';

export default function DashboardPage() {
    const { isAdmin } = useAuth();
    const [stats, setStats] = useState(null);
    const [statsError, setStatsError] = useState('');

    const [rentals, setRentals] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loadingRentals, setLoadingRentals] = useState(true);
    const [rentalsError, setRentalsError] = useState('');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [detailRental, setDetailRental] = useState(null);
    const [rescheduleRental, setRescheduleRental] = useState(null);
    const [deleteRental, setDeleteRental] = useState(null);
    const [returningId, setReturningId] = useState(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        document.title = 'StudioRent - Dashboard Ringkasan';
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchStats = useCallback(async () => {
        setStatsError('');
        try {
            const res = await api.get('/stats');
            setStats(res.data);
        } catch {
            setStatsError('Gagal memuat ringkasan KPI.');
        }
    }, []);

    const fetchRentals = useCallback(async () => {
        setLoadingRentals(true);
        setRentalsError('');
        try {
            const params = { page, per_page: 8 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

            const res = await api.get('/rentals', { params });
            setRentals(res.data?.data || []);
            setPagination(res.data?.meta || null);
        } catch {
            setRentalsError('Gagal memuat data transaksi penyewaan.');
        } finally {
            setLoadingRentals(false);
        }
    }, [page, statusFilter, debouncedSearch]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    useEffect(() => {
        fetchRentals();
    }, [fetchRentals]);

    const handleReturnRental = async (rentalId) => {
        setReturningId(rentalId);
        setFeedback('');
        try {
            const res = await api.put(`/rentals/${rentalId}/kembalikan`);
            const updated = res.data?.data || res.data;
            setFeedback(`Transaksi ${updated.kode_sewa} berhasil ditandai dikembalikan.`);
            setDetailRental(null);
            await Promise.all([fetchStats(), fetchRentals()]);
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal memproses pengembalian alat.');
            setRentalsError(parsed.message);
        } finally {
            setReturningId(null);
        }
    };

    const columns = [
        {
            key: 'kode_sewa',
            label: 'ID Sewa',
            cellClassName: 'font-semibold text-slate-900 whitespace-nowrap',
            render: (row) => (
                <span className={row.status === 'terlambat' ? 'text-red-700' : 'text-slate-900'}>
                    {row.kode_sewa}
                </span>
            ),
        },
        {
            key: 'customer',
            label: 'Penyewa',
            render: (row) => (
                <div className="flex items-center gap-3 min-w-[180px]">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {getInitials(row.customer?.nama)}
                    </span>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 truncate">
                            {row.customer?.nama || '-'}
                        </span>
                        <span className="text-xs text-slate-600 truncate">
                            {row.customer?.instansi || row.customer?.nim_nik || '-'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            label: 'Alat / Ruang',
            render: (row) => (
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {(row.items || []).map((item) => (
                        <span
                            key={item.id}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-medium"
                        >
                            {item.nama_alat}
                            {item.jumlah > 1 ? ` (${item.jumlah}x)` : ''}
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'jadwal',
            label: 'Jadwal Rental',
            cellClassName: 'whitespace-nowrap',
            render: (row) => (
                <div className="flex flex-col">
                    <span className="text-sm text-slate-900">
                        {formatTanggal(row.tanggal_sewa)} - {formatTanggal(row.tanggal_kembali_rencana)}
                    </span>
                    {row.tanggal_dikembalikan && (
                        <span className="text-xs text-slate-600">
                            Kembali: {formatTanggal(row.tanggal_dikembalikan)}
                        </span>
                    )}
                </div>
            ),
        },
        {
            key: 'total_biaya',
            label: 'Total Biaya',
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
            label: 'Aksi',
            headerClassName: 'text-right',
            cellClassName: 'text-right whitespace-nowrap',
            render: (row) => (
                <RentalRowActions
                    row={row}
                    isAdmin={isAdmin}
                    returningId={returningId}
                    onReturn={handleReturnRental}
                    onReschedule={setRescheduleRental}
                    onDetail={setDetailRental}
                    onDelete={setDeleteRental}
                />
            ),
        },
    ];

    return (
        <BackOfficeLayout breadcrumb="Dashboard Ringkasan">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Dashboard Ringkasan
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Pantau inventaris alat musik, penyewaan aktif, dan pendapatan rental dari database.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                    <button
                        type="button"
                        disabled={rentals.length === 0}
                        onClick={() => downloadRentalsCsv(rentals)}
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
                    >
                        <Download className="w-4 h-4" aria-hidden="true" />
                        <span>Unduh Rekap</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Transaksi Sewa Baru</span>
                    </button>
                </div>
            </div>

            {feedback && (
                <div
                    role="status"
                    className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-800"
                >
                    {feedback}
                </div>
            )}

            {statsError ? (
                <div
                    role="alert"
                    className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center justify-between"
                >
                    <span>{statsError}</span>
                    <button
                        type="button"
                        onClick={fetchStats}
                        className="px-3 py-1.5 rounded-lg bg-white border border-red-200 text-xs font-semibold"
                    >
                        Muat Ulang
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        label="Total Alat & Studio"
                        value={stats ? stats.total_alat : '...'}
                        unit="Unit"
                        info={
                            stats
                                ? `${stats.total_tersedia} Tersedia • ${stats.total_disewa} Disewa`
                                : 'Memuat ringkasan stok'
                        }
                        icon={Speaker}
                    />
                    <StatCard
                        label="Penyewa Terdaftar"
                        value={stats ? stats.total_penyewa : '...'}
                        unit="Orang"
                        info="Total akun penyewa tersimpan"
                        icon={Users}
                    />
                    <StatCard
                        label="Sedang Disewa"
                        value={stats ? stats.transaksi_aktif : '...'}
                        unit="Transaksi"
                        info={
                            stats
                                ? `${stats.tenggat_hari_ini} jatuh tempo hingga hari ini`
                                : 'Memuat transaksi aktif'
                        }
                        icon={Hourglass}
                    />
                    <StatCard
                        label="Pendapatan Bulan Ini"
                        value={stats ? formatRupiah(stats.pendapatan_bulan_ini) : '...'}
                        info="Akumulasi transaksi bulan berjalan"
                        icon={Wallet}
                    />
                </div>
            )}

            <DataTable
                title="Transaksi Penyewaan"
                subtitle="Kelola pengembalian dan tenggat waktu peminjaman"
                countLabel={stats ? `${stats.transaksi_aktif} Aktif` : ''}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari ID sewa, alat, atau penyewa..."
                filterValue={statusFilter}
                onFilterChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                }}
                filterOptions={[
                    { value: 'all', label: 'Semua Status' },
                    { value: 'disewa', label: 'Sedang Disewa' },
                    { value: 'terlambat', label: 'Terlambat' },
                    { value: 'dikembalikan', label: 'Dikembalikan' },
                ]}
                toolbarRight={
                    <button
                        type="button"
                        onClick={fetchRentals}
                        aria-label="Muat ulang daftar transaksi"
                        className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </button>
                }
                columns={columns}
                data={rentals}
                loading={loadingRentals}
                error={rentalsError}
                onRetry={fetchRentals}
                emptyTitle="Belum ada transaksi penyewaan"
                emptyDescription="Belum ada transaksi yang sesuai filter, atau Anda dapat membuat transaksi sewa baru."
                pagination={pagination}
                onPageChange={setPage}
            />

            <RentalCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={(created) => {
                    setFeedback(formatRentalCreatedMessage(created));
                    fetchStats();
                    fetchRentals();
                }}
            />

            <RentalDetailModal
                rental={detailRental}
                onClose={() => setDetailRental(null)}
                onReturn={handleReturnRental}
                returningId={returningId}
                onReschedule={(target) => {
                    setDetailRental(null);
                    setRescheduleRental(target);
                }}
                onDelete={
                    isAdmin
                        ? (target) => {
                              setDetailRental(null);
                              setDeleteRental(target);
                          }
                        : null
                }
            />

            <RentalRescheduleModal
                rental={rescheduleRental}
                onClose={() => setRescheduleRental(null)}
                onSuccess={(updated) => {
                    setFeedback(`Jadwal transaksi ${updated.kode_sewa} berhasil diperbarui.`);
                    fetchStats();
                    fetchRentals();
                }}
            />

            <RentalDeleteModal
                rental={deleteRental}
                onClose={() => setDeleteRental(null)}
                onSuccess={(removed) => {
                    setFeedback(`Transaksi ${removed.kode_sewa} berhasil dihapus.`);
                    fetchStats();
                    fetchRentals();
                }}
            />
        </BackOfficeLayout>
    );
}
