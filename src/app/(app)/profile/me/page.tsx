'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useMe, useCategories, useCities, useCountries } from '@/lib/api/hooks';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { mutate } from 'swr';
import type { Role } from '@/lib/api/types';

export default function MyProfilePage() {
  const { data: me, isLoading } = useMe();
  const { data: countries } = useCountries();
  const [countryId, setCountryId] = useState<string | null>(null);
  const { data: cities } = useCities(countryId);
  const { data: categories } = useCategories();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [cityId, setCityId] = useState<string>('');
  const [role, setRole] = useState<Role>('executor');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (me) {
      setName(me.name);
      setBio(me.bio ?? '');
      setCityId(me.city_id ?? '');
      setRole(me.role);
    }
  }, [me]);

  useEffect(() => {
    if (countries && countries.length > 0 && !countryId) setCountryId(countries[0].id);
  }, [countries, countryId]);

  async function onSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      await api('/users/me', {
        method: 'PATCH',
        body: { name, bio, city_id: cityId || undefined, role },
      });
      await mutate('/users/me');
      setMsg('Сохранено');
    } catch (err) {
      setMsg(err instanceof Error ? err.message : 'Ошибка');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !me) {
    return <div className="text-center py-20 text-mute">Загрузка…</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      <section className="flex items-start gap-6 p-6 rounded-lg border border-line bg-ink-2">
        <div className="w-20 h-20 rounded-full bg-jade text-paper-ink flex items-center justify-center text-3xl font-bold uppercase shrink-0">
          {me.avatar_url ? (
            <img src={me.avatar_url} alt={me.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            me.name[0]
          )}
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{me.name}</h1>
          <p className="text-mute text-sm mt-1">{me.email}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm">
            <span className="px-2 py-1 rounded-pill bg-ink-3 text-mute">{me.role}</span>
            <span className="px-2 py-1 rounded-pill bg-ink-3 text-mute">{me.tax_status}</span>
            {me.verified && (
              <span className="px-2 py-1 rounded-pill bg-jade-soft text-jade border border-jade-line">
                ✓ Verified
              </span>
            )}
            <span className="px-2 py-1 rounded-pill bg-ink-3 text-mute">★ {me.rating.toFixed(1)}</span>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4">Редактировать профиль</h2>
        <form onSubmit={onSave} className="flex flex-col gap-4">
          <Input label="Имя" value={name} onChange={(e) => setName(e.target.value)} required />
          <Textarea
            label="О себе"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Расскажи о своём опыте, специализациях, портфолио..."
          />

          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-mute font-medium uppercase tracking-wider">Страна</span>
              <select
                value={countryId ?? ''}
                onChange={(e) => setCountryId(e.target.value)}
                className="h-11 px-4 bg-ink-2 border border-line rounded-md text-paper focus:outline-none focus:border-jade"
              >
                {countries?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-2">
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm text-mute font-medium uppercase tracking-wider">Город</span>
              <select
                value={cityId}
                onChange={(e) => setCityId(e.target.value)}
                className="h-11 px-4 bg-ink-2 border border-line rounded-md text-paper focus:outline-none focus:border-jade"
              >
                <option value="" className="bg-ink-2">— не указан —</option>
                {cities?.map((c) => (
                  <option key={c.id} value={c.id} className="bg-ink-2">
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm text-mute font-medium uppercase tracking-wider">Роль</span>
            <div className="grid grid-cols-3 gap-2">
              {(['executor', 'customer', 'both'] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`h-11 rounded-md text-sm font-medium transition-colors border ${
                    role === r
                      ? 'bg-jade text-paper-ink border-jade'
                      : 'bg-ink-2 text-paper border-line hover:bg-ink-3'
                  }`}
                >
                  {r === 'executor' ? 'Исполнитель' : r === 'customer' ? 'Заказчик' : 'И то и то'}
                </button>
              ))}
            </div>
          </div>

          {msg && (
            <div className="text-sm text-jade">{msg}</div>
          )}

          <Button type="submit" loading={saving} size="lg" className="self-start">
            Сохранить
          </Button>
        </form>
      </section>

      {categories && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Категории (just for context)</h2>
          <p className="text-mute text-sm mb-4">
            Управление специализациями — следующий релиз.
          </p>
          <div className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c.id}
                className="text-xs px-3 py-1.5 rounded-pill bg-ink-2 border border-line text-mute"
              >
                {c.name}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
