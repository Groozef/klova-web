'use client';

import { useTaxRecords, useTaxSummary } from '@/lib/api/hooks';

export default function TaxPage() {
  const { data: records } = useTaxRecords();
  const { data: summary } = useTaxSummary();

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col gap-8">
      <h1 className="text-3xl font-bold tracking-tight">Налоги</h1>

      {summary && summary.count > 0 && (
        <section className="p-6 rounded-lg border border-cobalt/40 bg-cobalt-soft">
          <div className="text-sm text-mute uppercase tracking-wider mb-2">Сводка за всё время</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-xs text-mute">Доход</div>
              <div className="text-2xl font-mono font-bold text-paper">
                {summary.income_total.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div>
              <div className="text-xs text-mute">К отложить</div>
              <div className="text-2xl font-mono font-bold text-cobalt">
                {summary.recommended_aside_total.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div>
              <div className="text-xs text-mute">ИПН</div>
              <div className="text-lg font-mono text-paper">
                {summary.tax_total.toLocaleString('ru-RU')} ₸
              </div>
            </div>
            <div>
              <div className="text-xs text-mute">ОСМС + ОПВ</div>
              <div className="text-lg font-mono text-paper">
                {(summary.osms_total + summary.opv_total).toLocaleString('ru-RU')} ₸
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-4">История начислений</h2>
        {(!records || records.length === 0) && (
          <div className="p-8 rounded-lg border border-line bg-ink-2 text-center text-mute">
            Пока нет завершённых сделок.
          </div>
        )}
        <div className="flex flex-col divide-y divide-line border border-line rounded-lg bg-ink-2 overflow-hidden">
          {records?.map((r) => (
            <div key={r.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <div className="font-medium">{r.deal?.order?.title ?? 'Сделка'}</div>
                <div className="text-xs text-mute font-mono mt-0.5">
                  {new Date(r.calculated_at).toLocaleDateString('ru-RU')} · {r.applied_status}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-paper">
                  {Number(r.income).toLocaleString('ru-RU')} ₸
                </div>
                <div className="text-xs text-cobalt font-mono">
                  отложи {Number(r.recommended_aside).toLocaleString('ru-RU')} ₸
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
