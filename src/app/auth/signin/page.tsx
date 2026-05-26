'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { GoogleIcon } from '@/components/ui/google-icon';
import { AlreadyAuthedNotice } from '@/components/auth/already-authed-notice';
import { useAuth } from '@/lib/auth/auth-context';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export default function SigninPage() {
  const { signin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await signin({
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Что-то пошло не так';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AlreadyAuthedNotice />

      <div>
        <h1 className="text-3xl font-bold tracking-tight">С возвращением</h1>
        <p className="mt-2 text-sm text-mute">Войдите чтобы продолжить работу.</p>
      </div>

      <a
        href={`${API_BASE}/auth/google`}
        className="h-11 inline-flex items-center justify-center gap-3 bg-paper text-paper-ink rounded-md font-medium hover:bg-paper-2 transition-colors"
      >
        <GoogleIcon size={18} />
        Войти через Google
      </a>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs uppercase text-mute tracking-wider">или email</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Email" name="email" type="email" required placeholder="you@klova.kz" />
        <Input label="Пароль" name="password" type="password" required placeholder="••••••••" />

        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-xs text-mute hover:text-jade transition-colors">
            Забыл пароль?
          </Link>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-coral/15 border border-coral/40 text-coral text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg">
          Войти
        </Button>
      </form>

      <p className="text-center text-sm text-mute">
        Ещё нет аккаунта?{' '}
        <Link href="/auth/signup" className="text-jade hover:underline">
          Создать
        </Link>
      </p>
    </div>
  );
}
