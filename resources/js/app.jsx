import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import './bootstrap';
import '../css/app.css';
import { AuthProvider } from './context/AuthContext';
import { AdminRoute, ProtectedRoute } from './components/auth/RouteGuards';
import CatalogPage from './pages/CatalogPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RentalsPage from './pages/RentalsPage';
import CustomersPage from './pages/CustomersPage';
import ReportsPage from './pages/ReportsPage';
import EquipmentsPage from './pages/EquipmentsPage';
import CategoriesPage from './pages/CategoriesPage';

function NotFoundPage() {
    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-6 text-center flex flex-col gap-3">
                <h1 className="text-xl font-bold text-slate-900">Halaman Tidak Ditemukan</h1>
                <p className="text-sm text-slate-600">
                    Alamat yang Anda buka tidak tersedia di sistem StudioRent.
                </p>
                <Link
                    to="/"
                    className="mt-2 inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-sm font-semibold"
                >
                    Kembali ke Katalog
                </Link>
            </div>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<CatalogPage />} />
                    <Route path="/login" element={<LoginPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/rentals" element={<RentalsPage />} />
                        <Route path="/customers" element={<CustomersPage />} />
                        <Route path="/equipments" element={<EquipmentsPage />} />
                        <Route path="/reports" element={<ReportsPage />} />
                    </Route>

                    <Route element={<AdminRoute />}>
                        <Route path="/categories" element={<CategoriesPage />} />
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

const container = document.getElementById('app');
if (container) {
    createRoot(container).render(<App />);
}
