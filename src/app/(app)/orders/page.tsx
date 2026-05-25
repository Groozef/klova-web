'use client';

import Link from 'next/link';
import { useOrders, useCategories } from '@/lib/api/hooks';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function OrdersPage() {
  const [categoryId, setCategoryId] = useState<string>('');
  const { data: categories } = useCategories();
  const { data: orders, isLoading } = useOrders({
    category_id: categoryId || undefined,
    status: 'open',
  });

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Каталог заказов</h1>
        <Link
          href="/orders/new"
          className="h-11 px-5 inline-flex items-center bg-jade text-paper-ink rounded-md font-medium hover:bg-jade-deep transition-colors"
        >
          + Создать заказ
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setCategoryId('')}
          className={`h-8 px-3 rounded-pill text-xs transition-colors ${
            !categoryId ? 'bg-jade text-paper-ink' : 'bg-ink-2 text-mute hover:bg-ink-3'
          }`}
        >
          Все
        </button>
        {categories?.slice(0, 12).map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`h-8 px-3 rounded-pill text-xs transition-colors ${
              categoryId === c.id ? 'bg-jade text-paper-ink' : 'bg-ink-2 text-mute hover:bg-ink-3'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {isLoading && <div className="text-mute">Загружаю…</div>}
      {!isLoading && (!orders || orders.length === 0) && (
        <div className="p-10 rounded-lg border border-line bg-ink-2 text-center text-mute">
          Пока нет заказов по этому фильтру.
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
              <div>
                <h3 className="font-semibold text-lg">{o.title}</h3>
                <p className="text-xs text-mute mt-0.5">от {o.customer?.name ?? '—'}</p>
              </div>
              <div className="text-jade font-mono font-bold whitespace-nowrap">
                {Number(o.budget).toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <p className="text-sm text-mute line-clamp-2">{o.description}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              {o.categories?.map((c) => (
                <span
                  key={c.category.id}
                  className="text-xs px-2 py-1 rounded-pill bg-ink-3 text-mute"
                >
                  {c.category.name}
                </span>
              ))}
              {o._count && (
                <span className="text-xs text-cobalt ml-auto">
                  {o._count.responses} откликов
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
