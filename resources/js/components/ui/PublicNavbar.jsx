import React from 'react';
import { AudioWaveform, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatters';

export default function PublicNavbar({ searchValue = '', onSearchChange = null }) {
    const { isAuthenticated, user } = useAuth();

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
                <Link
                    to="/"
                    className="flex items-center gap-2.5 shrink-0 min-h-[44px] rounded-lg"
                >
                    <span className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                        <AudioWaveform className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span className="font-heading text-lg font-bold tracking-tight text-slate-900">
                        StudioRent
                    </span>
                </Link>

                {onSearchChange && (
                    <div className="hidden md:block flex-1 max-w-md mx-4">
                        <label htmlFor="navbar-catalog-search" className="sr-only">
                            Cari gitar, drum, mixer, atau ruang studio
                        </label>
                        <div className="relative flex items-center">
                            <Search
                                className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none"
                                aria-hidden="true"
                            />
                            <input
                                id="navbar-catalog-search"
                                type="search"
                                value={searchValue}
                                onChange={(e) => onSearchChange(e.target.value)}
                                placeholder="Cari gitar, drum, mixer, atau ruang studio..."
                                className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                        </div>
                    </div>
                )}

                <div className="flex items-center gap-3 shrink-0">
                    {isAuthenticated ? (
                        <Link
                            to="/dashboard"
                            className="inline-flex items-center gap-2.5 px-3.5 py-2 min-h-[44px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                        >
                            <span>Dashboard</span>
                            <span className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                                {getInitials(user?.name)}
                            </span>
                        </Link>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                className="inline-flex items-center px-4 py-2 min-h-[44px] rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
                            >
                                Staff Login
                            </Link>
                            <Link
                                to="/login"
                                aria-label="Masuk ke Portal Staf"
                                className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
                            >
                                <User className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {onSearchChange && (
                <div className="md:hidden px-4 pb-3">
                    <label htmlFor="mobile-catalog-search" className="sr-only">
                        Cari alat musik atau ruang studio
                    </label>
                    <div className="relative flex items-center">
                        <Search
                            className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none"
                            aria-hidden="true"
                        />
                        <input
                            id="mobile-catalog-search"
                            type="search"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Cari gitar, drum, mixer, atau studio..."
                            className="w-full h-11 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-amber-800 focus:outline-none"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
