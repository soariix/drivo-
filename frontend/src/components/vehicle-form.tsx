'use client';

import { ChangeEvent, FormEvent, ReactNode, useRef, useState } from 'react';
import { FileText } from 'lucide-react';
import { api } from '@/lib/api';
import type { Vehicle, VehicleInput } from '@/lib/types';
import { Alert, Button, Input, Select } from '@/components/ui';

const FUELS = ['Gasolina', 'Etanol', 'Flex', 'Diesel', 'Híbrido', 'Elétrico', 'GNV'];
const TYPES = ['Automóvel', 'Moto'];

interface Values {
  plate: string;
  renavam: string;
  chassis: string;
  brand: string;
  model: string;
  manufactureYear: string;
  modelYear: string;
  color: string;
  fuel: string;
  type: string;
  nickname: string;
}

type Errors = Partial<Record<keyof Values, string>>;
type CrlvResult = Partial<Record<Exclude<keyof Values, 'nickname'>, string | number | null>>;

const emptyValues: Values = {
  plate: '',
  renavam: '',
  chassis: '',
  brand: '',
  model: '',
  manufactureYear: '',
  modelYear: '',
  color: '',
  fuel: '',
  type: 'Automóvel',
  nickname: '',
};

const fromVehicle = (v: Vehicle): Values => ({
  plate: v.plate,
  renavam: v.renavam,
  chassis: v.chassis,
  brand: v.brand,
  model: v.model,
  manufactureYear: String(v.manufactureYear),
  modelYear: String(v.modelYear),
  color: v.color,
  fuel: v.fuel,
  type: v.type,
  nickname: v.nickname ?? '',
});

const clean = (value: string) => value.toUpperCase().replace(/[^A-Z0-9]/g, '');

function validate(v: Values): Errors {
  const errors: Errors = {};
  if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(clean(v.plate))) {
    errors.plate = 'Placa inválida';
  }
  if (!/^\d{9,11}$/.test(v.renavam)) {
    errors.renavam = 'Renavam deve ter de 9 a 11 números';
  }
  if (clean(v.chassis).length !== 17) {
    errors.chassis = 'Chassi deve ter 17 caracteres';
  }
  (['brand', 'model', 'color', 'fuel', 'type'] as const).forEach((key) => {
    if (!v[key].trim()) errors[key] = 'Obrigatório';
  });
  (['manufactureYear', 'modelYear'] as const).forEach((key) => {
    const year = Number(v[key]);
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      errors[key] = 'Ano inválido';
    }
  });
  return errors;
}

const toInput = (v: Values): VehicleInput => ({
  plate: clean(v.plate),
  renavam: v.renavam.trim(),
  chassis: clean(v.chassis),
  brand: v.brand.trim(),
  model: v.model.trim(),
  manufactureYear: Number(v.manufactureYear),
  modelYear: Number(v.modelYear),
  color: v.color.trim(),
  fuel: v.fuel.trim(),
  type: v.type.trim(),
  nickname: v.nickname.trim(),
});

function applyCrlv(prev: Values, data: CrlvResult): Values {
  const pick = (value: string | number | null | undefined, fallback: string) =>
    value === null || value === undefined || value === '' ? fallback : String(value);

  return {
    ...prev,
    plate: pick(data.plate, prev.plate),
    renavam: pick(data.renavam, prev.renavam),
    chassis: pick(data.chassis, prev.chassis),
    brand: pick(data.brand, prev.brand),
    model: pick(data.model, prev.model),
    manufactureYear: pick(data.manufactureYear, prev.manufactureYear),
    modelYear: pick(data.modelYear, prev.modelYear),
    color: pick(data.color, prev.color),
    fuel: pick(data.fuel, prev.fuel),
    type: pick(data.type, prev.type),
  };
}

interface Props {
  mode: 'create' | 'edit';
  initial?: Vehicle;
  onSubmit: (data: VehicleInput) => Promise<void>;
  onCancel: () => void;
  asideTop?: ReactNode;
  asideBottom?: ReactNode;
}

