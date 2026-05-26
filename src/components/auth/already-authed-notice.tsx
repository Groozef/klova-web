'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import { useMe } from '@/lib/api/hooks';

export function AlreadyAuthedNotice() {
  const { user, logout } = useAuth();
  const { data: me } = useMe();

  if (!user) return null;

  return (
    <div className="p-3 rounded-md bg-jade-soft border border-jade-line text-sm flex flex-wrap items-center justify-between gap-3">
      <span className="text-jade">
        Уже залогинен как <b>{me?.name ?? me?.email ?? 'я'}</b>
      </span>
      <div className="flex items-center gap-3">
        <Link href="/feed" className="text-jade hover:underline font-medium">
          В ленту →
        </Link>
        <button
          type="button"
          onClick={() => logout()}
          className="text-mute hover:text-coral transition-colors text-xs"
        >
          Выйти и войти как другой
        </button>
      </div>
    </div>
  );
}
