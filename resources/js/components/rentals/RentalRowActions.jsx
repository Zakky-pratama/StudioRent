import React from 'react';
import { CalendarClock, Eye, Trash2 } from 'lucide-react';

export default function RentalRowActions({
    row,
    isAdmin = false,
    returningId = null,
    onReturn,
    onReschedule,
    onDetail,
    onDelete,
}) {
    const isActive = row.status !== 'dikembalikan';

    return (
        <div className="inline-flex items-center justify-end gap-1.5">
            {isActive && (
                <button
                    type="button"
                    disabled={returningId === row.id}
                    onClick={() => onReturn(row.id)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        row.status === 'terlambat'
                            ? 'bg-red-600 hover:bg-red-700 text-white'
                            : 'bg-slate-100 hover:bg-amber-800 hover:text-white text-slate-800'
                    } disabled:opacity-50`}
                >
                    {returningId === row.id ? 'Memproses...' : 'Kembalikan'}
                </button>
            )}

            {isActive && (
                <button
                    type="button"
                    onClick={() => onReschedule(row)}
                    title="Ubah jadwal sewa"
                    aria-label={`Ubah jadwal ${row.kode_sewa}`}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
                >
                    <CalendarClock className="w-4 h-4" aria-hidden="true" />
                </button>
            )}

            <button
                type="button"
                onClick={() => onDetail(row)}
                title="Lihat detail transaksi"
                aria-label={`Lihat detail ${row.kode_sewa}`}
                className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center"
            >
                <Eye className="w-4 h-4" aria-hidden="true" />
            </button>

            {isAdmin && (
                <button
                    type="button"
                    onClick={() => onDelete(row)}
                    title="Hapus transaksi"
                    aria-label={`Hapus transaksi ${row.kode_sewa}`}
                    className="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-red-50 hover:text-red-700 hover:border-red-200 flex items-center justify-center"
                >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
            )}
        </div>
    );
}
