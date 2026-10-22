'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { api } from '@/lib/api';
import type { Vehicle } from '@/lib/types';
import { useDebounce } from '@/lib/use-debounce';
import { ErrorState, Skeleton } from '@/components/ui';
import { VehicleCard } from '@/components/vehicle-card';

export default function VehiclesPage() {
  const [search, setSearch] = useState('');
  const term = useDebounce(search.trim());
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const query = term ? `?search=${encodeURIComponent(term)}` : '';
    api<Vehicle[]>(`/veiculos${query}`)
      .then((data) => {
        if (!active) return;
        setVehicles(data);
        setError('');
      })
      .catch((err: Error) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, [term, attempt]);

  function retry() {
    setError('');
    setVehicles(null);
    setAttempt((n) => n + 1);
  }

  const count = vehicles?.length ?? 0;
  let content;

  if (error) {
    content = <ErrorState message={error} onRetry={retry} />;
  } else if (!vehicles) {
    content = (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72" />
        ))}
      </div>
    );
  } else if (count === 0 && !term) {
    content = (
      <div className="py-24 text-center">
        <h2 className="text-xl font-bold">Sua garagem está vazia</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Adicione seu primeiro veículo. Com o CRLV em mãos, a maior parte dos
          dados é preenchida automaticamente.
        </p>
        <Link
          href="/veiculos/novo"
          className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-medium hover:brightness-110"
        >
          Importar CRLV
        </Link>
      </div>
    );
  } else if (count === 0) {
    content = (
      <p className="py-20 text-center text-sm text-muted">
        Nenhum veículo encontrado para “{term}”.
      </p>
    );
  } else {
    content = (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v) => (
          <VehicleCard key={v.id} vehicle={v} />
        ))}
        {!term && (
          <Link
            href="/veiculos/novo"
            className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-line p-6 text-center transition hover:border-brand/60"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-surface-2">
              <Plus className="size-4" />
            </span>
            <p className="mt-3 text-sm font-semibold">Adicionar veículo</p>
            <p className="mt-1 text-xs text-muted">
              Preencha manualmente ou importe o CRLV
            </p>
          </Link>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">Meus veículos</h1>
            <Link
              href="/veiculos/novo"
              aria-label="Novo veículo"
              className="flex size-7 items-center justify-center rounded-full bg-brand hover:brightness-110"
            >
              <Plus className="size-4" />
            </Link>
          </div>
          {vehicles && (
            <p className="mt-1 text-xs text-muted">
              {count} {count === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
            </p>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por placa ou modelo"
            aria-label="Buscar veículo"
            className="h-10 w-full rounded-lg bg-surface pl-9 pr-3 text-sm outline-none ring-1 ring-line placeholder:text-muted focus:ring-brand"
          />
        </div>
      </div>

      <div className="mt-8">{content}</div>
    </>
  );
}