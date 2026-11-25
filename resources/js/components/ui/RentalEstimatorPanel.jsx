import React from 'react';
import { ArrowRight, Minus, Plus, X } from 'lucide-react';
import { calculateDurationDays, formatRupiah } from '../../utils/formatters';

export default function RentalEstimatorPanel({
    items,
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    onUpdateQty,
    onRemoveItem,
    onSubmitProposal,
}) {
    const durationDays = calculateDurationDays(startDate, endDate);
    const hasInvalidDateRange = Boolean(startDate && endDate && endDate < startDate);
    const totalCount = items.reduce((sum, item) => sum + item.qty, 0);
    const totalEstimasi = items.reduce(
        (sum, item) => sum + Number(item.harga_sewa) * item.qty * durationDays,
        0
    );

    return (
        <aside
            aria-label="Estimator Biaya Sewa"
            className="w-full xl:w-[360px] shrink-0 bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-5 xl:sticky xl:top-20"
        >
            <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-slate-900">Biaya Sewa</h2>
                <span className="px-2.5 py-1 rounded-full bg-rose-950 text-white text-xs font-semibold tabular-nums">
                    {totalCount} Item Dipilih
                </span>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 flex flex-col gap-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="estimator-start-date"
                            className="text-xs font-medium text-slate-700"
                        >
                            Tanggal Sewa
                        </label>
                        <input
                            id="estimator-start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => onStartDateChange(e.target.value)}
                            className="h-11 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:border-amber-800 focus:outline-none"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="estimator-end-date"
                            className="text-xs font-medium text-slate-700"
                        >
                            Tanggal Kembali
                        </label>
                        <input
                            id="estimator-end-date"
                            type="date"
                            value={endDate}
                            min={startDate}
                            onChange={(e) => onEndDateChange(e.target.value)}
                            className="h-11 px-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-900 focus:border-amber-800 focus:outline-none"
                        />
                    </div>
                </div>

                {hasInvalidDateRange ? (
                    <p className="text-xs font-medium text-red-700" role="alert">
                        Tanggal kembali tidak boleh sebelum tanggal sewa.
                    </p>
                ) : (
                    <div className="flex items-center justify-between pt-1 text-xs">
                        <span className="text-slate-600">Durasi Sewa</span>
                        <span className="font-semibold text-slate-900 tabular-nums">
                            Durasi: {durationDays} Hari
                        </span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto">
                {items.length === 0 ? (
                    <p className="text-xs text-slate-600 text-center py-6 px-3 bg-slate-50 rounded-xl border border-slate-100">
                        Belum ada item dipilih. Klik tombol Sewa pada kartu alat untuk mulai menghitung estimasi.
                    </p>
                ) : (
                    items.map((item) => {
                        const subtotal = Number(item.harga_sewa) * item.qty * durationDays;
                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100"
                            >
                                <div className="flex flex-col min-w-0 flex-1 gap-1">
                                    <span className="text-sm font-semibold text-slate-900 truncate">
                                        {item.nama_alat}
                                    </span>
                                    <span className="text-xs text-slate-600 tabular-nums">
                                        {item.qty}x • {formatRupiah(item.harga_sewa)}/{item.satuan_sewa}
                                    </span>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => onUpdateQty(item.id, item.qty - 1)}
                                            aria-label={`Kurangi jumlah ${item.nama_alat}`}
                                            className="w-8 h-8 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                                        >
                                            <Minus className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                        <span className="text-xs font-semibold text-slate-900 w-6 text-center tabular-nums">
                                            {item.qty}
                                        </span>
                                        <button
                                            type="button"
                                            disabled={item.qty >= item.stok}
                                            onClick={() => onUpdateQty(item.id, item.qty + 1)}
                                            aria-label={`Tambah jumlah ${item.nama_alat}`}
                                            className="w-8 h-8 rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 flex items-center justify-center"
                                        >
                                            <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-sm font-semibold text-slate-900 tabular-nums">
                                        {formatRupiah(subtotal)}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveItem(item.id)}
                                        aria-label={`Hapus ${item.nama_alat}`}
                                        className="w-9 h-9 rounded-lg text-slate-600 hover:text-red-700 hover:bg-red-50 flex items-center justify-center transition-colors"
                                    >
                                        <X className="w-4 h-4" aria-hidden="true" />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="pt-4 border-t border-slate-200 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-600">Total Estimasi</span>
                    <span className="text-2xl font-bold text-slate-900 tabular-nums">
                        {formatRupiah(totalEstimasi)}
                    </span>
                </div>

                <button
                    type="button"
                    disabled={items.length === 0 || hasInvalidDateRange}
                    onClick={onSubmitProposal}
                    className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                    <span>Ajukan Penyewaan</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
            </div>
        </aside>
    );
}
