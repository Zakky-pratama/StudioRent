import React from 'react';

const STATUS_MAP = {
    disewa: {
        label: 'Disewa',
        className: 'bg-orange-100 text-orange-700',
    },
    terlambat: {
        label: 'Terlambat',
        className: 'bg-red-100 text-red-700',
    },
    dikembalikan: {
        label: 'Dikembalikan',
        className: 'bg-green-100 text-green-700',
    },
    aktif: {
        label: 'Aktif',
        className: 'bg-green-100 text-green-700',
    },
    nonaktif: {
        label: 'Nonaktif',
        className: 'bg-slate-100 text-slate-700',
    },
    tersedia: {
        label: 'Tersedia',
        className: 'bg-white/95 backdrop-blur-sm text-slate-900 border border-slate-200',
        dotClass: 'bg-green-600',
    },
    sedang_disewa: {
        label: 'Sedang Disewa',
        className: 'bg-red-50 text-red-700 border border-red-200',
    },
};

export default function StatusBadge({ status, label = null }) {
    const key = String(status || '').toLowerCase();
    const config = STATUS_MAP[key] || {
        label: status || '-',
        className: 'bg-slate-100 text-slate-700',
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.className}`}
        >
            {config.dotClass && (
                <span className={`w-2 h-2 rounded-full ${config.dotClass}`} aria-hidden="true" />
            )}
            <span>{label || config.label}</span>
        </span>
    );
}
