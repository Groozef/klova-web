'use client';

import { use, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useOrder, useOrderResponses, useMe } from '@/lib/api/hooks';
import { api } from '@/lib/api/client';
import { mutate } from 'swr';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useOrder(id);
  const { data: responses, mutate: refetchResponses } = useOrderResponses(id);
  const { data: me } = useMe();
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (isLoading || !order) {
    return <div className="text-center py-20 text-mute">Загрузка…</div>;
  }

  const isCustomer = me?.id === order.customer_id;
  const myResponse = responses?.find((r) => r.executor_id === me?.id);

  async function onRespond(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const form = new FormData(e.currentTarget);
    try {
      await api(`/orders/${id}/responses`, {
        method: 'POST',
        body: {
          cover_letter: String(form.get('cover_letter')),
          proposed_price: Number(form.get('proposed_price')),
        },
      });
      setShowResponseForm(false);
      refetchResponses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  }

  async function acceptResponse(responseId: string) {
    const deal = await api<{ id: string }>(`/responses/${responseId}/accept`, { method: 'POST' });
    await mutate(`/orders/${id}`);
    router.push(`/deals/${deal.id}`);
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      <section className="p-6 rounded-lg border border-line bg-ink-2 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{order.title}</h1>
            <p className="text-mute text-sm mt-1">от {order.customer?.name}</p>
          </div>
          <div className="text-jade font-mono text-2xl font-bold whitespace-nowrap">
            {Number(order.budget).toLocaleString('ru-RU')} ₸
          </div>
        </div>
        <p className="text-paper whitespace-pre-line">{order.description}</p>
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-line">
          {order.categories?.map((c) => (
            <span key={c.category.id} className="text-xs px-2 py-1 rounded-pill bg-ink-3 text-mute">
              {c.category.name}
            </span>
          ))}
          {order.deadline && (
            <span className="text-xs text-mute ml-auto">
              до {new Date(order.deadline).toLocaleDateString('ru-RU')}
            </span>
          )}
        </div>
      </section>

      {!isCustomer && !myResponse && order.status === 'open' && (
        <section>
          {!showResponseForm ? (
            <Button onClick={() => setShowResponseForm(true)} size="lg">
              Откликнуться на заказ
            </Button>
          ) : (
            <form onSubmit={onRespond} className="flex flex-col gap-4 p-5 rounded-lg border border-line bg-ink-2">
              <h2 className="text-lg font-semibold">Твой отклик</h2>
              <Textarea
                name="cover_letter"
                label="Сопроводительное письмо"
                rows={4}
                minLength={10}
                placeholder="Почему именно ты? Опыт, портфолио, подход..."
              />
              <Input
                name="proposed_price"
                label="Твоя цена, ₸"
                type="number"
                required
                min={0}
                step="100"
                defaultValue={order.budget}
              />
              {error && <div className="text-sm text-coral">{error}</div>}
              <div className="flex gap-2">
                <Button type="submit" loading={submitting}>Отправить</Button>
                <Button type="button" variant="ghost" onClick={() => setShowResponseForm(false)}>
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </section>
      )}

      {myResponse && (
        <section className="p-4 rounded-lg bg-jade-soft border border-jade-line text-jade text-sm">
          Твой отклик отправлен · статус: {myResponse.status} · {Number(myResponse.proposed_price).toLocaleString('ru-RU')} ₸
        </section>
      )}

      {isCustomer && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold">Отклики ({responses?.length ?? 0})</h2>
          {responses?.length === 0 && (
            <div className="p-6 rounded-lg border border-line bg-ink-2 text-mute text-center">
              Пока никто не откликнулся.
            </div>
          )}
          {responses?.map((r) => (
            <div key={r.id} className="p-5 rounded-lg border border-line bg-ink-2 flex flex-col gap-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-jade text-paper-ink flex items-center justify-center font-bold uppercase">
                    {r.executor?.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <div className="font-medium">{r.executor?.name}</div>
                    <div className="text-xs text-mute">★ {r.executor?.rating?.toFixed(1) ?? '—'}</div>
                  </div>
                </div>
                <div className="text-jade font-mono font-bold">
                  {Number(r.proposed_price).toLocaleString('ru-RU')} ₸
                </div>
              </div>
              {r.cover_letter && (
                <p className="text-sm text-paper whitespace-pre-line">{r.cover_letter}</p>
              )}
              {r.status === 'pending' && (
                <Button onClick={() => acceptResponse(r.id)} className="self-start" size="sm">
                  Выбрать исполнителем
                </Button>
              )}
              {r.status !== 'pending' && (
                <span className="text-xs text-mute self-start">статус: {r.status}</span>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
