'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/ui/logo';
import { useAuth } from '@/lib/auth/auth-context';
import { useUnreadNotifications } from '@/lib/api/hooks';

const NAV = [
  { href: '/feed', label: 'Лента' },
  { href: '/orders', label: 'Заказы' },
  { href: '/deals', label: 'Сделки' },
  { href: '/chats', label: 'Сообщения' },
  { href: '/tax', label: 'Налоги' },
];

export function AppNav() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { count } = useUnreadNotifications();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-6">
        <Link href="/feed" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`h-9 px-3 inline-flex items-center rounded-md text-sm transition-colors ${
                  active ? 'bg-ink-3 text-paper' : 'text-mute hover:text-paper hover:bg-ink-2'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/notifications"
            className="relative h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-ink-2 transition-colors"
            aria-label="Уведомления"
          >
            <span className="text-lg">🔔</span>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 inline-flex items-center justify-center text-[10px] font-bold bg-coral text-paper rounded-full">
                {count > 9 ? '9+' : count}
              </span>
            )}
          </Link>

          <Link
            href="/profile/me"
            className={`h-9 px-3 inline-flex items-center gap-2 rounded-md text-sm transition-colors ${
              pathname.startsWith('/profile/me') ? 'bg-ink-3' : 'hover:bg-ink-2'
            }`}
          >
            <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-jade text-paper-ink text-xs font-bold uppercase">
              {user?.id?.[0] ?? '?'}
            </span>
            <span className="hidden sm:inline">Я</span>
          </Link>

          <button
            onClick={() => logout()}
            className="text-sm text-mute hover:text-coral transition-colors"
          >
            Выйти
          </button>
        </div>
      </div>
    </header>
  );
}
