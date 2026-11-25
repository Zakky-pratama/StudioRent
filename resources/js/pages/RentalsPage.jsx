import React, { useCallback, useEffect, useState } from 'react';
import { Eye, Plus, RefreshCw } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import BackOfficeLayout from '../components/layout/BackOfficeLayout';
import DataTable from '../components/ui/DataTable';
import StatusBadge from '../components/ui/StatusBadge';
import RentalCreateModal from '../components/rentals/RentalCreateModal';
import RentalDetailModal from '../components/rentals/RentalDetailModal';
import api from '../lib/api';
import {
    extractApiError,
    formatRupiah,
    formatTanggal,
    getInitials,
} from '../utils/formatters';

export default function RentalsPage() {
    const location = useLocation();
    const prefillRental = location.state?.prefillRental || null;

    const [rentals, setRentals] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(() => Boolean(prefillRental));
    const [detailRental, setDetailRental] = useState(null);
    const [returningId, setReturningId] = useState(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        document.title = 'StudioRent - Transaksi Sewa';
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchRentals = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, per_page: 10 };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

            const res = await api.get('/rentals', { params });
            setRentals(res.data?.data || []);
            setPagination(res.data?.meta || null);
        } catch {
            setError('Gagal memuat daftar transaksi penyewaan.');
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, debouncedSearch]);

    useEffect(() => {
        fetchRentals();
    }, [fetchRentals]);

    const handleReturnRental = async (rentalId) => {
        setReturningId(rentalId);
        setFeedback('');
        try {
            const res = await api.put(`/rentals/${rentalId}/kembalikan`);
            const updated = res.data?.data || res.data;
            setFeedback(`Transaksi ${updated.kode_sewa} berhasil dikembalikan dan stok diperbarui.`);
            setDetailRental(null);
            await fetchRentals();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal memproses pengembalian.');
            setError(parsed.message);
        } finally {
            setReturningId(null);
        }
    };

    const columns = [
        {
            key: 'kode_sewa',
            label: 'ID Sewa',
            cellClassName: 'font-semibold whitespace-nowrap',
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
                            {row.customer?.nim_nik}
                            {row.customer?.instansi ? ` • ${row.customer.instansi}` : ''}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'items',
            label: 'Alat / Studio',
            render: (row) => (
                <div className="flex flex-wrap gap-1.5 max-w-xs">
                    {(row.items || []).map((item) => (
                        <span
                            key={item.id}
                            className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-xs font-medium"
                        >
                            {item.nama_alat} ({item.jumlah}x)
                        </span>
                    ))}
                </div>
            ),
        },
        {
            key: 'jadwal',
            label: 'Periode Sewa',
            cellClassName: 'whitespace-nowrap',
            render: (row) => (
                <div className="flex flex-col">
                    <span>
                        {formatTanggal(row.tanggal_sewa)} - {formatTanggal(row.tanggal_kembali_rencana)}
                    </span>
                    {row.tanggal_dikembalikan && (
                        <span className="text-xs text-slate-600">
                            Dikembalikan: {formatTanggal(row.tanggal_dikembalikan)}
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
                <div className="inline-flex items-center justify-end gap-2">
                    {row.status !== 'dikembalikan' && (
                        <button
                            type="button"
                            disabled={returningId === row.id}
                            onClick={() => handleReturnRental(row.id)}
                            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                row.status === 'terlambat'
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-slate-100 hover:bg-amber-800 hover:text-white text-slate-800'
                            } disabled:opacity-50`}
                        >
                            {returningId === row.id ? 'Memproses...' : 'Kembalikan'}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => setDetailRental(row)}
                        aria-label={`Detail transaksi ${row.kode_sewa}`}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <BackOfficeLayout breadcrumb="Transaksi Sewa">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Transaksi Sewa
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Catat penyewaan multi-item baru dan kelola pengembalian alat serta ruang studio.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => setCreateOpen(true)}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold shrink-0"
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Transaksi Sewa Baru</span>
                </button>
            </div>

            {feedback && (
                <div
                    role="status"
                    className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-sm font-medium text-green-800"
                >
                    {feedback}
                </div>
            )}

            <DataTable
                title="Daftar Transaksi"
                countLabel={pagination ? `${pagination.total} Transaksi` : ''}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari ID sewa, nama penyewa, atau alat..."
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
                        aria-label="Segarkan data transaksi"
                        className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </button>
                }
                columns={columns}
                data={rentals}
                loading={loading}
                error={error}
                onRetry={fetchRentals}
                emptyTitle="Belum ada transaksi penyewaan"
                emptyDescription="Tidak ditemukan transaksi yang cocok dengan pencarian atau status."
                pagination={pagination}
                onPageChange={setPage}
            />

            <RentalCreateModal
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                initialData={prefillRental}
                onSuccess={(created) => {
                    setFeedback(`Transaksi ${created.kode_sewa} berhasil dicatat.`);
                    fetchRentals();
                }}
            />

            <RentalDetailModal
                rental={detailRental}
                onClose={() => setDetailRental(null)}
                onReturn={handleReturnRental}
                returningId={returningId}
            />
        </BackOfficeLayout>
    );
}
