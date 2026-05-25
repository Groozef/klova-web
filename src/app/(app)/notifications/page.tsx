'use client';

import { useNotifications } from '@/lib/api/hooks';
import { api } from '@/lib/api/client';
import { mutate } from 'swr';
import { Button } from '@/components/ui/button';

const TYPE_LABELS: Record<string, string> = {
  profile_incomplete: 'Заполни профиль',
  new_response: 'Новый отклик',
  deal_status_changed: 'Статус сделки',
  dispute_update: 'Спор',
  message: 'Сообщение',
};

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications();

  async function markAll() {
    await api('/notifications/read-all', { method: 'POST' });
    mutate('/notifications');
    mutate('/notifications/unread-count');
  }

  async function markOne(id: string) {
    await api(`/notifications/${id}/read`, { method: 'POST' });
    mutate('/notifications');
    mutate('/notifications/unread-count');
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Уведомления</h1>
        <Button variant="ghost" size="sm" onClick={markAll}>
          Прочитать все
        </Button>
      </div>

      {isLoading && <div className="text-mute">Загружаю…</div>}
      {!isLoading && (!notifications || notifications.length === 0) && (
        <div className="p-10 rounded-lg border border-line bg-ink-2 text-center text-mute">
          Пока тихо.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {notifications?.map((n) => (
          <button
            key={n.id}
            onClick={() => !n.is_read && markOne(n.id)}
            className={`text-left p-4 rounded-lg border transition-colors ${
              n.is_read
                ? 'border-line bg-ink-2 text-mute'
                : 'border-jade-line bg-jade-soft hover:bg-jade/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="font-medium">{TYPE_LABELS[n.type] ?? n.type}</div>
              <div className="text-xs text-mute font-mono whitespace-nowrap">
                {new Date(n.created_at).toLocaleString('ru-RU')}
              </div>
            </div>
            <pre className="text-xs text-mute mt-2 font-mono overflow-x-auto">
              {JSON.stringify(n.payload, null, 2)}
            </pre>
          </button>
        ))}
      </div>
    </div>
  );
}
