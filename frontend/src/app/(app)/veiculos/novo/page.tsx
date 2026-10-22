'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { VehicleForm } from '@/components/vehicle-form';
import { useToast } from '@/components/toast';

export default function NewVehiclePage() {
  const router = useRouter();
  const toast = useToast();

  return (
    <>
      <Link href="/veiculos" className="text-xs text-brand hover:underline">
        Voltar
      </Link>
      <h1 className="mb-8 mt-2 text-3xl font-bold">Novo veículo</h1>
      <VehicleForm
        mode="create"
        onCancel={() => router.push('/veiculos')}
        onSubmit={async (data) => {
          await api('/veiculos', { method: 'POST', body: JSON.stringify(data) });
          toast('Veículo criado com sucesso!');
          router.push('/veiculos');
        }}
      />
    </>
  );
}