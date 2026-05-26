'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-context';

interface Props {
  to?: string;
}

/**
 * Drop at the top of public pages (landing, signin, signup) that should
 * NOT be visible to authenticated users. If a session is found, redirects
 * to `to` (default /feed). Renders nothing while loading or if not authed.
 */
export function RedirectIfAuthed({ to = '/feed' }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(to);
    }
  }, [user, loading, router, to]);

  return null;
}
