'use client';

import useSWR from 'swr';
import Link from 'next/link';
import { apiFetcher } from '@/lib/api/client';

interface ChatThread {
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
  const { data: chats, isLoading } = useSWR<ChatThread[]>('/chats', apiFetcher);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-5">
      <h1 className="text-3xl font-bold tracking-tight">Сообщения</h1>

      {isLoading && <div className="text-mute">Загружаю…</div>}
      {!isLoading && (!chats || chats.length === 0) && (
        <div className="p-10 rounded-lg border border-line bg-ink-2 text-center text-mute">
          Пока нет чатов.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {chats?.map((c) => {
          const href = c.deal_id ? `/deals/${c.deal_id}` : `/profile/${c.sender?.id}`;
          const title = c.deal?.order?.title ?? `Чат с ${c.sender?.name}`;
          return (
            <Link
              key={c.id}
              href={href}
              className="p-4 rounded-lg border border-line bg-ink-2 hover:border-jade-line transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="font-medium">{title}</div>
                <div className="text-xs text-mute font-mono whitespace-nowrap">
                  {new Date(c.created_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <p className="text-sm text-mute mt-2 line-clamp-1">{c.content}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
