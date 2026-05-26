'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

function Inner() {
  const params = useSearchParams();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = params.get('token');
    setToken(t);
    if (!t) setError('В ссылке нет токена. Перейди по ссылке из письма.');
  }, [params]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) return;
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const new_password = String(form.get('new_password') ?? '');
    const confirm = String(form.get('confirm') ?? '');
    if (new_password !== confirm) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }
    try {
      await api('/auth/password/reset', {
        method: 'POST',
        body: { token, new_password },
        skipAuth: true,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось сбросить пароль');
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="flex flex-col gap-6 items-center text-center">
        <div className="w-16 h-16 rounded-full bg-jade-soft border border-jade-line flex items-center justify-center text-3xl text-jade">
          ✓
        </div>
        <div>
          <h1 className="text-2xl font-bold">Пароль обновлён</h1>
          <p className="mt-2 text-sm text-mute">
            Все активные сессии завершены для безопасности. Войди заново.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="h-11 px-6 inline-flex items-center bg-jade text-paper-ink rounded-md font-medium hover:bg-jade-deep transition-colors"
        >
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Новый пароль</h1>
        <p className="mt-2 text-sm text-mute">
          Минимум 8 символов, заглавная + цифра.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Новый пароль"
          name="new_password"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
        />
        <Input
          label="Повтори пароль"
          name="confirm"
          type="password"
          required
          minLength={8}
          placeholder="••••••••"
          autoComplete="new-password"
        />

        {error && (
          <div className="p-3 rounded-md bg-coral/15 border border-coral/40 text-coral text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg" disabled={!token}>
          Установить пароль
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center text-mute">Загружаем…</div>}>
      <Inner />
    </Suspense>
  );
}
