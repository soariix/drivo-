import Link from 'next/link';
import { ArrowRight, Car } from 'lucide-react';
import type { Vehicle } from '@/lib/types';
import { colorDot, maskChassis } from '@/lib/format';

export function VehicleCard({ vehicle: v }: { vehicle: Vehicle }) {
    return (
    <Link
        href={`/veiculos/${v.id}`}
        className="group overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition hover:ring-brand/60"
    >
        <div className="flex h-36 items-center justify-center bg-linear-to-br from-[#2c2c2e] to-[#0b0b0c]">
        <Car className="size-12 text-muted/60" />
        </div>

        <div className="p-4">
        <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted">{v.brand}</p>
            <h3 className="truncate text-base font-semibold">{v.model}</h3>
            </div>
            <span className="rounded bg-white px-2 py-0.5 font-mono text-xs font-bold text-black">
            {v.plate}
            </span>
        </div>

        <p className="mt-2 flex items-center gap-2 text-xs text-muted">
            <span
            className="size-2 rounded-full"
            style={{ background: colorDot(v.color) }}
            />
            {v.color} · {v.manufactureYear}/{v.modelYear} · {v.fuel}
        </p>

        <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
            <div className="grid grid-cols-2 gap-6 text-[10px]">
            <div>
                <p className="uppercase text-muted">Renavam</p>
                <p className="mt-0.5 font-mono text-xs">{v.renavam}</p>
            </div>
            <div>
                <p className="uppercase text-muted">Chassi</p>
                <p className="mt-0.5 font-mono text-xs">{maskChassis(v.chassis)}</p>
            </div>
            </div>
            <span className="flex size-7 items-center justify-center rounded-full bg-surface-2 transition group-hover:bg-brand">
            <ArrowRight className="size-3.5" />
            </span>
        </div>
        </div>
    </Link>
    );
}