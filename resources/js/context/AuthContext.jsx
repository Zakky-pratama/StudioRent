import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from '../lib/api';

const AuthContext = createContext(null);

function readStoredUser() {
    try {
        const raw = localStorage.getItem(USER_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function AuthProvider({ children }) {
    const navigate = useNavigate();
    const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
    const [user, setUser] = useState(() => readStoredUser());
    const [loading, setLoading] = useState(() => Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));
    const [forbiddenMessage, setForbiddenMessage] = useState('');

    const clearSession = useCallback(() => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        setToken(null);
        setUser(null);
    }, []);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        let active = true;
        api.get('/me')
            .then((res) => {
                if (!active) return;
                const fetchedUser = res.data?.data ?? res.data;
                setUser(fetchedUser);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(fetchedUser));
            })
            .catch(() => {
                if (!active) return;
                clearSession();
            })
            .finally(() => {
                if (active) setLoading(false);
            });

        return () => {
            active = false;
        };
    }, [token, clearSession]);

    useEffect(() => {
        const handleUnauthorized = () => {
            clearSession();
            navigate('/login', { replace: true });
        };

        const handleForbidden = (event) => {
            setForbiddenMessage(
                event.detail?.message || 'Akses ditolak. Fitur ini hanya tersedia untuk Admin.'
            );
        };

        window.addEventListener('studiorent:unauthorized', handleUnauthorized);
        window.addEventListener('studiorent:forbidden', handleForbidden);

        return () => {
            window.removeEventListener('studiorent:unauthorized', handleUnauthorized);
            window.removeEventListener('studiorent:forbidden', handleForbidden);
        };
    }, [clearSession, navigate]);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const nextToken = response.data?.token;
        const nextUser = response.data?.user;

        localStorage.setItem(TOKEN_STORAGE_KEY, nextToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
        setToken(nextToken);
        setUser(nextUser);
        setForbiddenMessage('');

        return nextUser;
    };

    const logout = async () => {
        try {
            if (token) {
                await api.post('/logout');
            }
        } catch {
            // Sesi tetap dibersihkan di sisi klien meski token sudah kedaluwarsa.
        } finally {
            clearSession();
            navigate('/login', { replace: true });
        }
    };

    const clearForbiddenMessage = useCallback(() => setForbiddenMessage(''), []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                isAuthenticated: Boolean(token && user),
                isAdmin: user?.role === 'admin',
                forbiddenMessage,
                clearForbiddenMessage,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider.');
    }
    return context;
}
