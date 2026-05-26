'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api } from '@/lib/api/client';
import { useAuth } from '@/lib/auth/auth-context';
import { mutate } from 'swr';

export const dynamic = 'force-dynamic';

type Status = 'loading' | 'success' | 'error';

function Inner() {
  const params = useSearchParams();
  const { user } = useAuth();
  const [status, setStatus] = useState<Status>('loading');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const token = params.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Токен не пришёл в ссылке.');
      return;
    }
    api(`/auth/verify-email?token=${encodeURIComponent(token)}`, { skipAuth: true })
      .then(() => {
        setStatus('success');
        mutate('/users/me');
      })
      .catch((err: unknown) => {
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'Не удалось подтвердить email');
      });
  }, [params]);

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      {status === 'loading' && (
        <>
          <div className="w-16 h-16 rounded-full bg-ink-3 flex items-center justify-center text-3xl">
            ⏳
          </div>
          <h1 className="text-2xl font-bold">Проверяем токен…</h1>
        </>
      )}
      {status === 'success' && (
        <>
          <div className="w-16 h-16 rounded-full bg-jade-soft border border-jade-line flex items-center justify-center text-3xl text-jade">
            ✓
          </div>
          <div>
            <h1 className="text-2xl font-bold">Email подтверждён</h1>
            <p className="mt-2 text-sm text-mute">
              Теперь можно полноценно использовать Klova.
            </p>
          </div>
          <Link
            href={user ? '/feed' : '/auth/signin'}
            className="h-11 px-6 inline-flex items-center bg-jade text-paper-ink rounded-md font-medium hover:bg-jade-deep transition-colors"
          >
            {user ? 'В ленту' : 'Войти'}
          </Link>
        </>
      )}
      {status === 'error' && (
        <>
          <div className="w-16 h-16 rounded-full bg-coral/15 border border-coral/40 flex items-center justify-center text-3xl text-coral">
            ✕
          </div>
          <div>
            <h1 className="text-2xl font-bold">Не получилось</h1>
            <p className="mt-2 text-sm text-coral">{message}</p>
            <p className="mt-3 text-sm text-mute">
              Запроси новое письмо из шапки на главной странице (баннер «Подтверди email»).
            </p>
          </div>
          <Link href={user ? '/feed' : '/auth/signin'} className="text-jade hover:underline">
            {user ? 'Вернуться в ленту' : 'На вход'}
          </Link>
        </>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="text-center text-mute">Загружаем…</div>}>
      <Inner />
    </Suspense>
  );
}
