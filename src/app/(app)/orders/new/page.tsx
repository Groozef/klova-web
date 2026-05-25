'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories } from '@/lib/api/hooks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';

interface CreatedOrder {
  id: string;
}

export default function NewOrderPage() {
  const router = useRouter();
  const { data: categories } = useCategories();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    if (selected.size === 0) {
      setError('Выбери хотя бы одну категорию');
      return;
    }
    setLoading(true);
    const form = new FormData(e.currentTarget);
    try {
      const order = await api<CreatedOrder>('/orders', {
        method: 'POST',
        body: {
          title: String(form.get('title')),
          description: String(form.get('description')),
          budget: Number(form.get('budget')),
          deadline: form.get('deadline') ? new Date(String(form.get('deadline'))).toISOString() : undefined,
          category_ids: Array.from(selected),
        },
      });
      router.push(`/orders/${order.id}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка';
      setError(Array.isArray(msg) ? msg.join('. ') : msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Новый заказ</h1>
        <p className="text-mute mt-2">
          Опиши задачу подробно — это поможет получить точные отклики.
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <Input
          label="Название"
          name="title"
          required
          minLength={5}
          maxLength={200}
          placeholder="Например: логотип для кофейни"
        />
        <Textarea
          label="Описание"
          name="description"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder="Что нужно сделать? Стиль, референсы, формат сдачи..."
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Бюджет, ₸" name="budget" type="number" required min={0} step="100" placeholder="80000" />
          <Input label="Дедлайн (опционально)" name="deadline" type="date" />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-mute font-medium uppercase tracking-wider">Категории</span>
          <div className="flex flex-wrap gap-2 p-3 rounded-md border border-line bg-ink-2 max-h-64 overflow-y-auto">
            {categories?.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => toggle(c.id)}
                className={`text-xs px-3 py-1.5 rounded-pill transition-colors ${
                  selected.has(c.id)
                    ? 'bg-jade text-paper-ink'
                    : 'bg-ink-3 text-mute hover:bg-ink-4'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-coral/15 border border-coral/40 text-coral text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <Button type="submit" size="lg" loading={loading}>
            Опубликовать
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
            Отмена
          </Button>
        </div>
      </form>
    </div>
  );
}
