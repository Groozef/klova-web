'use client';

import Link from 'next/link';
import { useRecommendedOrders } from '@/lib/api/hooks';
import { useMe } from '@/lib/api/hooks';

export default function FeedPage() {
  const { data: me } = useMe();
  const { data: orders, isLoading } = useRecommendedOrders();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-10">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">
          Привет, <span className="text-jade">{me?.name ?? '…'}</span>
        </h1>
        <p className="text-mute mt-2">
          {me?.role === 'customer'
            ? 'Готов опубликовать новый заказ?'
            : 'Свежие заказы по твоим специализациям ниже.'}
        </p>
      </section>

      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold">Рекомендуемые заказы</h2>
          <Link href="/orders" className="text-sm text-jade hover:underline">
            Все заказы →
          </Link>
        </div>

        {isLoading && <div className="text-mute text-sm">Загружаю…</div>}
        {!isLoading && (!orders || orders.length === 0) && (
          <div className="p-8 rounded-lg border border-line bg-ink-2 text-center text-mute">
            Пока нет заказов по твоим специализациям.
            <br />
            <Link href="/profile/me" className="text-jade hover:underline mt-2 inline-block">
              Добавить специализации →
            </Link>
          </div>
        )}
        <div className="grid gap-4">
          {orders?.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.id}`}
              className="p-5 rounded-lg border border-line bg-ink-2 hover:border-jade-line transition-colors flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 className="font-semibold text-lg">{o.title}</h3>
                <div className="text-jade font-mono font-bold whitespace-nowrap">
                  {Number(o.budget).toLocaleString('ru-RU')} ₸
                </div>
              </div>
              <p className="text-sm text-mute line-clamp-2">{o.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {o.categories?.map((c) => (
                  <span
                    key={c.category.id}
                    className="text-xs px-2 py-1 rounded-pill bg-ink-3 text-mute"
                  >
                    {c.category.name}
                  </span>
                ))}
                {o._count && o._count.responses > 0 && (
                  <span className="text-xs text-cobalt ml-auto">
                    {o._count.responses} откликов
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
