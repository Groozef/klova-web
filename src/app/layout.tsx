import type { Metadata } from 'next';
import { Manrope, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth/auth-context';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const jbm = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-jbm',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Klova — работа, защищённая от кидков',
  description:
    'Маркетплейс самозанятых для СНГ. Эскроу-защита обеих сторон. Налоговый помощник внутри.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${jbm.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-ink text-paper">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
