import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import FormModal from '../ui/FormModal';
import api from '../../lib/api';
import {
    addDaysIso,
    calculateDurationDays,
    extractApiError,
    formatRupiah,
    getTodayIso,
} from '../../utils/formatters';

export default function RentalCreateModal({
    open,
    onClose,
    onSuccess,
    initialData = null,
}) {
    const [customers, setCustomers] = useState([]);
    const [equipments, setEquipments] = useState([]);
    const [loadingRefs, setLoadingRefs] = useState(false);

    const [customerId, setCustomerId] = useState('');
    const [tanggalSewa, setTanggalSewa] = useState(getTodayIso());
    const [tanggalKembaliRencana, setTanggalKembaliRencana] = useState(addDaysIso(getTodayIso(), 2));
    const [items, setItems] = useState([{ equipment_id: '', jumlah: 1 }]);

    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!open) return;

        setErrorMessage('');
        setFieldErrors({});
        const today = getTodayIso();
        setCustomerId('');
        setTanggalSewa(initialData?.startDate || today);
        setTanggalKembaliRencana(initialData?.endDate || addDaysIso(today, 2));
        setItems(
            initialData?.items?.length
                ? initialData.items.map((item) => ({
                      equipment_id: String(item.id),
                      jumlah: Number(item.qty || 1),
                  }))
                : [{ equipment_id: '', jumlah: 1 }]
        );

        let active = true;
        setLoadingRefs(true);

        Promise.all([
            api.get('/customers', { params: { status: 'aktif', per_page: 100 } }),
            api.get('/equipments', { params: { available_only: 1, per_page: 100 } }),
        ])
            .then(([custRes, eqRes]) => {
                if (!active) return;
                setCustomers(custRes.data?.data || []);
                setEquipments(eqRes.data?.data || []);
            })
            .catch(() => {
                if (!active) return;
                setErrorMessage('Gagal memuat daftar penyewa atau alat tersedia.');
            })
            .finally(() => {
                if (active) setLoadingRefs(false);
            });

        return () => {
            active = false;
        };
    }, [open, initialData]);

    const equipmentMap = new Map(equipments.map((eq) => [String(eq.id), eq]));
    const durationDays = calculateDurationDays(tanggalSewa, tanggalKembaliRencana);

    const estimatedTotal = items.reduce((sum, row) => {
        const eq = equipmentMap.get(String(row.equipment_id));
        if (!eq) return sum;
        return sum + Number(eq.harga_sewa) * Number(row.jumlah || 0) * durationDays;
    }, 0);

    const handleAddRow = () => {
        setItems((prev) => [...prev, { equipment_id: '', jumlah: 1 }]);
    };

    const handleRemoveRow = (index) => {
        setItems((prev) => prev.filter((_, idx) => idx !== index));
    };

    const handleItemChange = (index, field, value) => {
        setItems((prev) =>
            prev.map((row, idx) => (idx === index ? { ...row, [field]: value } : row))
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');
        setFieldErrors({});

        try {
            const payload = {
                customer_id: customerId ? Number(customerId) : '',
                tanggal_sewa: tanggalSewa,
                tanggal_kembali_rencana: tanggalKembaliRencana,
                items: items.map((row) => ({
                    equipment_id: row.equipment_id ? Number(row.equipment_id) : '',
                    jumlah: Number(row.jumlah || 1),
                })),
            };

            const res = await api.post('/rentals', payload);
            onSuccess(res.data?.data || res.data);
            onClose();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menyimpan transaksi penyewaan.');
            setErrorMessage(parsed.message);
            setFieldErrors(parsed.errors);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <FormModal
            open={open}
            title="Transaksi Sewa Baru"
            subtitle="Pilih penyewa aktif, jadwal sewa, dan satu atau lebih alat yang tersedia."
            onClose={onClose}
            maxWidthClass="max-w-2xl"
        >
            {loadingRefs ? (
                <p className="text-sm text-slate-600 py-6 text-center">
                    Memuat data penyewa dan alat tersedia...
                </p>
            ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    {errorMessage && (
                        <div
                            role="alert"
                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="rental-customer" className="text-xs font-semibold text-slate-700">
                            Penyewa Aktif
                        </label>
                        <select
                            id="rental-customer"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            aria-invalid={Boolean(fieldErrors.customer_id)}
                            className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                        >
                            <option value="">-- Pilih Penyewa --</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.nama} ({c.nim_nik}){c.instansi ? ` - ${c.instansi}` : ''}
                                </option>
                            ))}
                        </select>
                        {fieldErrors.customer_id && (
                            <p className="text-xs text-red-700" role="alert">
                                {fieldErrors.customer_id[0]}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="rental-start" className="text-xs font-semibold text-slate-700">
                                Tanggal Sewa
                            </label>
                            <input
                                id="rental-start"
                                type="date"
                                value={tanggalSewa}
                                onChange={(e) => setTanggalSewa(e.target.value)}
                                aria-invalid={Boolean(fieldErrors.tanggal_sewa)}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.tanggal_sewa && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.tanggal_sewa[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="rental-end" className="text-xs font-semibold text-slate-700">
                                Tanggal Rencana Kembali
                            </label>
                            <input
                                id="rental-end"
                                type="date"
                                value={tanggalKembaliRencana}
                                onChange={(e) => setTanggalKembaliRencana(e.target.value)}
                                aria-invalid={Boolean(fieldErrors.tanggal_kembali_rencana)}
                                className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.tanggal_kembali_rencana && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.tanggal_kembali_rencana[0]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-700">
                                Daftar Alat / Studio ({durationDays} Hari)
                            </span>
                            <button
                                type="button"
                                onClick={handleAddRow}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[38px] rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold"
                            >
                                <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Tambah Item</span>
                            </button>
                        </div>

                        {fieldErrors.items && (
                            <p className="text-xs text-red-700" role="alert">
                                {fieldErrors.items[0]}
                            </p>
                        )}

                        <div className="flex flex-col gap-2.5">
                            {items.map((row, idx) => {
                                const selectedEq = equipmentMap.get(String(row.equipment_id));
                                const eqErr = fieldErrors[`items.${idx}.equipment_id`]?.[0];
                                const qtyErr = fieldErrors[`items.${idx}.jumlah`]?.[0];

                                return (
                                    <div
                                        key={idx}
                                        className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2"
                                    >
                                        <div className="flex flex-col sm:flex-row gap-2.5">
                                            <div className="flex-1">
                                                <label
                                                    htmlFor={`rental-item-eq-${idx}`}
                                                    className="sr-only"
                                                >
                                                    Pilih Alat Baris {idx + 1}
                                                </label>
                                                <select
                                                    id={`rental-item-eq-${idx}`}
                                                    value={row.equipment_id}
                                                    onChange={(e) =>
                                                        handleItemChange(idx, 'equipment_id', e.target.value)
                                                    }
                                                    className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 focus:border-amber-800 focus:outline-none"
                                                >
                                                    <option value="">-- Pilih Alat / Studio --</option>
                                                    {equipments.map((eq) => (
                                                        <option key={eq.id} value={eq.id}>
                                                            {eq.nama_alat} ({formatRupiah(eq.harga_sewa)}/{eq.satuan_sewa} • Stok: {eq.stok})
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <div className="w-24">
                                                    <label
                                                        htmlFor={`rental-item-qty-${idx}`}
                                                        className="sr-only"
                                                    >
                                                        Jumlah Baris {idx + 1}
                                                    </label>
                                                    <input
                                                        id={`rental-item-qty-${idx}`}
                                                        type="number"
                                                        min={1}
                                                        max={selectedEq ? selectedEq.stok : undefined}
                                                        value={row.jumlah}
                                                        onChange={(e) =>
                                                            handleItemChange(idx, 'jumlah', e.target.value)
                                                        }
                                                        className="w-full h-11 px-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 tabular-nums focus:border-amber-800 focus:outline-none"
                                                    />
                                                </div>

                                                {items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveRow(idx)}
                                                        aria-label={`Hapus baris item ${idx + 1}`}
                                                        className="w-11 h-11 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-red-700 hover:border-red-200 flex items-center justify-center shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {(eqErr || qtyErr) && (
                                            <p className="text-xs text-red-700" role="alert">
                                                {eqErr || qtyErr}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span className="text-sm text-slate-600">Estimasi Total Biaya</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                            {formatRupiah(estimatedTotal)}
                        </span>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="min-h-[44px] px-5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-semibold"
                        >
                            {submitting ? 'Menyimpan...' : 'Simpan Transaksi'}
                        </button>
                    </div>
                </form>
            )}
        </FormModal>
    );
}
