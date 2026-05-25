'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { apiFetcher } from '@/lib/api/client';
import { useMe } from '@/lib/api/hooks';

interface ChatPreview {
  id: string;
  deal_id: string | null;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: { id: string; name: string; avatar_url: string | null };
  receiver?: { id: string; name: string; avatar_url: string | null };
  deal?: { id: string; order?: { title: string } };
}

export default function ChatsPage() {
  const { data: me } = useMe();
  const { data: chats, isLoading } = useSWR<ChatPreview[]>('/chats', apiFetcher, {
    refreshInterval: 10_000,
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Сообщения</h1>

      {isLoading && <div className="text-mute">Загружаю…</div>}
      {!isLoading && (!chats || chats.length === 0) && (
        <div className="p-10 rounded-lg border border-line bg-ink-2 text-center text-mute">
          Пока нет чатов. Зайди на страницу сделки и нажми «Чат по сделке».
        </div>
      )}

      <div className="flex flex-col gap-2">
        {chats?.map((c) => {
          const counterparty = c.sender_id === me?.id ? c.receiver : c.sender;
          const counterpartyId = c.sender_id === me?.id ? c.receiver_id : c.sender_id;
          const href = c.deal_id
            ? `/chats/deal/${c.deal_id}`
            : `/chats/direct/${counterpartyId}`;
          const title = c.deal?.order?.title
            ? `${c.deal.order.title} · ${counterparty?.name ?? '—'}`
            : (counterparty?.name ?? 'Прямой чат');
          return (
            <Link
              key={c.id}
              href={href}
              className="p-4 rounded-lg border border-line bg-ink-2 hover:border-jade-line transition-colors flex items-start gap-3"
            >
              <div className="w-10 h-10 rounded-full bg-jade text-paper-ink flex items-center justify-center font-bold uppercase shrink-0">
                {counterparty?.avatar_url ? (
                  <img
                    src={counterparty.avatar_url}
                    alt={counterparty.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  counterparty?.name?.[0] ?? '?'
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-medium truncate">{title}</div>
                  <div className="text-xs text-mute font-mono whitespace-nowrap">
                    {new Date(c.created_at).toLocaleDateString('ru-RU')}
                  </div>
                </div>
                <p className="text-sm text-mute mt-1 line-clamp-1">
                  {c.sender_id === me?.id ? 'Ты: ' : ''}
                  {c.content}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
