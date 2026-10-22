'use client';

import { SyntheticEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { AuthShell } from '@/components/auth-shell';
import { Alert, Button, Input } from '@/components/ui';

export default function RegisterPage() {
    const { register } = useAuth();
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
        setError('A senha deve ter pelo menos 8 caracteres.');
        return;
    }
    if (password !== confirm) {
        setError('As senhas não conferem.');
        return;
    }
    setLoading(true);
    try {
        await register(name.trim(), email.trim(), password);
        router.replace('/veiculos');
    } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao criar conta.');
        setLoading(false);
    }
    }

    return (
    <AuthShell
        headline="Cadastre uma vez. O CRLV faz o resto."
        description="Importe o documento e os dados do veículo são preenchidos automaticamente."
        title="Criar sua conta"
        subtitle="Leva menos de um minuto. Depois é só adicionar seus veículos."
        footer={
        <>
            Já tem uma conta?{' '}
            <Link href="/login" className="text-brand hover:underline">
            Entrar
            </Link>
        </>
        }
    >
        <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Input
            label="Nome completo"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            value={name}
            onChange={(e) => setName(e.target.value)}
        />
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
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <Input
            label="Confirmar senha"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
        />
        <Button type="submit" loading={loading} className="mt-2 w-full">
            Criar conta
        </Button>
      </form>
    </AuthShell>
  );
}