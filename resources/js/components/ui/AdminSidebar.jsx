import React, { useEffect } from 'react';
import {
    AudioWaveform,
    BarChart3,
    ExternalLink,
    FolderKanban,
    LayoutGrid,
    LogOut,
    ReceiptText,
    Speaker,
    Users,
    X,
} from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

export default function AdminSidebar({ mobileOpen = false, onCloseMobile = () => {} }) {
    const { user, isAdmin, logout } = useAuth();

    useEffect(() => {
        if (!mobileOpen) return;
        const onKeyDown = (e) => {
            if (e.key === 'Escape') onCloseMobile();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [mobileOpen, onCloseMobile]);

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid, adminOnly: false },
        { to: '/equipments', label: 'Data Alat & Studio', icon: Speaker, adminOnly: false },
        { to: '/categories', label: 'Kategori Alat', icon: FolderKanban, adminOnly: true },
        { to: '/customers', label: 'Data Penyewa', icon: Users, adminOnly: false },
        { to: '/rentals', label: 'Transaksi Sewa', icon: ReceiptText, adminOnly: false },
        { to: '/reports', label: 'Laporan Penyewaan', icon: BarChart3, adminOnly: false },
    ].filter((item) => !item.adminOnly || isAdmin);

    const sidebarContent = (
        <div className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between h-full">
            <div className="flex flex-col">
                <div className="h-16 px-5 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
                            <AudioWaveform className="w-4 h-4" aria-hidden="true" />
                        </span>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-white truncate">
                                StudioRent <span className="text-amber-300">• {isAdmin ? 'ADMIN' : 'PETUGAS'}</span>
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-slate-400">
                                Back-Office System
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onCloseMobile}
                        aria-label="Tutup menu navigasi"
                        className="lg:hidden w-10 h-10 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white flex items-center justify-center"
                    >
                        <X className="w-5 h-5" aria-hidden="true" />
                    </button>
                </div>

                <div className="px-4 pt-5 pb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-2">
                        Manajemen Rental
                    </span>
                </div>

                <nav aria-label="Navigasi Back-Office" className="px-3 flex flex-col gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                onClick={onCloseMobile}
                                className={({ isActive }) =>
                                    `flex items-center justify-between px-3 py-2.5 min-h-[44px] rounded-lg text-sm transition-colors ${
                                        isActive
                                            ? 'bg-white text-slate-900 font-semibold'
                                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`
                                }
                            >
                                <span className="flex items-center gap-3 min-w-0">
                                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                                    <span className="truncate">{item.label}</span>
                                </span>
                                {item.adminOnly && (
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-900 text-amber-100">
                                        ADMIN
                                    </span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>

            <div className="p-3 flex flex-col gap-2 border-t border-slate-800">
                <Link
                    to="/"
                    onClick={onCloseMobile}
                    className="flex items-center justify-between px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                    <span>Katalog Publik</span>
                    <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </Link>

                <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-800/90 border border-slate-700">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center shrink-0">
                            {getInitials(user?.name)}
                        </span>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-white truncate">
                                {user?.name || 'Staf Studio'}
                            </span>
                            <span className="text-[11px] uppercase tracking-wide text-slate-400">
                                {user?.role || 'petugas'}
                            </span>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        aria-label="Logout dari sistem"
                        title="Logout"
                        className="w-10 h-10 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white flex items-center justify-center shrink-0 transition-colors"
                    >
                        <LogOut className="w-4 h-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <aside className="hidden lg:block fixed inset-y-0 left-0 z-30 w-64">
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="fixed inset-0 bg-slate-900/60"
                        aria-hidden="true"
                        onClick={onCloseMobile}
                    />
                    <aside className="relative z-10 h-full">{sidebarContent}</aside>
                </div>
            )}
        </>
    );
}
