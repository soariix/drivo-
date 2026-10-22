'use client';

import { FormEvent, ReactNode, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getInitials, memberSince } from '@/lib/format';
import type { User } from '@/lib/types';
import { Button, Input } from '@/components/ui';

type Status = { type: 'ok' | 'error'; text: string } | null;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-4 md:grid-cols-[240px_1fr] md:gap-10">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
      </div>
      <div className="overflow-hidden rounded-2xl bg-surface">{children}</div>
    </section>
  );
}

function CardFooter({
  status,
  hint,
  children,
}: {
  status: Status;
  hint: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-line bg-black/20 px-5 py-3">
      <p
        role={status ? 'status' : undefined}
        className={`text-xs ${
          status?.type === 'ok'
            ? 'text-green-400'
            : status?.type === 'error'
              ? 'text-danger'
              : 'text-muted'
        }`}
      >
        {status?.text ?? hint}
      </p>
      {children}
    </div>
  );
}

function ProfileForm({ user, onSaved }: { user: User; onSaved: (u: User) => void }) {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (!firstName.trim()) {
      setStatus({ type: 'error', text: 'Informe seu nome.' });
      return;
    }
    setSaving(true);
    try {
      const updated = await api<User>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        }),
      });
      onSaved(updated);
      setStatus({ type: 'ok', text: 'Alterações salvas.' });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao salvar.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Input label="Nome" name="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        <Input label="Sobrenome" name="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
        <Input label="E-mail" name="email" type="email" className="sm:col-span-2" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <CardFooter status={status} hint="Alterações salvas ficam visíveis na hora.">
        <Button type="submit" loading={saving} className="h-8 px-3 text-xs">
          Salvar
        </Button>
      </CardFooter>
    </form>
  );
}

function PasswordForm() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<Status>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    if (next.length < 8) {
      setStatus({ type: 'error', text: 'A nova senha precisa ter 8 caracteres ou mais.' });
      return;
    }
    if (next !== confirm) {
      setStatus({ type: 'error', text: 'As senhas não conferem.' });
      return;
    }
    setSaving(true);
    try {
      await api('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      });
      setCurrent('');
      setNext('');
      setConfirm('');
      setStatus({ type: 'ok', text: 'Senha alterada com sucesso.' });
    } catch (err) {
      setStatus({
        type: 'error',
        text: err instanceof Error ? err.message : 'Erro ao alterar a senha.',
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 p-5 sm:grid-cols-2">
        <Input label="Senha atual" name="current" type="password" autoComplete="current-password" className="sm:col-span-2" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <Input label="Nova senha" name="next" type="password" autoComplete="new-password" placeholder="Mínimo de 8 caracteres" value={next} onChange={(e) => setNext(e.target.value)} />
        <Input label="Confirmar nova senha" name="confirm" type="password" autoComplete="new-password" placeholder="Repita a nova senha" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <CardFooter status={status} hint="Altere sua senha com segurança">
        <Button type="submit" variant="secondary" loading={saving} className="h-8 px-3 text-xs">
          Alterar senha
        </Button>
      </CardFooter>
    </form>
  );
}

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center gap-5">
        <span className="flex size-16 items-center justify-center rounded-full bg-[#5e5ce6] text-xl font-semibold">
          {getInitials(user.firstName, user.lastName)}
        </span>
        <div>
          <h1 className="text-2xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="mt-1 text-xs text-muted">
            {user.email} · Membro desde {memberSince(user.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-12 space-y-12">
        <Section
          title="Informações pessoais"
          description="Seu nome aparece no app. O e-mail é usado para entrar e receber avisos."
        >
          <ProfileForm user={user} onSaved={setUser} />
        </Section>

        <Section
          title="Senha"
          description="Use ao menos 8 caracteres, combinando letras e números."
        >
          <PasswordForm />
        </Section>

        <Section
          title="Conta"
          description="Encerre a sessão neste dispositivo."
        >
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium">Sair da conta</p>
              <p className="mt-0.5 text-xs text-muted">Encerra a sessão neste dispositivo.</p>
            </div>
            <button onClick={logout} className="text-sm text-brand hover:underline">
              Sair
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}