export function VehicleForm({
  mode,
  initial,
  onSubmit,
  onCancel,
  asideTop,
  asideBottom,
}: Props) {
  const [values, setValues] = useState<Values>(
    initial ? fromVehicle(initial) : emptyValues,
  );
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const [fileName, setFileName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const field =
    (key: keyof Values) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((prev) => ({ ...prev, [key]: e.target.value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    };

  async function handleFile(file: File) {
    setImportError('');
    if (file.size > 5 * 1024 * 1024) {
      setImportError('O arquivo deve ter no máximo 5 MB.');
      return;
    }
    setImporting(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const data = await api<CrlvResult>('/crlv/scan', { method: 'POST', body });
      setValues((prev) => applyCrlv(prev, data));
      setErrors({});
      setFileName(file.name);
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Não foi possível ler o CRLV.',
      );
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    setServerError('');
    try {
      await onSubmit(toInput(values));
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Erro ao salvar.');
      setSubmitting(false);
    }
  }

  const label = [values.brand, values.model].filter(Boolean).join(' ');
  const footerLabel =
    mode === 'create'
      ? `Novo veículo${label ? ` · ${label}` : ''}`
      : `Editando${label ? ` · ${label}` : ''}${values.plate ? ` · ${values.plate}` : ''}`;

  const hiddenInput = (
    <input
      ref={fileRef}
      type="file"
      accept="application/pdf,image/png,image/jpeg"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
        e.target.value = '';
      }}
    />
  );

  const crlvBlock =
    mode === 'create' ? (
      <div className="rounded-2xl bg-surface p-5">
        <h3 className="text-sm font-semibold">Importar CRLV</h3>
        <p className="mt-1 text-xs text-muted">Preenchemos o formulário para você</p>
        {fileName && (
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface-2 p-3 text-xs">
            <FileText className="size-4 shrink-0 text-danger" />
            <span className="truncate">{fileName}</span>
          </div>
        )}
        <Button
          variant="secondary"
          className="mt-4 w-full"
          loading={importing}
          onClick={() => fileRef.current?.click()}
        >
          {importing
            ? 'Lendo documento...'
            : fileName
              ? 'Importar outro CRLV'
              : 'Importar CRLV'}
        </Button>
        {importError && <p className="mt-3 text-xs text-danger">{importError}</p>}
        {hiddenInput}
      </div>
    ) : (
      <div>
        <Button
          variant="secondary"
          className="w-full"
          loading={importing}
          onClick={() => fileRef.current?.click()}
        >
          {importing ? 'Lendo documento...' : 'Atualizar com novo CRLV'}
        </Button>
        {importError && <p className="mt-2 text-xs text-danger">{importError}</p>}
        {hiddenInput}
      </div>
    );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {serverError && <Alert>{serverError}</Alert>}

          <section className="rounded-2xl bg-surface p-6">
            <h2 className="text-base font-semibold">Identificação</h2>
            <p className="mt-1 text-xs text-muted">Dados oficiais do veículo, conforme o documento.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Placa" name="plate" maxLength={8} className="[&_input]:uppercase" value={values.plate} onChange={field('plate')} error={errors.plate} />
              <Input label="Renavam" name="renavam" inputMode="numeric" maxLength={11} value={values.renavam} onChange={field('renavam')} error={errors.renavam} />
              <Input label="Chassi" name="chassis" maxLength={17} className="sm:col-span-2 [&_input]:uppercase" value={values.chassis} onChange={field('chassis')} error={errors.chassis} />
            </div>
          </section>

          <section className="rounded-2xl bg-surface p-6">
            <h2 className="text-base font-semibold">Características</h2>
            <p className="mt-1 text-xs text-muted">Como o veículo aparece na sua garagem.</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Input label="Marca" name="brand" value={values.brand} onChange={field('brand')} error={errors.brand} />
              <Input label="Modelo" name="model" value={values.model} onChange={field('model')} error={errors.model} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Input label="Ano de fabricação" name="manufactureYear" inputMode="numeric" maxLength={4} value={values.manufactureYear} onChange={field('manufactureYear')} error={errors.manufactureYear} />
              <Input label="Ano do modelo" name="modelYear" inputMode="numeric" maxLength={4} value={values.modelYear} onChange={field('modelYear')} error={errors.modelYear} />
              <Input label="Cor" name="color" value={values.color} onChange={field('color')} error={errors.color} />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Select label="Combustível" name="fuel" options={FUELS} value={values.fuel} onChange={field('fuel')} error={errors.fuel} />
              <Select label="Tipo" name="type" options={TYPES} value={values.type} onChange={field('type')} error={errors.type} />
              <Input label="Apelido (opcional)" name="nickname" placeholder="Ex.: Carro da família" value={values.nickname} onChange={field('nickname')} />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          {asideTop}
          {crlvBlock}
          {asideBottom}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-black/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
          <p className="truncate text-xs text-muted">{footerLabel}</p>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" loading={submitting}>
              {mode === 'create' ? 'Salvar veículo' : 'Salvar alterações'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}