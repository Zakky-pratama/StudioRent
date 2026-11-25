import React, { useEffect, useState } from 'react';
import { ArrowLeft, AudioWaveform, Eye, EyeOff } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractApiError } from '../utils/formatters';

export default function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, login } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    useEffect(() => {
        document.title = 'StudioRent - Login Staf Back-Office';
    }, []);

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrorMessage('');
        setFieldErrors({});

        try {
            await login(email, password);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const parsed = extractApiError(err, 'Gagal masuk. Periksa email dan kata sandi Anda.');
            setErrorMessage(parsed.message);
            setFieldErrors(parsed.errors);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
            <div className="w-full max-w-md flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 min-h-[44px] text-sm font-medium text-slate-700 hover:text-slate-900"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                        <span>Kembali ke Katalog</span>
                    </Link>
                </div>

                <main className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                            <AudioWaveform className="w-5 h-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900">Masuk ke Back-Office</h1>
                            <p className="text-xs text-slate-600">
                                Portal Petugas &amp; Admin StudioRent
                            </p>
                        </div>
                    </div>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700"
                        >
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="login-email" className="text-xs font-semibold text-slate-700">
                                Email Staf
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="nama@studiorent.id"
                                aria-invalid={Boolean(fieldErrors.email)}
                                className="h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-amber-800 focus:outline-none"
                            />
                            {fieldErrors.email && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.email[0]}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label
                                htmlFor="login-password"
                                className="text-xs font-semibold text-slate-700"
                            >
                                Kata Sandi
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete="current-password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Masukkan kata sandi"
                                    aria-invalid={Boolean(fieldErrors.password)}
                                    className="w-full h-11 pl-3.5 pr-11 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-amber-800 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-lg text-slate-600 hover:bg-slate-200 flex items-center justify-center"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                                    ) : (
                                        <Eye className="w-4 h-4" aria-hidden="true" />
                                    )}
                                </button>
                            </div>
                            {fieldErrors.password && (
                                <p className="text-xs text-red-700" role="alert">
                                    {fieldErrors.password[0]}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 w-full min-h-[44px] py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
                        >
                            {submitting ? 'Memproses...' : 'Masuk'}
                        </button>
                    </form>
                </main>
            </div>
        </div>
    );
}
