'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Car } from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface Props {
    headline: string;
    description: string;
    title: string;
    subtitle: string;
    footer: ReactNode;
    children: ReactNode;
}

export function AuthShell({
    headline,
    description,
    title,
    subtitle,
    footer,
    children,
}: Props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
    if (!loading && user) router.replace('/veiculos');
    }, [loading, user, router]);

    return (
    <main className="flex min-h-screen gap-6 bg-black p-4 lg:p-6">
        <aside
        className="relative hidden w-[44%] overflow-hidden rounded-3xl bg-[#111] bg-cover bg-center lg:block"
        style={{ backgroundImage: "url('/auth-bg.jpg')" }}
        >
        <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-8">
            <h2 className="max-w-xs text-3xl font-bold leading-tight">{headline}</h2>
            <p className="mt-3 max-w-sm text-xs text-muted">{description}</p>
        </div>
        </aside>

        <section className="flex flex-1 flex-col items-center justify-center px-2">
        <div className="w-full max-w-sm">
            <Car className="mx-auto size-7" />
            <h1 className="mt-5 text-center text-xl font-bold">{title}</h1>
            <p className="mt-1.5 text-center text-xs text-muted">{subtitle}</p>
            <div className="mt-8">{children}</div>
        </div>
        <p className="mt-10 text-xs text-muted">{footer}</p>
        </section>
    </main>
    );
}