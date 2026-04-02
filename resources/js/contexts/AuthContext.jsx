import { createContext, useContext, useEffect, useState } from 'react';
import { api, setApiToken } from '../bootstrap';
import { getErrorMessage } from '../lib/errors';

const TOKEN_STORAGE_KEY = 'fittrack_token';
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => window.localStorage.getItem(TOKEN_STORAGE_KEY));
    const [user, setUser] = useState(null);
    const [booting, setBooting] = useState(true);

    useEffect(() => {
        setApiToken(token);

        if (!token) {
            setBooting(false);
            return undefined;
        }

        let cancelled = false;

        api.get('/api/me')
            .then(({ data }) => {
                if (!cancelled) {
                    setUser(data.user);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    clearAuthState();
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setBooting(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [token]);

    function persistAuth(data) {
        window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        setApiToken(data.token);
        setToken(data.token);
        setUser(data.user);
    }

    function clearAuthState() {
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setApiToken(null);
        setToken(null);
        setUser(null);
    }

    async function register(payload) {
        try {
            const response = await api.post('/api/register', payload);
            persistAuth(response.data);
            return response.data.user;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Unable to create your account.'));
        }
    }

    async function login(payload) {
        try {
            const response = await api.post('/api/login', payload);
            persistAuth(response.data);
            return response.data.user;
        } catch (error) {
            throw new Error(getErrorMessage(error, 'Unable to sign you in.'));
        }
    }

    async function logout() {
        try {
            if (token) {
                await api.post('/api/logout');
            }
        } finally {
            clearAuthState();
        }
    }

    return (
        <AuthContext.Provider value={{
            booting,
            login,
            logout,
            register,
            token,
            user,
        }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider.');
    }

    return context;
}
