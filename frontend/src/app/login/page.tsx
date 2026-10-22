'use client';

import {SyntheticEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuthShell } from '@/components/auth-shell';
import { Alert, Button, Input } from '@/components/ui';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/veiculos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao entrar.');
      setLoading(false);
    }
  }

  return (
    <AuthShell
      headline="Sua garagem, sempre à mão."
      description="Placa, Renavam e licenciamento de todos os seus veículos em um só lugar."
      title="Entrar no Drivo"
      subtitle="Seus veículos, documentos e dados em um só lugar."
      footer={
        <>
          Ainda não tem conta?{' '}
          <Link href="/cadastro" className="text-brand hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Input
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Input
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" loading={loading} className="mt-2 w-full">
          Entrar
        </Button>
      </form>
    </AuthShell>
  );
}