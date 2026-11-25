import React from 'react';
import FormModal from '../ui/FormModal';
import StatusBadge from '../ui/StatusBadge';
import { formatRupiah, formatTanggal } from '../../utils/formatters';

export default function RentalDetailModal({
    rental,
    onClose,
    onReturn = null,
    returningId = null,
    onReschedule = null,
    onDelete = null,
}) {
    return (
        <FormModal
            open={Boolean(rental)}
            title={rental ? `Detail Transaksi ${rental.kode_sewa}` : 'Detail Transaksi'}
            subtitle={rental?.customer ? `Penyewa: ${rental.customer.nama}` : ''}
            onClose={onClose}
            maxWidthClass="max-w-xl"
        >
            {rental && (
                <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm">
                        <div>
                            <p className="text-xs text-slate-600">Penyewa</p>
                            <p className="font-semibold text-slate-900">{rental.customer?.nama || '-'}</p>
                            <p className="text-xs text-slate-600">
                                {rental.customer?.nim_nik}
                                {rental.customer?.instansi ? ` • ${rental.customer.instansi}` : ''}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Petugas Pencatat</p>
                            <p className="font-semibold text-slate-900">{rental.petugas?.name || '-'}</p>
                            <div className="mt-1">
                                <StatusBadge status={rental.status} />
                            </div>
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Jadwal Sewa</p>
                            <p className="font-medium text-slate-900">
                                {formatTanggal(rental.tanggal_sewa)} s.d.{' '}
                                {formatTanggal(rental.tanggal_kembali_rencana)}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">Tanggal Dikembalikan</p>
                            <p className="font-medium text-slate-900">
                                {rental.tanggal_dikembalikan
                                    ? formatTanggal(rental.tanggal_dikembalikan)
                                    : 'Belum dikembalikan'}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                            Rincian Alat / Ruang Studio
                        </h3>
                        <div className="border border-slate-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600">
                                    <tr>
                                        <th className="py-2.5 px-3">Item</th>
                                        <th className="py-2.5 px-3 text-center">Qty</th>
                                        <th className="py-2.5 px-3 text-right">Tarif</th>
                                        <th className="py-2.5 px-3 text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {(rental.items || []).map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-2.5 px-3">
                                                <span className="font-medium text-slate-900 block">
                                                    {item.nama_alat}
                                                </span>
                                                <span className="text-xs text-slate-600">
                                                    {item.merk || '-'}
                                                </span>
                                            </td>
                                            <td className="py-2.5 px-3 text-center tabular-nums">
                                                {item.jumlah}
                                            </td>
                                            <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">
                                                {formatRupiah(item.harga_satuan)}/{item.satuan_sewa}
                                            </td>
                                            <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-slate-900">
                                                {formatRupiah(item.subtotal)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <span className="text-sm font-medium text-slate-600">Total Biaya</span>
                        <span className="text-xl font-bold text-slate-900 tabular-nums">
                            {formatRupiah(rental.total_biaya)}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2.5">
                        <div>
                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(rental)}
                                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-red-200 text-red-700 hover:bg-red-50 text-sm font-semibold"
                                >
                                    Hapus Transaksi
                                </button>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-end gap-2.5">
                            {onReschedule && rental.status !== 'dikembalikan' && (
                                <button
                                    type="button"
                                    onClick={() => onReschedule(rental)}
                                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 text-sm font-semibold"
                                >
                                    Ubah Jadwal
                                </button>
                            )}
                            {onReturn && rental.status !== 'dikembalikan' && (
                                <button
                                    type="button"
                                    disabled={returningId === rental.id}
                                    onClick={() => onReturn(rental.id)}
                                    className={`min-h-[44px] px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${
                                        rental.status === 'terlambat'
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-amber-800 hover:bg-amber-900'
                                    } disabled:opacity-50`}
                                >
                                    {returningId === rental.id ? 'Memproses...' : 'Proses Pengembalian'}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={onClose}
                                className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </FormModal>
    );
}
