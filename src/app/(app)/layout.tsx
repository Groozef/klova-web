'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppNav } from '@/components/layout/app-nav';
import { useAuth } from '@/lib/auth/auth-context';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center text-mute">Загрузка…</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppNav />
      <main className="flex-1">{children}</main>
    </div>
  );
}
