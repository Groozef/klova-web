'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { api, apiFetcher } from '@/lib/api/client';
import { useMe } from '@/lib/api/hooks';
import type { Message } from '@/lib/api/types';
import { Button } from '@/components/ui/button';

interface ChatThreadProps {
  title: string;
  subtitle?: string;
  fetchKey: string;
  sendPath: string;
}

export function ChatThread({ title, subtitle, fetchKey, sendPath }: ChatThreadProps) {
  const { data: me } = useMe();
  const { data: messages, isLoading } = useSWR<Message[]>(fetchKey, apiFetcher, {
    refreshInterval: 5_000,
  });
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages?.length]);

  async function onSend(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!draft.trim()) return;
    setError(null);
    setSending(true);
    try {
      await api(sendPath, { method: 'POST', body: { content: draft.trim() } });
      setDraft('');
      await mutate(fetchKey);
      await mutate('/chats');
      await mutate('/notifications/unread-count');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <header className="px-6 py-4 border-b border-line">
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-mute mt-0.5">{subtitle}</p>}
      </header>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
        {isLoading && <div className="text-center text-mute text-sm">Загружаю…</div>}
        {!isLoading && (!messages || messages.length === 0) && (
          <div className="text-center text-mute text-sm py-10">
            Сообщений пока нет. Напиши первый.
          </div>
        )}
        {messages?.map((m) => {
          const mine = m.sender_id === me?.id;
          return (
            <div
              key={m.id}
              className={`flex flex-col max-w-[75%] gap-1 ${mine ? 'self-end items-end' : 'self-start items-start'}`}
            >
              {!mine && m.sender && (
                <div className="text-xs text-mute">{m.sender.name}</div>
              )}
              <div
                className={`px-4 py-2.5 rounded-lg text-sm whitespace-pre-wrap ${
                  mine ? 'bg-jade text-paper-ink' : 'bg-ink-2 text-paper border border-line'
                }`}
              >
                {m.content}
              </div>
              <div className="text-[10px] text-mute font-mono">
                {new Date(m.created_at).toLocaleTimeString('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={onSend} className="border-t border-line px-4 py-3 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (draft.trim()) {
                (e.currentTarget.form as HTMLFormElement).requestSubmit();
              }
            }
          }}
          placeholder="Сообщение… (Enter — отправить, Shift+Enter — новая строка)"
          rows={1}
          className="flex-1 min-h-11 max-h-32 px-4 py-2.5 bg-ink-2 border border-line rounded-md text-paper placeholder:text-mute focus:outline-none focus:border-jade resize-none"
        />
        <Button type="submit" disabled={!draft.trim()} loading={sending}>
          Отправить
        </Button>
      </form>

      {error && (
        <div className="px-4 py-2 bg-coral/15 border-t border-coral/40 text-coral text-sm">{error}</div>
      )}
    </div>
  );
}
