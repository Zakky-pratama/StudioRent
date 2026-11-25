import React, { useEffect, useId } from 'react';
import { X } from 'lucide-react';

export default function FormModal({
    open,
    title,
    subtitle = '',
    onClose,
    children,
    maxWidthClass = 'max-w-lg',
}) {
    const titleId = useId();

    useEffect(() => {
        if (!open) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50"
            role="presentation"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                className={`w-full ${maxWidthClass} bg-white rounded-2xl border border-slate-200 shadow-lg flex flex-col max-h-[90vh]`}
            >
                <div className="px-5 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
                    <div>
                        <h2 id={titleId} className="text-lg font-bold text-slate-900">
                            {title}
                        </h2>
                        {subtitle && <p className="text-xs text-slate-600 mt-0.5">{subtitle}</p>}
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Tutup dialog"
                        className="w-10 h-10 rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-center shrink-0"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="p-5 overflow-y-auto">{children}</div>
            </div>
        </div>
    );
}
