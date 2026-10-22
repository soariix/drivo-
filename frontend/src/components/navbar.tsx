'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Car } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { getInitials } from '@/lib/format';

const tabs = [
    { href: '/veiculos', label: 'Meus veículos' },
    { href: '/perfil', label: 'Perfil' },
];

export function Navbar() {
    const pathname = usePathname();
    const { user } = useAuth();
    if (!user) return null;

    return (
    <header className="sticky top-0 z-40 border-b border-line bg-black/80 backdrop-blur">
        <div className="mx-auto grid h-14 max-w-6xl grid-cols-[1fr_auto_1fr] items-center px-6">
        <Link href="/veiculos" className="flex items-center gap-2 text-sm font-semibold">
            <Car className="size-5" />
            Drivo
        </Link>

        <nav className="flex rounded-lg bg-surface p-0.5">
            {tabs.map((tab) => {
            const active = pathname.startsWith(tab.href);
            return (
                <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-md px-3 py-1 text-xs transition ${
                    active ? 'bg-surface-2 text-white' : 'text-muted hover:text-white'
                }`}
                >
                {tab.label}
                </Link>
            );
            })}
        </nav>

        <div className="flex items-center justify-self-end gap-2 text-xs text-muted">
            <span className="hidden sm:inline">
            {user.firstName} {user.lastName}
            </span>
            <span className="flex size-7 items-center justify-center rounded-full bg-[#5e5ce6] text-[10px] font-semibold text-white">
            {getInitials(user.firstName, user.lastName)}
            </span>
        </div>
        </div>
    </header>
    );
}