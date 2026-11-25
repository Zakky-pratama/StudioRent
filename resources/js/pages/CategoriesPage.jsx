import React, { useCallback, useEffect, useState } from 'react';
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import BackOfficeLayout from '../components/layout/BackOfficeLayout';
import DataTable from '../components/ui/DataTable';
import FormModal from '../components/ui/FormModal';
import api from '../lib/api';
import { extractApiError } from '../utils/formatters';

const EMPTY_FORM = {
    nama_kategori: '',
    deskripsi: '',
};

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [modalOpen, setModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        document.title = 'StudioRent - Kategori Alat';
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 250);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {};
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
            const res = await api.get('/categories', { params });
            setCategories(res.data?.data || []);
        } catch {
            setError('Gagal memuat daftar kategori.');
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const openCreateModal = () => {
        setEditingCategory(null);
        setForm(EMPTY_FORM);
        setFormError('');
        setFieldErrors({});
        setModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setForm({
            nama_kategori: category.nama_kategori || '',
            deskripsi: category.deskripsi || '',
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
            if (editingCategory) {
                await api.put(`/categories/${editingCategory.id}`, form);
                setFeedback(`Kategori "${form.nama_kategori}" berhasil diperbarui.`);
            } else {
                await api.post('/categories', form);
                setFeedback(`Kategori "${form.nama_kategori}" berhasil ditambahkan.`);
            }
            setModalOpen(false);
            await fetchCategories();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menyimpan kategori.');
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
            await api.delete(`/categories/${deleteTarget.id}`);
            setFeedback(`Kategori "${deleteTarget.nama_kategori}" berhasil dihapus.`);
            setDeleteTarget(null);
            await fetchCategories();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menghapus kategori.');
            setError(parsed.message);
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    };

    const columns = [
        {
            key: 'nama_kategori',
            label: 'Nama Kategori',
            cellClassName: 'font-semibold text-slate-900 whitespace-nowrap',
        },
        {
            key: 'deskripsi',
            label: 'Deskripsi',
            cellClassName: 'text-slate-600 text-sm',
            render: (row) => row.deskripsi || '-',
        },
        {
            key: 'equipments_count',
            label: 'Jumlah Alat',
            headerClassName: 'text-center',
            cellClassName: 'text-center font-semibold tabular-nums text-slate-800 whitespace-nowrap',
            render: (row) => `${row.equipments_count ?? 0} Item`,
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
                        aria-label={`Edit kategori ${row.nama_kategori}`}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        aria-label={`Hapus kategori ${row.nama_kategori}`}
                        className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 flex items-center justify-center"
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <BackOfficeLayout breadcrumb="Kategori Alat">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                        Kategori Alat
                    </h1>
                    <p className="text-sm text-slate-600 mt-1">
                        Kelola pengelompokan kategori alat musik dan ruang studio (Khusus Admin).
                    </p>
                </div>

                <button
                    type="button"
                    onClick={openCreateModal}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold shrink-0"
                >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    <span>Tambah Kategori</span>
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
                title="Daftar Kategori"
                countLabel={`${categories.length} Kategori`}
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Cari nama kategori..."
                toolbarRight={
                    <button
                        type="button"
                        onClick={fetchCategories}
                        aria-label="Muat ulang daftar kategori"
                        className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4" aria-hidden="true" />
                    </button>
                }
                columns={columns}
                data={categories}
                loading={loading}
                error={error}
                onRetry={fetchCategories}
                emptyTitle="Belum ada kategori"
                emptyDescription="Tambahkan kategori baru untuk mengelompokkan inventaris alat."
            />

            <FormModal
                open={modalOpen}
                title={editingCategory ? 'Edit Kategori Alat' : 'Tambah Kategori Baru'}
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

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-nama" className="text-xs font-semibold text-slate-700">
                            Nama Kategori
                        </label>
                        <input
                            id="cat-nama"
                            type="text"
                            value={form.nama_kategori}
                            onChange={(e) => setForm({ ...form, nama_kategori: e.target.value })}
                            aria-invalid={Boolean(fieldErrors.nama_kategori)}
                            className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                        />
                        {fieldErrors.nama_kategori && (
                            <p className="text-xs text-red-700" role="alert">
                                {fieldErrors.nama_kategori[0]}
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="cat-desc" className="text-xs font-semibold text-slate-700">
                            Deskripsi (Opsional)
                        </label>
                        <textarea
                            id="cat-desc"
                            rows={3}
                            value={form.deskripsi}
                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                        />
                        {fieldErrors.deskripsi && (
                            <p className="text-xs text-red-700" role="alert">
                                {fieldErrors.deskripsi[0]}
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
                            {submitting ? 'Menyimpan...' : editingCategory ? 'Simpan Perubahan' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </FormModal>

            <FormModal
                open={Boolean(deleteTarget)}
                title="Hapus Kategori"
                onClose={() => setDeleteTarget(null)}
                maxWidthClass="max-w-md"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-slate-700">
                        Hapus kategori{' '}
                        <strong className="text-slate-900">{deleteTarget?.nama_kategori}</strong>?
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
