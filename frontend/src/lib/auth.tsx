'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { api, tokenStore } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthContextValue {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const loadUser = useCallback(async () => {
    if (!tokenStore.get()) {
        setUser(null);
        setLoading(false);
        return;
    }
    try {
        setUser(await api<User>('/users/me'));
    } catch {
        tokenStore.clear();
        setUser(null);
    } finally {
        setLoading(false);
    }
    }, []);

    useEffect(() => {
    loadUser();
    }, [loadUser]);

    async function authenticate(path: string, body: object) {
    const { accessToken } = await api<{ accessToken: string }>(path, {
        method: 'POST',
        body: JSON.stringify(body),
    });
    tokenStore.set(accessToken);
    await loadUser();
    }

    const login = (email: string, password: string) =>
    authenticate('/auth/login', { email, password });

    const register = (name: string, email: string, password: string) =>
    authenticate('/auth/register', { name, email, password });

    function logout() {
    tokenStore.clear();
    setUser(null);
    router.replace('/login');
    }

    return (
    <AuthContext.Provider
        value={{ user, loading, login, register, logout, setUser }}
    >
        {children}
    </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
    return ctx;
}