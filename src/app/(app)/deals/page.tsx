'use client';

import Link from 'next/link';
import { useDeals } from '@/lib/api/hooks';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  escrow_held: { label: 'Ждёт оплаты', color: 'bg-amber/20 text-amber' },
  in_work: { label: 'В работе', color: 'bg-cobalt-soft text-cobalt' },
  review: { label: 'На приёмке', color: 'bg-jade-soft text-jade' },
  completed: { label: 'Завершено', color: 'bg-ink-3 text-mute' },
  disputed: { label: 'Спор', color: 'bg-coral/20 text-coral' },
  refunded: { label: 'Возврат', color: 'bg-ink-3 text-mute' },
};

export default function DealsPage() {
  const { data: deals, isLoading } = useDeals();

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight">Мои сделки</h1>

      {isLoading && <div className="text-mute">Загружаю…</div>}
      {!isLoading && (!deals || deals.length === 0) && (
        <div className="p-10 rounded-lg border border-line bg-ink-2 text-center text-mute">
          У тебя пока нет сделок.
          <br />
          <Link href="/orders" className="text-jade hover:underline mt-2 inline-block">
            Посмотреть каталог заказов →
          </Link>
        </div>
      )}

      <div className="grid gap-4">
        {deals?.map((d) => {
          const status = STATUS_LABELS[d.status] ?? { label: d.status, color: 'bg-ink-3 text-mute' };
          return (
            <Link
              key={d.id}
              href={`/deals/${d.id}`}
              className="p-5 rounded-lg border border-line bg-ink-2 hover:border-jade-line transition-colors flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{d.order?.title ?? d.order_id.slice(0, 8)}</h3>
                <div className="text-xs text-mute mt-1">
                  {d.customer?.name} → {d.executor?.name}
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span className={`text-xs px-3 py-1 rounded-pill ${status.color}`}>
                  {status.label}
                </span>
                <div className="text-jade font-mono font-bold whitespace-nowrap">
                  {Number(d.amount).toLocaleString('ru-RU')} ₸
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
