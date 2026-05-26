'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api('/auth/password/forgot', {
        method: 'POST',
        body: { email },
        skipAuth: true,
      });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить письмо');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col gap-6 items-center text-center">
        <div className="w-16 h-16 rounded-full bg-jade-soft border border-jade-line flex items-center justify-center text-3xl text-jade">
          ✓
        </div>
        <div>
          <h1 className="text-2xl font-bold">Письмо отправлено</h1>
          <p className="mt-2 text-sm text-mute">
            Если такой email зарегистрирован — на него придёт ссылка для сброса пароля.
            Действует 2 часа.
          </p>
          <p className="mt-3 text-xs text-mute">
            Не пришло? Проверь спам, или
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-jade hover:underline ml-1"
            >
              отправь ещё раз
            </button>
            .
          </p>
        </div>
        <Link href="/auth/signin" className="text-jade hover:underline">
          ← К входу
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Сброс пароля</h1>
        <p className="mt-2 text-sm text-mute">
          Введи email от аккаунта — пришлём ссылку для сброса.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          required
          placeholder="you@klova.kz"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {error && (
          <div className="p-3 rounded-md bg-coral/15 border border-coral/40 text-coral text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg">
          Прислать ссылку
        </Button>
      </form>

      <p className="text-center text-sm text-mute">
        Вспомнил пароль?{' '}
        <Link href="/auth/signin" className="text-jade hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
