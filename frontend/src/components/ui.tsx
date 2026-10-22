import type {
    ButtonHTMLAttributes,
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
} from 'react';
import { Loader2 } from 'lucide-react';

type Variant = 'primary' | 'secondary' | 'danger' | 'dangerSoft';

const variants: Record<Variant, string> = {
    primary: 'bg-brand text-white hover:brightness-110',
    secondary: 'bg-surface-2 text-white hover:bg-[#3a3a3c]',
    danger: 'bg-danger text-white hover:brightness-110',
    dangerSoft: 'bg-danger/15 text-danger hover:bg-danger/25',
};

export function Button({
    variant = 'primary',
    loading = false,
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    loading?: boolean;
}) {
    return (
    <button
        type={type}
        disabled={disabled || loading}
        className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
        {...props}
    >
        {loading && <Loader2 className="size-4 animate-spin" />}
        {children}
    </button>
    );
}

const fieldClass =
    'h-10 w-full rounded-lg bg-surface-2 px-3 text-sm text-white outline-none ring-1 ring-transparent placeholder:text-muted focus:ring-brand';

export function Input({
    label,
    error,
    className = '',
    id,
    ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
    const inputId = id ?? props.name;
    return (
    <div className={className}>
        <label htmlFor={inputId} className="mb-1.5 block text-xs text-muted">
        {label}
        </label>
        <input
        id={inputId}
        aria-invalid={!!error}
        className={`${fieldClass} ${error ? 'ring-danger' : ''}`}
        {...props}
        />
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
    );
}

export function Select({
    label,
    options,
    error,
    className = '',
    id,
    value,
    ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
    label: string;
    options: string[];
    error?: string;
}) {
    const current = String(value ?? '');
    const list =
    current && !options.includes(current) ? [current, ...options] : options;
    const selectId = id ?? props.name;
    return (
    <div className={className}>
        <label htmlFor={selectId} className="mb-1.5 block text-xs text-muted">
        {label}
        </label>
        <select
        id={selectId}
        value={current}
        aria-invalid={!!error}
        className={`${fieldClass} ${error ? 'ring-danger' : ''}`}
        {...props}
        >
        <option value="">Selecione</option>
        {list.map((option) => (
            <option key={option} value={option}>
            {option}
            </option>
        ))}
        </select>
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
    );
}

export function Alert({ children }: { children: ReactNode }) {
    return (
    <p
        role="alert"
        className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger"
    >
        {children}
    </p>
    );
}

export function Modal({
    open,
    children,
}: {
    open: boolean;
    children: ReactNode;
}) {
    if (!open) return null;
    return (
    <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
    >
        <div className="w-full max-w-sm rounded-2xl bg-surface p-6">
        {children}
        </div>
    </div>
    );
}

export function Skeleton({ className = '' }: { className?: string }) {
    return (
    <div className={`animate-pulse rounded-2xl bg-surface ${className}`} />
    );
}

export function FullPageSpinner() {
    return (
    <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted" />
    </div>
    );
}

export function ErrorState({
    message,
    onRetry,
}: {
    message: string;
    onRetry?: () => void;
}) {
    return (
    <div className="mx-auto max-w-md rounded-2xl bg-surface p-8 text-center">
        <h2 className="text-base font-semibold">Algo deu errado</h2>
        <p className="mt-2 text-sm text-muted">{message}</p>
        {onRetry && (
        <Button className="mt-5" variant="secondary" onClick={onRetry}>
            Tentar novamente
        </Button>
        )}
    </div>
    );
}