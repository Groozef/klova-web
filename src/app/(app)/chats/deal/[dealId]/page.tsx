'use client';

import { use } from 'react';
import { useDeal } from '@/lib/api/hooks';
import { ChatThread } from '@/components/chat/chat-thread';

export default function DealChatPage({ params }: { params: Promise<{ dealId: string }> }) {
  const { dealId } = use(params);
  const { data: deal } = useDeal(dealId);

  const title = deal?.order?.title ?? 'Чат по сделке';
  const subtitle = deal
    ? `${deal.customer?.name ?? '—'} ↔ ${deal.executor?.name ?? '—'} · ${Number(deal.amount).toLocaleString('ru-RU')} ₸`
    : undefined;

  return (
    <ChatThread
      title={title}
      subtitle={subtitle}
      fetchKey={`/chats/deal/${dealId}`}
      sendPath={`/chats/deal/${dealId}/messages`}
    />
  );
}
