import React, { useEffect, useState } from 'react';
import FormModal from '../ui/FormModal';
import api from '../../lib/api';
import {
    calculateDurationDays,
    extractApiError,
    formatRupiah,
    getTodayIso,
} from '../../utils/formatters';

export default function RentalRescheduleModal({ rental, onClose, onSuccess }) {
    const [tanggalSewa, setTanggalSewa] = useState('');
    const [tanggalKembaliRencana, setTanggalKembaliRencana] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        if (!rental) return;
        setTanggalSewa(rental.tanggal_sewa || '');
        setTanggalKembaliRencana(rental.tanggal_kembali_rencana || '');
        setErrorMessage('');
        setFieldErrors({});
    }, [rental]);

    const durationDays = calculateDurationDays(tanggalSewa, tanggalKembaliRencana);
    const estimatedTotal = (rental?.items || []).reduce(
        (sum, item) => sum + Number(item.harga_satuan || 0) * Number(item.jumlah || 0) * durationDays,
        0
    );

    const todayIso = getTodayIso();
    const hasValidRange = Boolean(tanggalSewa) && Boolean(tanggalKembaliRencana) && tanggalKembaliRencana >= tanggalSewa;
    const willBeOverdue = hasValidRange && tanggalKembaliRencana < todayIso;
    const willRecoverToActive = hasValidRange && !willBeOverdue && rental?.status === 'terlambat';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rental) return;

        setSubmitting(true);
        setErrorMessage('');
        setFieldErrors({});

        try {
            const res = await api.put(`/rentals/${rental.id}`, {
                tanggal_sewa: tanggalSewa,
                tanggal_kembali_rencana: tanggalKembaliRencana,
            });
            onSuccess(res.data?.data || res.data);
            onClose();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal memperbarui jadwal transaksi.');
            setErrorMessage(parsed.message);
            setFieldErrors(parsed.errors);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <FormModal
            open={Boolean(rental)}
            title={rental ? `Reschedule ${rental.kode_sewa}` : 'Reschedule Transaksi'}
            subtitle={rental?.customer ? `Penyewa: ${rental.customer.nama}` : ''}
            onClose={onClose}
            maxWidthClass="max-w-lg"
        >
            {rental && (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                    {errorMessage && (
                        <div
                            role="alert"
                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="reschedule-start" className="text-xs font-semibold text-slate-700">
                                Tanggal Sewa
                            </label>
                            <input
                                id="reschedule-start"
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
                            <label htmlFor="reschedule-end" className="text-xs font-semibold text-slate-700">
                                Tanggal Rencana Kembali
                            </label>
                            <input
                                id="reschedule-end"
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

                    {willBeOverdue && (
                        <div
                            role="status"
                            className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-medium text-amber-900"
                        >
                            Tanggal rencana kembali berada sebelum hari ini, sehingga status transaksi menjadi Terlambat.
                        </div>
                    )}

                    {willRecoverToActive && (
                        <div
                            role="status"
                            className="p-3 rounded-xl bg-green-50 border border-green-200 text-xs font-medium text-green-800"
                        >
                            Jadwal baru belum melewati hari ini, sehingga status transaksi akan kembali menjadi Sedang Disewa.
                        </div>
                    )}

                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-600">Durasi Baru ({durationDays} Hari)</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Biaya dihitung ulang dari tarif awal setiap item.
                            </p>
                        </div>
                        <span className="text-xl font-bold text-slate-900 tabular-nums shrink-0">
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
                            {submitting ? 'Menyimpan...' : 'Simpan Jadwal Baru'}
                        </button>
                    </div>
                </form>
            )}
        </FormModal>
    );
}
