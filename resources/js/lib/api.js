import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'studiorent_token';
export const USER_STORAGE_KEY = 'studiorent_user';

const api = axios.create({
    baseURL: '/api',
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error?.response?.status;
        const requestUrl = error?.config?.url || '';

        if (status === 401 && !requestUrl.endsWith('/login')) {
            localStorage.removeItem(TOKEN_STORAGE_KEY);
            localStorage.removeItem(USER_STORAGE_KEY);
            window.dispatchEvent(new CustomEvent('studiorent:unauthorized'));
        }

        if (status === 403) {
            const message =
                error?.response?.data?.message ||
                'Akses ditolak. Fitur ini hanya tersedia untuk Admin.';
            window.dispatchEvent(new CustomEvent('studiorent:forbidden', { detail: { message } }));
        }

        return Promise.reject(error);
    }
);

export default api;
