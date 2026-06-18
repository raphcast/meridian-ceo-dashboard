import type { FinancialData, ActivityData, PropertyData } from '../types'
import { KpiCard } from './ui'
import { euros, pct } from '../lib/format'

export default function Dashboard({
  financier,
  activite,
  biens,
}: {
  financier: FinancialData
  activite: ActivityData
  biens: PropertyData
}) {
  // CA du mois courant = dernière entrée du tableau mensuel.
  const ca = financier.chiffre_affaires
  const caMois = ca.mensuel[ca.mensuel.length - 1]
  const ecartCa = caMois.montant - ca.objectif_mensuel

  // Trésorerie : tendance sur 30 jours.
  const { solde_courant, solde_il_y_a_30j } = financier.tresorerie
  const deltaTreso = solde_courant - solde_il_y_a_30j

  // Occupation.
  const { taux_occupation, objectif_taux_occupation } = biens.resume

  // Total des impayés en cours.
  const totalImpayes = financier.impayés.reduce((s, i) => s + i.montant, 0)

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <KpiCard
        label={`CA du mois (${caMois.mois})`}
        value={euros(caMois.montant)}
        hint={`${ecartCa >= 0 ? '▲' : '▼'} ${euros(Math.abs(ecartCa))} vs objectif ${euros(ca.objectif_mensuel)}`}
        tone={ecartCa >= 0 ? 'good' : 'bad'}
      />
      <KpiCard
        label="Trésorerie"
        value={euros(solde_courant)}
        hint={`${deltaTreso >= 0 ? '▲' : '▼'} ${euros(Math.abs(deltaTreso))} sur 30 j`}
        tone={deltaTreso >= 0 ? 'good' : 'bad'}
      />
      <KpiCard
        label="Taux d'occupation"
        value={pct(taux_occupation)}
        hint={`Objectif ${pct(objectif_taux_occupation)}`}
        tone={taux_occupation >= objectif_taux_occupation ? 'good' : 'bad'}
      />
      <KpiCard
        label="Pipeline commercial actif"
        value={euros(activite.pipeline_commercial.valeur_totale_pipeline)}
        hint={`${activite.pipeline_commercial.total_prospects_actifs} prospects actifs`}
      />
      <KpiCard
        label="Impayés en cours"
        value={euros(totalImpayes)}
        hint={`${financier.impayés.length} dossiers`}
        tone="bad"
      />
    </div>
  )
}
