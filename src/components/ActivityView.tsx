import type { ActivityData, Priorite } from '../types'
import { Card, Badge, criticiteStyles } from './ui'
import { euros } from '../lib/format'

const ordrePriorite: Record<Priorite, number> = { critique: 0, haute: 1, moyenne: 2 }

export default function ActivityView({ activite }: { activite: ActivityData }) {
  const { activite_appels, pipeline_commercial, relances_en_retard, avis_google } = activite

  // Relances triées par priorité (critique > haute > moyenne), puis par retard.
  const relancesTriees = [...relances_en_retard].sort(
    (a, b) => ordrePriorite[a.priorite] - ordrePriorite[b.priorite] || b.jours_sans_contact - a.jours_sans_contact,
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Performance des agents (30 j)">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
              <th className="py-2 pr-4">Agent</th>
              <th className="py-2 pr-4">Pôle</th>
              <th className="py-2 pr-4 text-right">Appels</th>
              <th className="py-2 text-right">RDV générés</th>
            </tr>
          </thead>
          <tbody>
            {activite_appels.par_agent.map((a) => (
              <tr key={a.nom} className="border-b border-slate-100">
                <td className="py-2 pr-4 font-medium text-slate-800">{a.nom}</td>
                <td className="py-2 pr-4 text-slate-600">{a.pole}</td>
                <td className="py-2 pr-4 text-right text-slate-700">{a.appels}</td>
                <td className="py-2 text-right font-semibold text-slate-900">{a.rdv_generes}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-xs text-slate-500">
          {activite_appels.total_appels} appels au total · {activite_appels.appels_sans_suite} sans suite · durée moy.{' '}
          {activite_appels.duree_moyenne_minutes} min
        </p>
      </Card>

      <Card title="Avis Google">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{avis_google.note_actuelle}</span>
          <span className="text-slate-500">/ 5 — objectif {avis_google.objectif}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          {avis_google.avis_ce_mois} avis ce mois · {avis_google.avis_en_attente_reponse} en attente de réponse
        </p>
        <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm">
          <p className="font-semibold text-rose-800">
            Dernier avis négatif ({avis_google.dernier_avis_negatif.note}/5 — {avis_google.dernier_avis_negatif.date})
          </p>
          <p className="mt-1 text-rose-700">« {avis_google.dernier_avis_negatif.extrait} »</p>
        </div>
      </Card>

      <Card title="Pipeline commercial" className="lg:col-span-2">
        <div className="mb-4 flex flex-wrap items-baseline gap-x-2">
          <span className="text-2xl font-bold text-slate-900">
            {euros(pipeline_commercial.valeur_totale_pipeline)}
          </span>
          <span className="text-sm text-slate-500">
            · {pipeline_commercial.total_prospects_actifs} prospects · conversion visite→offre{' '}
            {(pipeline_commercial.taux_conversion_visite_offre * 100).toFixed(0)} %
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-5">
          {pipeline_commercial.par_etape.map((e) => (
            <div key={e.etape} className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-xs text-slate-500">{e.etape}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{e.nombre}</p>
              {e.valeur_estimee > 0 && <p className="mt-0.5 text-xs text-slate-500">{euros(e.valeur_estimee)}</p>}
            </div>
          ))}
        </div>
      </Card>

      <Card title="Relances en retard (par priorité)" className="lg:col-span-2">
        <div className="space-y-2">
          {relancesTriees.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 p-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Badge className={criticiteStyles[r.priorite]}>{r.priorite}</Badge>
                  <span className="font-medium text-slate-800">{r.prospect}</span>
                </div>
                <p className="mt-0.5 truncate text-sm text-slate-500">
                  {r.interet} · {r.agent_responsable}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-700">{r.jours_sans_contact} j</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
