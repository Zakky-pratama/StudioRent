import React, { useState } from 'react';
import { AlertCircle, ChevronRight, Menu, X } from 'lucide-react';
import AdminSidebar from '../ui/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function BackOfficeLayout({
    breadcrumb = 'Dashboard',
    children,
}) {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { forbiddenMessage, clearForbiddenMessage } = useAuth();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <AdminSidebar
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <div className="lg:pl-64 flex flex-col min-h-screen">
                <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            aria-label="Buka menu navigasi"
                            className="lg:hidden inline-flex items-center gap-2 min-h-[44px] px-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 text-sm font-medium"
                        >
                            <Menu className="w-4 h-4" aria-hidden="true" />
                            <span>Menu</span>
                        </button>

                        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm">
                            <span className="text-slate-600">Sistem</span>
                            <ChevronRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            <span className="font-semibold text-slate-900 truncate">{breadcrumb}</span>
                        </nav>
                    </div>
                </header>

                <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
                    {forbiddenMessage && (
                        <div
                            role="alert"
                            className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 flex items-center justify-between gap-3 text-sm"
                        >
                            <div className="flex items-center gap-2.5">
                                <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
                                <span>{forbiddenMessage}</span>
                            </div>
                            <button
                                type="button"
                                onClick={clearForbiddenMessage}
                                aria-label="Tutup peringatan akses"
                                className="w-8 h-8 rounded-lg hover:bg-red-100 flex items-center justify-center"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>
                    )}

                    {children}
                </main>
            </div>
        </div>
    );
}
