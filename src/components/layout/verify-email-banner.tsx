'use client';

import { useState } from 'react';
import { useMe } from '@/lib/api/hooks';
import { api } from '@/lib/api/client';

export function VerifyEmailBanner() {
  const { data: me } = useMe();
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  if (!me || me.email_verified_at) return null;

  async function resend() {
    setState('sending');
    setMsg(null);
    try {
      await api('/auth/verification/resend', { method: 'POST' });
      setState('sent');
    } catch (err) {
      setState('error');
      setMsg(err instanceof Error ? err.message : 'Не получилось');
    }
  }

  return (
    <div className="bg-amber/15 border-b border-amber/40 text-amber text-sm">
      <div className="max-w-7xl mx-auto px-6 py-2 flex flex-wrap items-center justify-between gap-3">
        <div>
          ⚠ Подтверди email <span className="text-mute">({me.email})</span> — мы отправили письмо со ссылкой.
        </div>
        <div className="flex items-center gap-3">
          {state === 'sent' && <span className="text-jade text-xs">письмо отправлено заново ✓</span>}
          {state === 'error' && <span className="text-coral text-xs">{msg}</span>}
          <button
            type="button"
            onClick={resend}
            disabled={state === 'sending' || state === 'sent'}
            className="text-xs underline disabled:opacity-50 hover:text-paper transition-colors"
          >
            {state === 'sending' ? 'Отправляю…' : 'Отправить ещё раз'}
          </button>
        </div>
      </div>
    </div>
  );
}
