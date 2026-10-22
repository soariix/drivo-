import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth';
import { ToastProvider } from '@/components/toast';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Drivo',
  description: 'Sua garagem, sempre à mão.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="min-h-screen bg-black font-sans text-white antialiased">
        <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}