'use client';

import {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useState,
} from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error';
interface Toast {
    id: number;
    type: ToastType;
    text: string;
}

const ToastContext = createContext<
    ((text: string, type?: ToastType) => void) | null
>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const show = useCallback((text: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, text }]);
    setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
    }, []);

    return (
    <ToastContext.Provider value={show}>
        {children}
        <div
        aria-live="polite"
        className="fixed right-4 top-4 z-60 flex flex-col gap-2"
        >
        {toasts.map((t) => (
            <div
            key={t.id}
            role="status"
            className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm shadow-lg ring-1 ring-line"
            >
            {t.type === 'success' ? (
                <CheckCircle2 className="size-4 text-green-400" />
            ) : (
                <XCircle className="size-4 text-danger" />
            )}
            {t.text}
            </div>
        ))}
        </div>
    </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider');
    return ctx;
}