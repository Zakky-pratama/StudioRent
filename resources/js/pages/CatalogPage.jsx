import React, { useCallback, useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Copy, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/ui/PublicNavbar';
import EquipmentCard from '../components/ui/EquipmentCard';
import RentalEstimatorPanel from '../components/ui/RentalEstimatorPanel';
import FormModal from '../components/ui/FormModal';
import StatusBadge from '../components/ui/StatusBadge';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import {
    addDaysIso,
    calculateDurationDays,
    formatRupiah,
    formatTanggal,
    getTodayIso,
} from '../utils/formatters';

export default function CatalogPage() {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [categories, setCategories] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [pagination, setPagination] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [availableOnly, setAvailableOnly] = useState(false);
    const [page, setPage] = useState(1);

    const [estimatorItems, setEstimatorItems] = useState([]);
    const [startDate, setStartDate] = useState(() => getTodayIso());
    const [endDate, setEndDate] = useState(() => addDaysIso(getTodayIso(), 2));

    const [detailEquipment, setDetailEquipment] = useState(null);
    const [proposalOpen, setProposalOpen] = useState(false);
    const [copiedSummary, setCopiedSummary] = useState(false);

    useEffect(() => {
        document.title = 'StudioRent - Katalog Alat Musik & Ruang Studio';
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
            const params = { page, per_page: 12 };
            if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
            if (selectedCategory) params.category_id = selectedCategory;
            if (availableOnly) params.available_only = 1;

            const res = await api.get('/equipments', { params });
            setEquipments(res.data?.data || []);
            setPagination(res.data?.meta || null);
        } catch {
            setError('Gagal memuat data katalog alat. Pastikan server Laravel berjalan.');
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, selectedCategory, availableOnly]);

    useEffect(() => {
        fetchEquipments();
    }, [fetchEquipments]);

    const handleCategorySelect = (catId) => {
        setSelectedCategory(catId);
        setPage(1);
    };

    const handleAddToEstimator = (equipment) => {
        setEstimatorItems((prev) => {
            const existing = prev.find((i) => i.id === equipment.id);
            if (existing) {
                if (existing.qty >= equipment.stok) return prev;
                return prev.map((i) =>
                    i.id === equipment.id ? { ...i, qty: i.qty + 1 } : i
                );
            }
            return [...prev, { ...equipment, qty: 1 }];
        });
    };

    const handleUpdateQty = (id, nextQty) => {
        if (nextQty <= 0) {
            setEstimatorItems((prev) => prev.filter((i) => i.id !== id));
            return;
        }
        setEstimatorItems((prev) =>
            prev.map((i) =>
                i.id === id ? { ...i, qty: Math.min(nextQty, Number(i.stok)) } : i
            )
        );
    };

    const handleRemoveItem = (id) => {
        setEstimatorItems((prev) => prev.filter((i) => i.id !== id));
    };

    const handleResetFilters = () => {
        setSearch('');
        setDebouncedSearch('');
        setSelectedCategory('');
        setAvailableOnly(false);
        setPage(1);
    };

    const durationDays = calculateDurationDays(startDate, endDate);
    const totalEstimasi = estimatorItems.reduce(
        (sum, item) => sum + Number(item.harga_sewa) * item.qty * durationDays,
        0
    );

    const handleCopySummary = async () => {
        const lines = [
            'Estimasi Penyewaan StudioRent',
            `Jadwal: ${formatTanggal(startDate)} s.d. ${formatTanggal(endDate)} (${durationDays} Hari)`,
            ...estimatorItems.map(
                (i) =>
                    `- ${i.nama_alat} (${i.qty}x @ ${formatRupiah(i.harga_sewa)}/${i.satuan_sewa}) = ${formatRupiah(
                        Number(i.harga_sewa) * i.qty * durationDays
                    )}`
            ),
            `Total Estimasi: ${formatRupiah(totalEstimasi)}`,
        ].join('\n');

        try {
            await navigator.clipboard.writeText(lines);
            setCopiedSummary(true);
            setTimeout(() => setCopiedSummary(false), 2000);
        } catch {
            setCopiedSummary(false);
        }
    };

    const handleProceedAsStaff = () => {
        setProposalOpen(false);
        navigate('/rentals', {
            state: {
                prefillRental: {
                    startDate,
                    endDate,
                    items: estimatorItems,
                },
            },
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50">
            <PublicNavbar searchValue={search} onSearchChange={setSearch} />

            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-6">
                <section className="flex flex-col gap-5">
                    <div className="flex flex-col gap-1.5">
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                            Katalog Alat Musik &amp; Ruang Studio
                        </h1>
                        <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
                            Pantau ketersediaan unit secara real-time dan hitung estimasi biaya sewa Anda.
                        </p>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter kategori alat">
                            <button
                                type="button"
                                onClick={() => handleCategorySelect('')}
                                className={`min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    selectedCategory === ''
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                            >
                                Semua
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategorySelect(String(cat.id))}
                                    className={`min-h-[40px] px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        selectedCategory === String(cat.id)
                                            ? 'bg-slate-900 text-white'
                                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }`}
                                >
                                    {cat.nama_kategori}
                                </button>
                            ))}
                        </div>

                        <label
                            htmlFor="catalog-available-toggle"
                            className="inline-flex items-center gap-3 px-3 py-2 min-h-[44px] rounded-lg hover:bg-slate-50 select-none"
                        >
                            <input
                                id="catalog-available-toggle"
                                type="checkbox"
                                checked={availableOnly}
                                onChange={(e) => {
                                    setAvailableOnly(e.target.checked);
                                    setPage(1);
                                }}
                                className="w-4 h-4 accent-slate-900 rounded"
                            />
                            <span className="text-sm font-medium text-slate-800">
                                Hanya tampilkan yang tersedia (Stok &gt; 0)
                            </span>
                        </label>
                    </div>
                </section>

                <section className="flex flex-col xl:flex-row items-start gap-6">
                    <div className="flex-1 min-w-0 w-full flex flex-col gap-6">
                        {loading ? (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
                                role="status"
                                aria-label="Memuat katalog alat"
                            >
                                {[1, 2, 3, 4].map((skeleton) => (
                                    <div
                                        key={skeleton}
                                        className="bg-white rounded-xl border border-slate-200 p-4 h-64 flex flex-col justify-between"
                                    >
                                        <div className="h-32 rounded-lg bg-slate-100" />
                                        <div className="h-4 w-2/3 bg-slate-100 rounded" />
                                        <div className="h-8 bg-slate-100 rounded" />
                                    </div>
                                ))}
                            </div>
                        ) : error ? (
                            <div
                                role="alert"
                                className="bg-white rounded-xl border border-slate-200 p-8 text-center flex flex-col items-center gap-3"
                            >
                                <p className="text-sm font-medium text-red-700">{error}</p>
                                <button
                                    type="button"
                                    onClick={fetchEquipments}
                                    className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                                >
                                    <RefreshCw className="w-4 h-4" aria-hidden="true" />
                                    <span>Muat Ulang</span>
                                </button>
                            </div>
                        ) : equipments.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-10 text-center flex flex-col items-center gap-3">
                                <p className="text-base font-bold text-slate-900">
                                    Alat atau ruang studio tidak ditemukan
                                </p>
                                <p className="text-sm text-slate-600 max-w-md">
                                    Tidak ada item yang sesuai dengan kata kunci atau filter kategori saat ini.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                    {equipments.map((equipment) => (
                                        <EquipmentCard
                                            key={equipment.id}
                                            equipment={equipment}
                                            onAddToEstimator={handleAddToEstimator}
                                            onShowDetail={setDetailEquipment}
                                        />
                                    ))}
                                </div>

                                {pagination && pagination.last_page > 1 && (
                                    <div className="flex items-center justify-between bg-white rounded-xl border border-slate-200 px-4 py-3">
                                        <span className="text-xs text-slate-600 tabular-nums">
                                            Halaman {pagination.current_page} dari {pagination.last_page} ({pagination.total} item)
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                disabled={pagination.current_page <= 1}
                                                onClick={() => setPage((p) => p - 1)}
                                                className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                                            >
                                                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
                                                <span>Sebelumnya</span>
                                            </button>
                                            <button
                                                type="button"
                                                disabled={pagination.current_page >= pagination.last_page}
                                                onClick={() => setPage((p) => p + 1)}
                                                className="inline-flex items-center gap-1 min-h-[40px] px-3 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-50 text-xs font-medium"
                                            >
                                                <span>Selanjutnya</span>
                                                <ChevronRight className="w-4 h-4" aria-hidden="true" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <RentalEstimatorPanel
                        items={estimatorItems}
                        startDate={startDate}
                        endDate={endDate}
                        onStartDateChange={setStartDate}
                        onEndDateChange={setEndDate}
                        onUpdateQty={handleUpdateQty}
                        onRemoveItem={handleRemoveItem}
                        onSubmitProposal={() => setProposalOpen(true)}
                    />
                </section>
            </main>

            <footer className="bg-white border-t border-slate-200 py-5">
                <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
                    <span>© 2026 StudioRent. Katalog Alat Musik &amp; Ruang Studio.</span>
                    <span>D3 Teknik Informatika PENS</span>
                </div>
            </footer>

            <FormModal
                open={Boolean(detailEquipment)}
                title={detailEquipment?.nama_alat || 'Detail Alat'}
                subtitle={detailEquipment?.category?.nama_kategori || ''}
                onClose={() => setDetailEquipment(null)}
            >
                {detailEquipment && (
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <StatusBadge
                                status={Number(detailEquipment.stok) > 0 ? 'tersedia' : 'sedang_disewa'}
                                label={
                                    Number(detailEquipment.stok) > 0
                                        ? `Tersedia • ${detailEquipment.stok} Unit`
                                        : 'Sedang Disewa'
                                }
                            />
                            <span className="text-lg font-bold text-slate-900 tabular-nums">
                                {formatRupiah(detailEquipment.harga_sewa)} / {detailEquipment.satuan_sewa}
                            </span>
                        </div>

                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                            <div>
                                <dt className="text-xs text-slate-600">Merk</dt>
                                <dd className="font-semibold text-slate-900">{detailEquipment.merk || '-'}</dd>
                            </div>
                            <div>
                                <dt className="text-xs text-slate-600">Kondisi</dt>
                                <dd className="font-semibold text-slate-900">{detailEquipment.kondisi}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-xs text-slate-600">Spesifikasi</dt>
                                <dd className="font-medium text-slate-900">
                                    {detailEquipment.spesifikasi || '-'}
                                </dd>
                            </div>
                        </dl>

                        <div className="flex items-center justify-end gap-2">
                            {Number(detailEquipment.stok) > 0 && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleAddToEstimator(detailEquipment);
                                        setDetailEquipment(null);
                                    }}
                                    className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold"
                                >
                                    Tambahkan ke Estimator
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setDetailEquipment(null)}
                                className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </FormModal>

            <FormModal
                open={proposalOpen}
                title="Ringkasan Pengajuan Sewa"
                subtitle="Tunjukkan ringkasan estimasi ini kepada petugas jaga StudioRent untuk pencatatan resmi."
                onClose={() => setProposalOpen(false)}
            >
                <div className="flex flex-col gap-4">
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm flex flex-col gap-2">
                        <div className="flex justify-between">
                            <span className="text-slate-600">Jadwal Sewa</span>
                            <span className="font-semibold text-slate-900">
                                {formatTanggal(startDate)} s.d. {formatTanggal(endDate)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-600">Durasi</span>
                            <span className="font-semibold text-slate-900">{durationDays} Hari</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        {estimatorItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center justify-between text-sm py-2 border-b border-slate-100"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900">{item.nama_alat}</p>
                                    <p className="text-xs text-slate-600">
                                        {item.qty}x • {formatRupiah(item.harga_sewa)}/{item.satuan_sewa}
                                    </p>
                                </div>
                                <span className="font-semibold text-slate-900 tabular-nums">
                                    {formatRupiah(Number(item.harga_sewa) * item.qty * durationDays)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-100">
                        <span className="text-sm font-semibold text-slate-700">Total Estimasi</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                            {formatRupiah(totalEstimasi)}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
                        <button
                            type="button"
                            onClick={handleCopySummary}
                            className="inline-flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                        >
                            {copiedSummary ? (
                                <Check className="w-4 h-4 text-green-700" aria-hidden="true" />
                            ) : (
                                <Copy className="w-4 h-4" aria-hidden="true" />
                            )}
                            <span>{copiedSummary ? 'Ringkasan Disalin' : 'Salin Ringkasan'}</span>
                        </button>

                        {isAuthenticated ? (
                            <button
                                type="button"
                                onClick={handleProceedAsStaff}
                                className="min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold"
                            >
                                Proses di Transaksi Sewa
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold"
                            >
                                Login Petugas
                            </Link>
                        )}
                    </div>
                </div>
            </FormModal>
        </div>
    );
}
