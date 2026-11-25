export function formatRupiah(amount) {
    const num = Number(amount || 0);
    return 'Rp ' + num.toLocaleString('id-ID');
}

export function formatTanggal(dateStr) {
    if (!dateStr) return '-';
    const parsed = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
}

export function calculateDurationDays(startDate, endDate) {
    if (!startDate || !endDate) return 1;
    const start = new Date(`${startDate}T00:00:00`);
    const end = new Date(`${endDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
        return 1;
    }
    const diffMs = end.getTime() - start.getTime();
    return Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function getInitials(name) {
    if (!name) return 'SR';
    const parts = String(name).trim().split(/\s+/);
    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getTodayIso() {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60 * 1000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function addDaysIso(dateStr, days) {
    const base = new Date(`${dateStr}T00:00:00`);
    if (Number.isNaN(base.getTime())) return getTodayIso();
    base.setDate(base.getDate() + days);
    const offsetMs = base.getTimezoneOffset() * 60 * 1000;
    return new Date(base.getTime() - offsetMs).toISOString().slice(0, 10);
}

export function extractApiError(error, fallbackMessage = 'Terjadi kesalahan saat memproses permintaan.') {
    const status = error?.response?.status;
    const data = error?.response?.data;

    if (status === 422 && data?.errors) {
        const firstField = Object.keys(data.errors)[0];
        const firstMessage = firstField ? data.errors[firstField]?.[0] : null;
        return {
            message: firstMessage || data?.message || 'Periksa kembali isian formulir Anda.',
            errors: data.errors,
        };
    }

    return {
        message: data?.message || fallbackMessage,
        errors: {},
    };
}

export function formatRentalCreatedMessage(rental) {
    const kode = rental?.kode_sewa || '';
    if (rental?.status === 'terlambat') {
        return `Transaksi ${kode} berhasil disimpan dengan status Terlambat karena batas kembali sudah terlewat.`;
    }
    return `Transaksi ${kode} berhasil disimpan.`;
}

export function downloadRentalsCsv(rentals, filename = 'rekap-penyewaan-studiorent.csv') {
    const headers = [
        'Kode Sewa',
        'Nama Penyewa',
        'NIM/NIK',
        'Instansi',
        'Daftar Alat',
        'Tanggal Sewa',
        'Rencana Kembali',
        'Tanggal Dikembalikan',
        'Status',
        'Total Biaya',
        'Petugas',
    ];

    const escapeCsv = (value) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const rows = rentals.map((r) => [
        r.kode_sewa || `#RNT-${r.id}`,
        r.customer?.nama || '-',
        r.customer?.nim_nik || '-',
        r.customer?.instansi || '-',
        (r.items || []).map((i) => `${i.nama_alat} (${i.jumlah}x)`).join('; '),
        r.tanggal_sewa || '-',
        r.tanggal_kembali_rencana || '-',
        r.tanggal_dikembalikan || '-',
        r.status || '-',
        r.total_biaya ?? 0,
        r.petugas?.name || '-',
    ]);

    const csvContent = [headers, ...rows]
        .map((row) => row.map(escapeCsv).join(','))
        .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
