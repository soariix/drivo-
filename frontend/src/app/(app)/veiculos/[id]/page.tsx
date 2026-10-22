'use client';

import { useToast } from '@/components/toast';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { TriangleAlert } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/format';
import type { Vehicle } from '@/lib/types';
import { VehicleForm } from '@/components/vehicle-form';
import { Alert, Button, ErrorState, Modal, Skeleton } from '@/components/ui';

export default function EditVehiclePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    api<Vehicle>(`/veiculos/${id}`)
      .then(setVehicle)
      .catch(() => setError('Veículo não encontrado.'));
  }, [id]);

  async function handleDelete() {
    setDeleting(true);
    setDeleteError('');
    try {
      await api(`/veiculos/${id}`, { method: 'DELETE' });
      toast('Veículo excluído com sucesso!');
      router.push('/veiculos');
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Erro ao excluir.');
      setDeleting(false);
    }
  }

  if (error) {
    return (
      <>
        <ErrorState message={error} />
        <p className="mt-4 text-center">
          <Link href="/veiculos" className="text-sm text-brand hover:underline">
            Voltar para meus veículos
          </Link>
        </p>
      </>
    );
  }

  if (!vehicle) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <>
      <Link href="/veiculos" className="text-xs text-brand hover:underline">
        Voltar
      </Link>
      <h1 className="mb-8 mt-2 text-3xl font-bold">{vehicle.model}</h1>

      <VehicleForm
        mode="edit"
        initial={vehicle}
        onCancel={() => router.push('/veiculos')}
        onSubmit={async (data) => {
          await api(`/veiculos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
          toast('Veículo atualizado com sucesso!');
          router.push('/veiculos');
        }}
        asideTop={
          <div className="space-y-3 rounded-2xl bg-surface p-5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted">Cadastrado em</span>
              <span className="font-medium">{formatDate(vehicle.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Última alteração</span>
              <span className="font-medium">{formatDate(vehicle.updatedAt)}</span>
            </div>
          </div>
        }
        asideBottom={
          <div className="rounded-2xl bg-surface p-5">
            <h3 className="text-sm font-semibold">Excluir veículo</h3>
            <p className="mt-1 text-xs text-muted">
              Remove o veículo e todos os seus dados da sua garagem. Não é possível desfazer.
            </p>
            <Button
              variant="dangerSoft"
              className="mt-4 w-full"
              onClick={() => setConfirmOpen(true)}
            >
              Excluir veículo
            </Button>
          </div>
        }
      />

      <Modal open={confirmOpen}>
        <div className="text-center">
          <span className="mx-auto flex size-10 items-center justify-center rounded-full bg-danger/15">
            <TriangleAlert className="size-5 text-danger" />
          </span>
          <h2 className="mt-4 text-base font-semibold">Excluir {vehicle.model}?</h2>
          <p className="mt-2 text-xs text-muted">
            O veículo de placa {vehicle.plate} e todos os seus dados serão removidos permanentemente.
          </p>
          {deleteError && (
            <div className="mt-4 text-left">
              <Alert>{deleteError}</Alert>
            </div>
          )}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" disabled={deleting} onClick={() => setConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete}>
              Excluir
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}