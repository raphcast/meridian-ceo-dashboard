// Génération des alertes côté client à partir des données.
// Logique simple et déterministe (aucun appel IA nécessaire) : on parcourt
// les 3 sources et on remonte les situations qui méritent l'attention du CEO.

import type { FinancialData, ActivityData, PropertyData, Alerte } from '../types'
import { euros, pct } from './format'

const SEUIL_IMPAYE_CRITIQUE_JOURS = 60

export function genererAlertes(
  financier: FinancialData,
  activite: ActivityData,
  biens: PropertyData,
): Alerte[] {
  const alertes: Alerte[] = []

  // 1. Impayés anciens (> 60 jours) — un par impayé concerné, trié plus bas.
  for (const imp of financier.impayés) {
    if (imp.anciennete_jours > SEUIL_IMPAYE_CRITIQUE_JOURS) {
      alertes.push({
        id: `impaye-${imp.id}`,
        criticite: 'critique',
        titre: `Impayé critique — ${imp.id} (${imp.anciennete_jours} j)`,
        detail: `${imp.client} : ${euros(imp.montant)} en souffrance depuis ${imp.anciennete_jours} jours (${imp.relances_effectuees} relances).`,
      })
    }
  }

  // 2. Taux d'occupation sous l'objectif.
  const { taux_occupation, objectif_taux_occupation } = biens.resume
  if (taux_occupation < objectif_taux_occupation) {
    alertes.push({
      id: 'occupation',
      criticite: 'haute',
      titre: `Taux d'occupation sous l'objectif`,
      detail: `${pct(taux_occupation)} contre un objectif de ${pct(objectif_taux_occupation)} — ${biens.resume.biens_vacants} biens vacants.`,
    })
  }

  // 3. Baux commerciaux expirant sans renouvellement confirmé.
  for (const bien of biens.portefeuille) {
    if (bien.alerte && /bail/i.test(bien.alerte)) {
      alertes.push({
        id: `bail-${bien.id}`,
        criticite: 'haute',
        titre: `Bail à risque — ${bien.id}`,
        detail: `${bien.type}, ${bien.adresse}. ${bien.alerte}.`,
      })
    }
  }

  // 4. Relances prioritaires critiques en retard.
  for (const rel of activite.relances_en_retard) {
    if (rel.priorite === 'critique') {
      alertes.push({
        id: `relance-${rel.id}`,
        criticite: 'critique',
        titre: `Relance critique en retard — ${rel.id}`,
        detail: `${rel.prospect} (${rel.interet}) : ${rel.jours_sans_contact} jours sans contact, suivi par ${rel.agent_responsable}.`,
      })
    }
  }

  // 5. Trésorerie en baisse marquée sur 30 jours (information de fond).
  const { solde_courant, solde_il_y_a_30j } = financier.tresorerie
  if (solde_courant < solde_il_y_a_30j) {
    const delta = solde_il_y_a_30j - solde_courant
    alertes.push({
      id: 'tresorerie',
      criticite: 'moyenne',
      titre: `Trésorerie en baisse sur 30 jours`,
      detail: `${euros(solde_courant)} aujourd'hui contre ${euros(solde_il_y_a_30j)} il y a 30 jours (${euros(delta)} de moins).`,
    })
  }

  // Tri par criticité décroissante pour afficher le plus urgent en premier.
  const rang = { critique: 0, haute: 1, moyenne: 2 }
  return alertes.sort((a, b) => rang[a.criticite] - rang[b.criticite])
}
