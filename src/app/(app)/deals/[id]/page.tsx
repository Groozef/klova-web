'use client';

import { use, useState } from 'react';
import { useDeal, useMe } from '@/lib/api/hooks';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { mutate } from 'swr';
import type { DealStatus } from '@/lib/api/types';

const STATUS_LABELS: Record<DealStatus, { label: string; color: string; tone: string }> = {
  escrow_held: { label: 'Ждёт оплаты заказчика', color: 'bg-amber/20 text-amber', tone: 'border-amber/40' },
  in_work: { label: 'В работе', color: 'bg-cobalt-soft text-cobalt', tone: 'border-cobalt/40' },
  review: { label: 'На приёмке заказчиком', color: 'bg-jade-soft text-jade', tone: 'border-jade-line' },
  completed: { label: 'Завершено', color: 'bg-ink-3 text-mute', tone: 'border-line' },
  disputed: { label: 'Спор', color: 'bg-coral/20 text-coral', tone: 'border-coral/40' },
  refunded: { label: 'Возврат заказчику', color: 'bg-ink-3 text-mute', tone: 'border-line' },
};

const TX_LABELS: Record<string, string> = {
  payment_in: 'Платёж заказчика',
  payout: 'Выплата исполнителю',
  refund: 'Возврат',
  commission_klova: 'Комиссия Klova',
  commission_provider: 'Комиссия провайдера',
};

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: deal, isLoading } = useDeal(id);
  const { data: me } = useMe();
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !deal) return <div className="text-center py-20 text-mute">Загрузка…</div>;

  const isCustomer = me?.id === deal.customer_id;
  const isExecutor = me?.id === deal.executor_id;
  const status = STATUS_LABELS[deal.status];

  async function act(path: string) {
    setActing(true);
    setError(null);
    try {
      await api(path, { method: 'POST' });
      await mutate(`/deals/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-6">
      <section className={`p-6 rounded-lg border bg-ink-2 ${status.tone}`}>
        <div className="flex items-start justify-between gap-6">
          <div>
            <span className={`text-xs px-3 py-1 rounded-pill ${status.color}`}>{status.label}</span>
            <h1 className="text-2xl font-bold tracking-tight mt-3">
              {deal.order?.title ?? 'Сделка'}
            </h1>
            <p className="text-sm text-mute mt-1">
              {deal.customer?.name} → {deal.executor?.name}
            </p>
          </div>
          <div className="text-right">
            <div className="text-jade font-mono text-3xl font-bold">
              {Number(deal.amount).toLocaleString('ru-RU')} ₸
            </div>
            <div className="text-xs text-mute mt-1 font-mono">
              {new Date(deal.created_at).toLocaleString('ru-RU')}
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-wrap gap-3">
        {isCustomer && deal.status === 'escrow_held' && (
          <Button onClick={() => act(`/deals/${id}/pay`).then(() => act(`/deals/${id}/payment-confirm`))} loading={acting}>
            Оплатить (mock)
          </Button>
        )}
        {isExecutor && deal.status === 'in_work' && (
          <Button onClick={() => act(`/deals/${id}/submit`)} loading={acting}>
            Сдать работу
          </Button>
        )}
        {isCustomer && deal.status === 'review' && (
          <Button onClick={() => act(`/deals/${id}/accept`)} loading={acting}>
            Принять работу
          </Button>
        )}
        {!['completed', 'refunded'].includes(deal.status) && (
          <Button variant="danger" onClick={() => act(`/deals/${id}/dispute`)} loading={acting}>
            Открыть спор
          </Button>
        )}
      </section>

      {error && <div className="text-sm text-coral">{error}</div>}

      {deal.transactions && deal.transactions.length > 0 && (
        <section className="p-5 rounded-lg border border-line bg-ink-2">
          <h2 className="text-lg font-semibold mb-3">Транзакции</h2>
          <div className="flex flex-col divide-y divide-line">
            {deal.transactions.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm">{TX_LABELS[t.type] ?? t.type}</div>
                  <div className="text-xs text-mute font-mono mt-0.5">
                    {t.status} · {new Date(t.created_at).toLocaleString('ru-RU')}
                  </div>
                </div>
                <div className={`font-mono font-bold ${t.type === 'payment_in' ? 'text-cobalt' : t.type.startsWith('commission') ? 'text-mute' : t.type === 'refund' ? 'text-coral' : 'text-jade'}`}>
                  {Number(t.amount).toLocaleString('ru-RU')} ₸
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {deal.tax_record && (
        <section className="p-5 rounded-lg border border-cobalt/40 bg-cobalt-soft">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold text-cobalt">Налоговая сводка</h2>
            <span className="text-xs text-mute font-mono">{deal.tax_record.applied_status}</span>
          </div>
          <p className="text-sm text-paper">
            С полученных <b>{Number(deal.tax_record.income).toLocaleString('ru-RU')} ₸</b> отложи
            <b className="text-cobalt"> {Number(deal.tax_record.recommended_aside).toLocaleString('ru-RU')} ₸</b> на налоги.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
            <div>ИПН: <span className="font-mono">{Number(deal.tax_record.tax_amount).toLocaleString('ru-RU')} ₸</span></div>
            <div>ОСМС: <span className="font-mono">{Number(deal.tax_record.osms_amount).toLocaleString('ru-RU')} ₸</span></div>
            <div>ОПВ: <span className="font-mono">{Number(deal.tax_record.opv_amount).toLocaleString('ru-RU')} ₸</span></div>
          </div>
        </section>
      )}
    </div>
  );
}
