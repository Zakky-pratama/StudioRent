import React, { useCallback, useEffect, useState } from 'react';
import { Eye, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import BackOfficeLayout from '../components/layout/BackOfficeLayout';
import DataTable from '../components/ui/DataTable';
import FormModal from '../components/ui/FormModal';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { extractApiError, formatRupiah } from '../utils/formatters';

const EMPTY_FORM = {
    category_id: '',
    nama_alat: '',
    merk: '',
    spesifikasi: '',
    kondisi: 'Baik',
    harga_sewa: '',
    satuan_sewa: 'hari',
    stok: '1',
    gambar: '',
};

export default function EquipmentsPage() {
    const { isAdmin } = useAuth();

    const [equipments, setEquipments] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [page, setPage] = useState(1);

    const [detailItem, setDetailItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        document.title = 'StudioRent - Data Alat & Studio';
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 250);
        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        api.get('/categories')
            .then((res) => setCategories(res.data?.data || []))
            .catch(() => setCategories([]));
    }, []);

    const fetchEquipments = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, per_page: 10 };
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
            if (categoryFilter) params.category_id = categoryFilter;

            const res = await api.get('/equipments', { params });
            setEquipments(res.data?.data || []);
            setPagination(res.data?.meta || null);
        } catch {
            setError('Gagal memuat data alat musik dan ruang studio.');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, categoryFilter]);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({
            ...EMPTY_FORM,
            category_id: categories[0]?.id ? String(categories[0].id) : '',
        });
        setFormError('');
        setFieldErrors({});
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingItem(item);
        setForm({
            category_id: String(item.category_id || item.category?.id || ''),
            nama_alat: item.nama_alat || '',
            merk: item.merk || '',
            spesifikasi: item.spesifikasi || '',
            kondisi: item.kondisi || 'Baik',
            harga_sewa: String(item.harga_sewa ?? ''),
            satuan_sewa: item.satuan_sewa || 'hari',
            stok: String(item.stok ?? 0),
            gambar: item.gambar || '',
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
            const payload = {
                ...form,
                category_id: form.category_id ? Number(form.category_id) : '',
                harga_sewa: form.harga_sewa === '' ? '' : Number(form.harga_sewa),
                stok: form.stok === '' ? '' : Number(form.stok),
                gambar: form.gambar.trim() ? form.gambar.trim() : null,
            };

            if (editingItem) {
                await api.put(`/equipments/${editingItem.id}`, payload);
                setFeedback(`Data "${form.nama_alat}" berhasil diperbarui.`);
            } else {
                await api.post('/equipments', payload);
                setFeedback(`Alat "${form.nama_alat}" berhasil ditambahkan.`);
            }

            setModalOpen(false);
            await fetchEquipments();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menyimpan data alat.');
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
            await api.delete(`/equipments/${deleteTarget.id}`);
            setFeedback(`Data "${deleteTarget.nama_alat}" berhasil dihapus.`);
            setDeleteTarget(null);
            await fetchEquipments();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menghapus alat.');
            setError(parsed.message);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'nama_alat',
            label: 'Alat / Studio',
            render: (row) => (
                <div className="flex flex-col min-w-[200px]">
                    <span className="font-semibold text-slate-900">{row.nama_alat}</span>
                    <span className="text-xs text-slate-600">
                        {row.merk ? `${row.merk} • ` : ''}
                        {row.spesifikasi || '-'}
                    </span>
                </div>
            ),
        },
        {
            key: 'category',
            label: 'Kategori',
            cellClassName: 'whitespace-nowrap text-slate-700',
            render: (row) => row.category?.nama_kategori || '-',
        },
        {
            key: 'kondisi',
            label: 'Kondisi',
            cellClassName: 'whitespace-nowrap text-slate-700',
        },
        {
            key: 'harga_sewa',
            label: 'Tarif Sewa',
            headerClassName: 'text-right',
            cellClassName: 'text-right font-semibold text-slate-900 tabular-nums whitespace-nowrap',
            render: (row) => `${formatRupiah(row.harga_sewa)} / ${row.satuan_sewa}`,
        },
        {
            key: 'stok',
            label: 'Stok',
            headerClassName: 'text-center',
            cellClassName: 'text-center font-semibold tabular-nums whitespace-nowrap',
            render: (row) => (
                <StatusBadge
                    status={Number(row.stok) > 0 ? 'aktif' : 'terlambat'}
                    label={Number(row.stok) > 0 ? `${row.stok} Tersedia` : 'Habis / Disewa'}
                />
            ),
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
                        onClick={() => setDetailItem(row)}
                        aria-label={`Detail ${row.nama_alat}`}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <Eye className="w-4 h-4" aria-hidden="true" />
                    </button>

                    {isAdmin && (
                        <>
                            <button
                                type="button"
                                onClick={() => openEditModal(row)}
                                aria-label={`Edit ${row.nama_alat}`}
                                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                            >
                                <Pencil className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(row)}
                                aria-label={`Hapus ${row.nama_alat}`}
                                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 flex items-center justify-center"
                            >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </>
                    )}
                </div>
            ),
        },
    ];

    return (
        <BackOfficeLayout breadcrumb="Data Alat & Studio">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Data Alat &amp; Studio
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        {isAdmin
                            ? 'Kelola inventaris alat musik, tarif sewa, kondisi, dan ketersediaan ruang studio.'
                            : 'Daftar inventaris alat musik dan ruang studio (mode baca untuk Petugas).'}
                    </p>
                </div>

                {isAdmin && (
                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold shrink-0"
                    >
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        <span>Tambah Alat</span>
                    </button>
                )}
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
                title="Inventaris Alat & Studio"
                countLabel={pagination ? `${pagination.total} Item` : ''}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama alat, merk, atau spek..."
                filterValue={categoryFilter}
                onFilterChange={(val) => {
                    setCategoryFilter(val);
                    setPage(1);
                }}
                filterOptions={[
                    { value: '', label: 'Semua Kategori' },
                    ...categories.map((c) => ({ value: String(c.id), label: c.nama_kategori })),
                ]}
                toolbarRight={
                    <button
                        type="button"
                        onClick={fetchEquipments}
                        aria-label="Muat ulang inventaris"
                        className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </button>
                }
                columns={columns}
                data={equipments}
                loading={loading}
                error={error}
                onRetry={fetchEquipments}
                emptyTitle="Inventaris belum tersedia"
                emptyDescription="Belum ada alat atau ruang studio yang sesuai dengan pencarian Anda."
                pagination={pagination}
                onPageChange={setPage}
            />

            <FormModal
                open={Boolean(detailItem)}
                title={detailItem?.nama_alat || 'Detail Alat'}
                subtitle={detailItem?.category?.nama_kategori || ''}
                onClose={() => setDetailItem(null)}
            >
                {detailItem && (
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                        <div>
                            <dt className="text-xs text-slate-600">Merk</dt>
                            <dd className="font-semibold text-slate-900">{detailItem.merk || '-'}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-600">Kondisi</dt>
                            <dd className="font-semibold text-slate-900">{detailItem.kondisi}</dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-600">Tarif Sewa</dt>
                            <dd className="font-semibold text-slate-900 tabular-nums">
                                {formatRupiah(detailItem.harga_sewa)} / {detailItem.satuan_sewa}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-xs text-slate-600">Stok Tersedia</dt>
                            <dd className="font-semibold text-slate-900 tabular-nums">{detailItem.stok}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-xs text-slate-600">Spesifikasi</dt>
                            <dd className="font-medium text-slate-900">{detailItem.spesifikasi || '-'}</dd>
                        </div>
                    </dl>
                )}
            </FormModal>

            {isAdmin && (
                <>
                    <FormModal
                        open={modalOpen}
                        title={editingItem ? 'Edit Data Alat / Studio' : 'Tambah Alat / Studio Baru'}
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
                                    <label htmlFor="eq-cat" className="text-xs font-semibold text-slate-700">
                                        Kategori
                                    </label>
                                    <select
                                        id="eq-cat"
                                        value={form.category_id}
                                        onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                                        aria-invalid={Boolean(fieldErrors.category_id)}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                    >
                                        <option value="">-- Pilih Kategori --</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>
                                                {cat.nama_kategori}
                                            </option>
                                        ))}
                                    </select>
                                    {fieldErrors.category_id && (
                                        <p className="text-xs text-red-700" role="alert">
                                            {fieldErrors.category_id[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eq-nama" className="text-xs font-semibold text-slate-700">
                                        Nama Alat / Ruang Studio
                                    </label>
                                    <input
                                        id="eq-nama"
                                        type="text"
                                        value={form.nama_alat}
                                        onChange={(e) => setForm({ ...form, nama_alat: e.target.value })}
                                        aria-invalid={Boolean(fieldErrors.nama_alat)}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                    />
                                    {fieldErrors.nama_alat && (
                                        <p className="text-xs text-red-700" role="alert">
                                            {fieldErrors.nama_alat[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eq-merk" className="text-xs font-semibold text-slate-700">
                                        Merk
                                    </label>
                                    <input
                                        id="eq-merk"
                                        type="text"
                                        value={form.merk}
                                        onChange={(e) => setForm({ ...form, merk: e.target.value })}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eq-kondisi" className="text-xs font-semibold text-slate-700">
                                        Kondisi
                                    </label>
                                    <select
                                        id="eq-kondisi"
                                        value={form.kondisi}
                                        onChange={(e) => setForm({ ...form, kondisi: e.target.value })}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                    >
                                        <option value="Sangat Baik">Sangat Baik</option>
                                        <option value="Baik">Baik</option>
                                        <option value="Perlu Servis">Perlu Servis</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="eq-spek" className="text-xs font-semibold text-slate-700">
                                    Spesifikasi Singkat
                                </label>
                                <input
                                    id="eq-spek"
                                    type="text"
                                    value={form.spesifikasi}
                                    onChange={(e) => setForm({ ...form, spesifikasi: e.target.value })}
                                    className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eq-harga" className="text-xs font-semibold text-slate-700">
                                        Harga Sewa (Rp)
                                    </label>
                                    <input
                                        id="eq-harga"
                                        type="number"
                                        min={0}
                                        value={form.harga_sewa}
                                        onChange={(e) => setForm({ ...form, harga_sewa: e.target.value })}
                                        aria-invalid={Boolean(fieldErrors.harga_sewa)}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 tabular-nums focus:bg-white focus:border-amber-800 focus:outline-none"
                                    />
                                    {fieldErrors.harga_sewa && (
                                        <p className="text-xs text-red-700" role="alert">
                                            {fieldErrors.harga_sewa[0]}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eq-satuan" className="text-xs font-semibold text-slate-700">
                                        Satuan Sewa
                                    </label>
                                    <select
                                        id="eq-satuan"
                                        value={form.satuan_sewa}
                                        onChange={(e) => setForm({ ...form, satuan_sewa: e.target.value })}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                    >
                                        <option value="hari">Per Hari</option>
                                        <option value="jam">Per Jam</option>
                                    </select>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor="eq-stok" className="text-xs font-semibold text-slate-700">
                                        Stok
                                    </label>
                                    <input
                                        id="eq-stok"
                                        type="number"
                                        min={0}
                                        value={form.stok}
                                        onChange={(e) => setForm({ ...form, stok: e.target.value })}
                                        aria-invalid={Boolean(fieldErrors.stok)}
                                        className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 tabular-nums focus:bg-white focus:border-amber-800 focus:outline-none"
                                    />
                                    {fieldErrors.stok && (
                                        <p className="text-xs text-red-700" role="alert">
                                            {fieldErrors.stok[0]}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label htmlFor="eq-gambar" className="text-xs font-semibold text-slate-700">
                                    URL / Path Gambar (Opsional)
                                </label>
                                <input
                                    id="eq-gambar"
                                    type="text"
                                    value={form.gambar}
                                    onChange={(e) => setForm({ ...form, gambar: e.target.value })}
                                    placeholder="/images/alat.jpg atau URL gambar"
                                    className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                                />
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
                                    {submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </FormModal>

                    <FormModal
                        open={Boolean(deleteTarget)}
                        title="Hapus Data Alat"
                        onClose={() => setDeleteTarget(null)}
                        maxWidthClass="max-w-md"
                    >
                        <div className="flex flex-col gap-4">
                            <p className="text-sm text-slate-700">
                                Hapus <strong className="text-slate-900">{deleteTarget?.nama_alat}</strong> dari daftar inventaris?
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
                </>
            )}
        </BackOfficeLayout>
    );
}
