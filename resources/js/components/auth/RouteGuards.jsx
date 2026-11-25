import React from 'react';
import { Link, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function ProtectedRoute() {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">
                Memeriksa sesi pengguna...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export function AdminRoute() {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center text-sm text-slate-600">
                Memeriksa hak akses...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center flex flex-col gap-3">
                    <h1 className="text-xl font-bold text-slate-900">Akses Ditolak (403)</h1>
                    <p className="text-sm text-slate-600">
                        Halaman ini hanya dapat diakses oleh akun dengan role Admin Studio.
                    </p>
                    <Link
                        to="/dashboard"
                        className="mt-2 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold"
                    >
                        Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return <Outlet />;
}
