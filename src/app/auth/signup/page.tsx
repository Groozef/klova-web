'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/auth-context';
import type { Role } from '@/lib/api/types';

export default function SignupPage() {
  const { signup } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<Role>('executor');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      await signup({
        email: String(form.get('email') ?? ''),
        password: String(form.get('password') ?? ''),
        name: String(form.get('name') ?? ''),
        phone: (form.get('phone') as string) || undefined,
        role,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Что-то пошло не так';
      setError(Array.isArray(msg) ? msg.join('. ') : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Регистрация</h1>
        <p className="mt-2 text-sm text-mute">
          Первые 3 месяца — бесплатно. Без скрытых платежей.
        </p>
      </div>

      <a
        href="http://localhost:3000/api/auth/google"
        className="h-11 inline-flex items-center justify-center gap-3 bg-paper text-paper-ink rounded-md font-medium hover:bg-paper-2 transition-colors"
      >
        <span className="w-5 h-5 inline-flex items-center justify-center font-bold">G</span>
        Продолжить через Google
      </a>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-line" />
        <span className="text-xs uppercase text-mute tracking-wider">или email</span>
        <div className="flex-1 h-px bg-line" />
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input label="Имя" name="name" type="text" required minLength={2} placeholder="Айбек Қазыбек" />
        <Input label="Email" name="email" type="email" required placeholder="you@klova.kz" />
        <Input label="Телефон (опционально)" name="phone" type="tel" placeholder="+7 700 ..." />
        <Input
          label="Пароль"
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Минимум 8 символов, A-Z, a-z, цифра"
        />

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-mute font-medium uppercase tracking-wider">Я хочу</span>
          <div className="grid grid-cols-3 gap-2">
            {(['executor', 'customer', 'both'] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`h-11 rounded-md text-sm font-medium transition-colors border ${
                  role === r
                    ? 'bg-jade text-paper-ink border-jade'
                    : 'bg-ink-2 text-paper border-line hover:bg-ink-3'
                }`}
              >
                {r === 'executor' ? 'Брать заказы' : r === 'customer' ? 'Нанимать' : 'И то и то'}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-coral/15 border border-coral/40 text-coral text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={loading} size="lg">
          Создать аккаунт
        </Button>
      </form>

      <p className="text-center text-sm text-mute">
        Уже есть аккаунт?{' '}
        <Link href="/auth/signin" className="text-jade hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
