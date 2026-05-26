'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { mutate } from 'swr';
import { useMe, useSessions } from '@/lib/api/hooks';
import { api } from '@/lib/api/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SecurityPage() {
  const { data: me } = useMe();
  const { data: sessions, isLoading: sessionsLoading } = useSessions();

  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ tone: 'jade' | 'coral'; text: string } | null>(null);

  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeAll, setRevokeAll] = useState(false);

  if (!me) return <div className="text-center py-20 text-mute">Загрузка…</div>;

  const isSetting = !me.has_password;

  async function onSubmitPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPwMsg(null);
    setPwLoading(true);
    const form = new FormData(e.currentTarget);
    const new_password = String(form.get('new_password') ?? '');
    const confirm = String(form.get('confirm') ?? '');
    const old_password = String(form.get('old_password') ?? '');

    if (new_password !== confirm) {
      setPwMsg({ tone: 'coral', text: 'Пароли не совпадают' });
      setPwLoading(false);
      return;
    }

    try {
      if (isSetting) {
        await api('/auth/password/set', { method: 'POST', body: { new_password } });
      } else {
        await api('/auth/password/change', {
          method: 'POST',
          body: { old_password, new_password },
        });
      }
      setPwMsg({
        tone: 'jade',
        text: 'Пароль обновлён. Все активные сессии завершены — войди заново.',
      });
      await mutate('/users/me');
      await mutate('/auth/sessions');
      e.currentTarget.reset();
    } catch (err) {
      setPwMsg({ tone: 'coral', text: err instanceof Error ? err.message : 'Не получилось' });
    } finally {
      setPwLoading(false);
    }
  }

  async function revokeSession(id: string) {
    setRevoking(id);
    try {
      await api(`/auth/sessions/${id}`, { method: 'DELETE' });
      await mutate('/auth/sessions');
    } finally {
      setRevoking(null);
    }
  }

  async function revokeAllSessions() {
    if (!confirm('Выйти со всех устройств? Ты будешь разлогинен везде включая этот браузер.')) return;
    setRevokeAll(true);
    try {
      await api('/auth/sessions', { method: 'DELETE' });
      window.location.assign('/auth/signin');
    } finally {
      setRevokeAll(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-10">
      <div>
        <Link href="/profile/me" className="text-sm text-mute hover:text-paper">
          ← Профиль
        </Link>
        <h1 className="text-3xl font-bold tracking-tight mt-2">Безопасность</h1>
      </div>

      <section className="p-6 rounded-lg border border-line bg-ink-2 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Способы входа</h2>
        <ul className="text-sm flex flex-col gap-2">
          <li className="flex items-center justify-between">
            <span>Email + пароль</span>
            {me.has_password ? (
              <span className="text-jade text-xs px-2 py-0.5 rounded-pill bg-jade-soft border border-jade-line">
                подключён
              </span>
            ) : (
              <span className="text-mute text-xs">не установлен</span>
            )}
          </li>
          <li className="flex items-center justify-between">
            <span>Google</span>
            {me.has_google ? (
              <span className="text-jade text-xs px-2 py-0.5 rounded-pill bg-jade-soft border border-jade-line">
                подключён
              </span>
            ) : (
              <span className="text-mute text-xs">не подключён</span>
            )}
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">
          {isSetting ? 'Установить пароль' : 'Изменить пароль'}
        </h2>
        <p className="text-sm text-mute mb-4">
          {isSetting
            ? 'У тебя пока нет пароля — ты входишь через Google. Установи пароль чтобы можно было входить и через email.'
            : 'Введи текущий пароль и новый. Минимум 8 символов, заглавная + цифра.'}
        </p>

        <form onSubmit={onSubmitPassword} className="flex flex-col gap-4">
          {!isSetting && (
            <Input
              label="Текущий пароль"
              name="old_password"
              type="password"
              required
              autoComplete="current-password"
            />
          )}
          <Input
            label="Новый пароль"
            name="new_password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Минимум 8 символов, A-Z, a-z, цифра"
          />
          <Input
            label="Повтори"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
          />

          {pwMsg && (
            <div
              className={`p-3 rounded-md border text-sm ${
                pwMsg.tone === 'jade'
                  ? 'bg-jade-soft border-jade-line text-jade'
                  : 'bg-coral/15 border-coral/40 text-coral'
              }`}
            >
              {pwMsg.text}
            </div>
          )}

          <Button type="submit" loading={pwLoading} className="self-start">
            {isSetting ? 'Установить' : 'Сохранить'}
          </Button>
        </form>
      </section>

      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">Активные сессии</h2>
          {sessions && sessions.length > 1 && (
            <Button variant="danger" size="sm" onClick={revokeAllSessions} loading={revokeAll}>
              Выйти со всех устройств
            </Button>
          )}
        </div>

        {sessionsLoading && <div className="text-mute text-sm">Загружаю…</div>}
        {!sessionsLoading && (!sessions || sessions.length === 0) && (
          <div className="p-6 rounded-lg border border-line bg-ink-2 text-mute text-sm text-center">
            Нет активных сессий.
          </div>
        )}

        <div className="flex flex-col gap-2">
          {sessions?.map((s) => (
            <div
              key={s.id}
              className="p-4 rounded-lg border border-line bg-ink-2 flex items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono truncate">{s.user_agent ?? 'неизвестный клиент'}</div>
                <div className="text-xs text-mute mt-1">
                  IP {s.ip ?? '—'} · вход {new Date(s.created_at).toLocaleString('ru-RU')} · истечёт{' '}
                  {new Date(s.expires_at).toLocaleDateString('ru-RU')}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => revokeSession(s.id)}
                loading={revoking === s.id}
              >
                Завершить
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
