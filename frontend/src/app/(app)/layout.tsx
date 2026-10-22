'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { Navbar } from '@/components/navbar';
import { FullPageSpinner } from '@/components/ui';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) return <FullPageSpinner />;

  return (
    <>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-6 pb-28 pt-10">{children}</main>
    </>
  );
}