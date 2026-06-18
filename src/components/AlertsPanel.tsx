import type { Alerte } from '../types'

const borderByCriticite: Record<Alerte['criticite'], string> = {
  critique: 'border-l-rose-500 bg-rose-50',
  haute: 'border-l-orange-500 bg-orange-50',
  moyenne: 'border-l-amber-400 bg-amber-50',
}

const labelByCriticite: Record<Alerte['criticite'], string> = {
  critique: 'Critique',
  haute: 'Élevé',
  moyenne: 'Moyen',
}

export default function AlertsPanel({ alertes }: { alertes: Alerte[] }) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">Alertes</h2>
        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
          {alertes.length}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {alertes.map((a) => (
          <div key={a.id} className={`rounded-lg border-l-4 p-4 shadow-sm ${borderByCriticite[a.criticite]}`}>
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-slate-900">{a.titre}</p>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-slate-500">
                {labelByCriticite[a.criticite]}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{a.detail}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
