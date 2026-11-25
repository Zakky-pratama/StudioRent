import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import BackOfficeLayout from '../components/layout/BackOfficeLayout';
import DataTable from '../components/ui/DataTable';
import FormModal from '../components/ui/FormModal';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../lib/api';
import { extractApiError, getInitials } from '../utils/formatters';

const EMPTY_FORM = {
    nama: '',
    nim_nik: '',
    instansi: '',
    email: '',
    nomor_telepon: '',
    alamat: '',
    status: 'aktif',
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        document.title = 'StudioRent - Data Penyewa';
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCustomers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, per_page: 10 };
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
            if (statusFilter) params.status = statusFilter;

            const res = await api.get('/customers', { params });
            setCustomers(res.data?.data || []);
            setPagination(res.data?.meta || null);
        } catch {
            setError('Gagal memuat data penyewa.');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, statusFilter]);

    useEffect(() => {
        fetchCustomers();
    }, [fetchCustomers]);

    const openCreateModal = () => {
        setEditingCustomer(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setFieldErrors({});
        setModalOpen(true);
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setForm({
            nama: customer.nama || '',
            nim_nik: customer.nim_nik || '',
            instansi: customer.instansi || '',
            email: customer.email || '',
            nomor_telepon: customer.nomor_telepon || '',
            alamat: customer.alamat || '',
            status: customer.status || 'aktif',
        });
        setFormError('');
        setFieldErrors({});
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setFormError('');
        setFieldErrors({});

        try {
            if (editingCustomer) {
                await api.put(`/customers/${editingCustomer.id}`, form);
                setFeedback(`Data penyewa "${form.nama}" berhasil diperbarui.`);
            } else {
                await api.post('/customers', form);
                setFeedback(`Penyewa "${form.nama}" berhasil ditambahkan.`);
            }
            setModalOpen(false);
            await fetchCustomers();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menyimpan data penyewa.');
            setFormError(parsed.message);
            setFieldErrors(parsed.errors);
        } finally {
            setSubmitting(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        setError('');
        try {
            await api.delete(`/customers/${deleteTarget.id}`);
            setFeedback(`Data penyewa "${deleteTarget.nama}" berhasil dihapus.`);
            setDeleteTarget(null);
            await fetchCustomers();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menghapus penyewa.');
            setError(parsed.message);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'nama',
            label: 'Penyewa',
            render: (row) => (
                <div className="flex items-center gap-3 min-w-[200px]">
                    <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-800 text-xs font-bold flex items-center justify-center shrink-0">
                        {getInitials(row.nama)}
                    </span>
                    <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-slate-900 truncate">{row.nama}</span>
                        <span className="text-xs text-slate-600 truncate">
                            {row.instansi || 'Perorangan'}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            key: 'nim_nik',
            label: 'NIM / NIK',
            cellClassName: 'font-medium text-slate-800 tabular-nums whitespace-nowrap',
        },
        {
            key: 'kontak',
            label: 'Kontak',
            render: (row) => (
                <div className="flex flex-col text-xs">
                    <span className="text-slate-900 font-medium">{row.nomor_telepon}</span>
                    <span className="text-slate-600">{row.email}</span>
                </div>
            ),
        },
        {
            key: 'rentals_count',
            label: 'Riwayat Sewa',
            headerClassName: 'text-center',
            cellClassName: 'text-center tabular-nums text-slate-700',
            render: (row) => `${row.rentals_count ?? 0}x`,
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
                <div className="inline-flex items-center justify-end gap-1.5">
                    <button
                        type="button"
                        onClick={() => openEditModal(row)}
                        aria-label={`Edit penyewa ${row.nama}`}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        aria-label={`Hapus penyewa ${row.nama}`}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 flex items-center justify-center"
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <BackOfficeLayout breadcrumb="Data Penyewa">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Data Penyewa
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Kelola daftar penyewa terdaftar serta cari berdasarkan nama, NIM/NIK, atau instansi.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold shrink-0"
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Tambah Penyewa</span>
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
                title="Daftar Penyewa"
                countLabel={pagination ? `${pagination.total} Orang` : ''}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama atau NIM/NIK..."
                filterValue={statusFilter}
                onFilterChange={(val) => {
                    setStatusFilter(val);
                    setPage(1);
                }}
                filterOptions={[
                    { value: '', label: 'Semua Status' },
                    { value: 'aktif', label: 'Aktif' },
                    { value: 'nonaktif', label: 'Nonaktif' },
                ]}
                toolbarRight={
                    <button
                        type="button"
                        onClick={fetchCustomers}
                        aria-label="Muat ulang data penyewa"
                        className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </button>
                }
                columns={columns}
                data={customers}
                loading={loading}
                error={error}
                onRetry={fetchCustomers}
                emptyTitle="Belum ada data penyewa"
                emptyDescription="Belum ada penyewa yang cocok dengan kata kunci atau status yang dipilih."
                pagination={pagination}
                onPageChange={setPage}
            />

            <FormModal
                open={modalOpen}
                title={editingCustomer ? 'Edit Data Penyewa' : 'Tambah Penyewa Baru'}
                onClose={() => setModalOpen(false)}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    {formError && (
                        <div
                            role="alert"
                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                        >
                            {formError}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cust-nama" className="text-xs font-semibold text-slate-700">
                                Nama Lengkap
                            </label>
                            <input
                                id="cust-nama"
                                type="text"
                                value={form.nama}
                                onChange={(e) => setForm({ ...form, nama: e.target.value })}
                                aria-invalid={Boolean(fieldErrors.nama)}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.nama && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.nama[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cust-nim" className="text-xs font-semibold text-slate-700">
                                NIM / NIK
                            </label>
                            <input
                                id="cust-nim"
                                type="text"
                                value={form.nim_nik}
                                onChange={(e) => setForm({ ...form, nim_nik: e.target.value })}
                                aria-invalid={Boolean(fieldErrors.nim_nik)}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.nim_nik && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.nim_nik[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cust-instansi" className="text-xs font-semibold text-slate-700">
                                Instansi / Komunitas (Opsional)
                            </label>
                            <input
                                id="cust-instansi"
                                type="text"
                                value={form.instansi}
                                onChange={(e) => setForm({ ...form, instansi: e.target.value })}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.instansi && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.instansi[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cust-phone" className="text-xs font-semibold text-slate-700">
                                Nomor Telepon / WA
                            </label>
                            <input
                                id="cust-phone"
                                type="text"
                                value={form.nomor_telepon}
                                onChange={(e) => setForm({ ...form, nomor_telepon: e.target.value })}
                                aria-invalid={Boolean(fieldErrors.nomor_telepon)}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.nomor_telepon && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.nomor_telepon[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cust-email" className="text-xs font-semibold text-slate-700">
                                Email
                            </label>
                            <input
                                id="cust-email"
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                aria-invalid={Boolean(fieldErrors.email)}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.email && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="cust-status" className="text-xs font-semibold text-slate-700">
                                Status
                            </label>
                            <select
                                id="cust-status"
                                value={form.status}
                                onChange={(e) => setForm({ ...form, status: e.target.value })}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            >
                                <option value="aktif">Aktif</option>
                                <option value="nonaktif">Nonaktif</option>
                            </select>
                            {fieldErrors.status && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.status[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cust-alamat" className="text-xs font-semibold text-slate-700">
                            Alamat
                        </label>
                        <textarea
                            id="cust-alamat"
                            rows={3}
                            value={form.alamat}
                            onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                            aria-invalid={Boolean(fieldErrors.alamat)}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                        />
                        {fieldErrors.alamat && (
                            <p className="text-xs text-red-700" role="alert">
                                {fieldErrors.alamat[0]}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-semibold"
                        >
                            {submitting ? 'Menyimpan...' : editingCustomer ? 'Simpan Perubahan' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={Boolean(deleteTarget)}
                title="Hapus Data Penyewa"
                onClose={() => setDeleteTarget(null)}
                maxWidthClass="max-w-md"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-700">
                        Apakah Anda yakin ingin menghapus data penyewa{' '}
                        <strong className="text-slate-900">{deleteTarget?.nama}</strong>?
                    </p>
                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={() => setDeleteTarget(null)}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="button"
                            disabled={deleting}
                            onClick={handleConfirmDelete}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold"
                        >
                            {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                        </button>
                    </div>
                </div>
            </FormModal>
        </BackOfficeLayout>
    );
}
