'use client';

import { use } from 'react';
import { useUser } from '@/lib/api/hooks';
import { ChatThread } from '@/components/chat/chat-thread';

export default function DirectChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: other } = useUser(userId);

  return (
    <ChatThread
      title={other?.name ?? 'Чат'}
      subtitle={other ? `★ ${other.rating.toFixed(1)}` : undefined}
      fetchKey={`/chats/direct/${userId}`}
      sendPath={`/chats/direct/${userId}/messages`}
    />
  );
}
