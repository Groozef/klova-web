'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth/auth-context';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/feed');
    }
  }, [user, loading, router]);

  // While auth status is being resolved or we're about to redirect — show
  // a quiet loader, NOT the marketing copy. Avoids the "flash of marketing"
  // for returning users.
  if (loading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink">
        <Logo size={48} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-4">
            <Link href="/auth/signin" className="text-sm text-mute hover:text-paper transition-colors">
              Войти
            </Link>
            <Link
              href="/auth/signup"
              className="h-9 px-4 inline-flex items-center bg-jade text-paper-ink rounded-md text-sm font-medium hover:bg-jade-deep transition-colors"
            >
              Регистрация
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden kl-grain">
          <div
            className="absolute pointer-events-none"
            style={{
              top: '-20%',
              right: '-10%',
              width: 700,
              height: 700,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(61,220,151,0.18), transparent 65%)',
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              bottom: '-30%',
              left: '-10%',
              width: 600,
              height: 600,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(91,108,255,0.12), transparent 65%)',
            }}
          />

          <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-36">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-jade-soft border border-jade text-jade text-xs font-mono uppercase tracking-wider mb-8">
              <span className="w-1.5 h-1.5 rounded-full bg-jade animate-pulse" />
              MVP · Алматы и Шымкент
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[0.95] max-w-3xl">
              Работа,<br />
              <span className="text-jade">защищённая</span> от кидков.
            </h1>

            <p className="mt-8 text-xl text-mute max-w-2xl leading-relaxed">
              Маркетплейс самозанятых для СНГ. Эскроу-защита обеих сторон. Налоговый помощник внутри. Старт — Казахстан.
            </p>

            <div className="mt-12 flex flex-wrap items-center gap-4">
              <Link
                href="/auth/signup"
                className="h-14 px-8 inline-flex items-center bg-jade text-paper-ink rounded-lg text-lg font-semibold hover:bg-jade-deep transition-colors"
              >
                Начать бесплатно
              </Link>
              <Link
                href="/auth/signin"
                className="h-14 px-8 inline-flex items-center border border-line rounded-lg text-lg hover:bg-ink-2 transition-colors"
              >
                У меня уже есть аккаунт
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-line bg-ink-2">
          <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-3 gap-6">
            {[
              {
                n: '01',
                title: 'Защита обеих сторон',
                body: 'Эскроу-провайдер замораживает оплату до приёмки работы. Споры решает модерация.',
                accent: 'bg-jade text-paper-ink',
              },
              {
                n: '02',
                title: 'Klova не держит деньги',
                body: 'Лицензированный провайдер на всех этапах: приём, hold, выплата, фискальный чек.',
                accent: 'bg-ink-3 text-paper',
              },
              {
                n: '03',
                title: 'Налог в одном клике',
                body: '«Отложи 6 637 ₸ на налог по ИП-упр» — рекомендация после каждой сделки.',
                accent: 'bg-ink-3 text-paper',
              },
            ].map((card) => (
              <div
                key={card.n}
                className={`p-6 rounded-lg border border-line flex flex-col gap-3 ${card.accent}`}
              >
                <div className="text-xs font-mono opacity-70 tracking-wider">{card.n}</div>
                <h3 className="text-xl font-semibold leading-tight">{card.title}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-mute">
          <Logo size={24} />
          <div className="flex gap-6">
            <span>v0.1.0 · 2026</span>
            <span className="text-jade">Старт — Казахстан</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
