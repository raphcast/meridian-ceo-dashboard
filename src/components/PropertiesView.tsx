import type { PropertyData, StatutBien } from '../types'
import { Card, Badge } from './ui'
import { euros, pct } from '../lib/format'

const statutStyles: Record<StatutBien, string> = {
  occupé: 'bg-emerald-100 text-emerald-800 ring-emerald-300',
  vacant: 'bg-rose-100 text-rose-800 ring-rose-300',
  en_travaux: 'bg-amber-100 text-amber-800 ring-amber-300',
  en_vente: 'bg-sky-100 text-sky-800 ring-sky-300',
}

const statutLabel: Record<StatutBien, string> = {
  occupé: 'Occupé',
  vacant: 'Vacant',
  en_travaux: 'Travaux',
  en_vente: 'En vente',
}

export default function PropertiesView({ biens }: { biens: PropertyData }) {
  const { resume, portefeuille, alertes_patrimoine } = biens

  return (
    <div className="grid gap-4">
      <Card title="Alertes patrimoine">
        <div className="grid gap-3 md:grid-cols-3">
          {alertes_patrimoine.map((a) => (
            <div key={a.type} className="rounded-lg bg-amber-50 p-3 ring-1 ring-amber-200">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                {a.type.replace(/_/g, ' ')}
              </p>
              <p className="mt-1 text-sm text-slate-700">{a.message}</p>
              <p className="mt-2 text-xs text-slate-500">{a.biens_concernes.join(', ')}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title={`Portefeuille — ${resume.biens_occupes} occupés · ${resume.biens_vacants} vacants · ${resume.biens_en_travaux} travaux · ${resume.biens_en_vente} en vente (occupation ${pct(resume.taux_occupation)})`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4">Adresse</th>
                <th className="py-2 pr-4">Statut</th>
                <th className="py-2 pr-4 text-right">Loyer</th>
                <th className="py-2 text-right">Rendement</th>
              </tr>
            </thead>
            <tbody>
              {portefeuille.map((b) => (
                <tr key={b.id} className="border-b border-slate-100 align-top">
                  <td className="py-2 pr-4 font-mono text-xs text-slate-500">{b.id}</td>
                  <td className="py-2 pr-4 font-medium text-slate-800">{b.type}</td>
                  <td className="py-2 pr-4 text-slate-600">
                    {b.adresse}
                    {b.alerte && <span className="mt-1 block text-xs font-medium text-rose-600">⚠ {b.alerte}</span>}
                  </td>
                  <td className="py-2 pr-4">
                    <Badge className={statutStyles[b.statut]}>{statutLabel[b.statut]}</Badge>
                    {b.statut === 'vacant' && b.vacance_jours != null && (
                      <span className="mt-1 block text-xs text-slate-500">{b.vacance_jours} j</span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-right text-slate-700">{euros(b.loyer_mensuel)}</td>
                  <td className="py-2 text-right text-slate-700">
                    {b.rendement_brut != null ? pct(b.rendement_brut) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {portefeuille.length} biens détaillés sur {biens.meta.total_biens} au total · loyers encaissés{' '}
          {euros(resume.loyer_total_mensuel_encaisse)} / {euros(resume.loyer_total_mensuel_theorique)} théoriques
        </p>
      </Card>
    </div>
  )
}
