const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const TOKEN_KEY = 'drivo_token';

export const tokenStore = {
    get: () =>
    typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY),
    set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
    constructor(
    public status: number,
    message: string,
    ) {
    super(message);
    }
}

export async function api<T>(
    path: string,
    options: RequestInit = {},
): Promise<T> {
    const headers = new Headers(options.headers);
    const token = tokenStore.get();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
    }

    let res: Response;
    try {
    res = await fetch(`${API_URL}${path}`, { ...options, headers });
    } catch {
    throw new ApiError(0, 'Não foi possível conectar ao servidor.');
    }

    if (res.status === 401 && token) {
    tokenStore.clear();
    window.location.href = '/login';
    }

    if (!res.ok) {
    const data = await res.json().catch(() => null);
    const message = Array.isArray(data?.message)
        ? data.message[0]
        : data?.message;
    throw new ApiError(
        res.status,
        message ?? 'Algo deu errado. Tente novamente.',
    );
    }

    if (res.status === 204) return undefined as T;
    return res.json();
}