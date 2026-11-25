import React, { useEffect, useState } from 'react';
import FormModal from '../ui/FormModal';
import api from '../../lib/api';
import { extractApiError } from '../../utils/formatters';

export default function RentalDeleteModal({ rental, onClose, onSuccess }) {
    const [deleting, setDeleting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!rental) return;
        setErrorMessage('');
    }, [rental]);

    const handleConfirmDelete = async () => {
        if (!rental) return;
        setDeleting(true);
        setErrorMessage('');

        try {
            await api.delete(`/rentals/${rental.id}`);
            onSuccess(rental);
            onClose();
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal menghapus transaksi penyewaan.');
            setErrorMessage(parsed.message);
        } finally {
            setDeleting(false);
        }
    };

    const isReturned = rental?.status === 'dikembalikan';

    return (
        <FormModal
            open={Boolean(rental)}
            title={rental ? `Hapus Transaksi ${rental.kode_sewa}` : 'Hapus Transaksi'}
            onClose={onClose}
            maxWidthClass="max-w-md"
        >
            {rental && (
                <div className="flex flex-col gap-4">
                    {errorMessage && (
                        <div
                            role="alert"
                            className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <p className="text-sm text-slate-700">
                        Hapus transaksi{' '}
                        <strong className="text-slate-900">{rental.kode_sewa}</strong> atas nama{' '}
                        <strong className="text-slate-900">{rental.customer?.nama || '-'}</strong>?
                    </p>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        {isReturned
                            ? 'Transaksi ini sudah selesai dikembalikan, sehingga stok alat tidak berubah dan riwayat transaksi akan dihapus permanen.'
                            : 'Karena transaksi masih berjalan, stok alat pada transaksi ini akan dikembalikan ke inventaris dan data transaksi dihapus permanen.'}
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
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
            )}
        </FormModal>
    );
}
