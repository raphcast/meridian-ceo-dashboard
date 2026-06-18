// Types décrivant la structure des 3 fichiers JSON mock.
// Volontairement simples : on ne type que ce qui est consommé par l'UI.

// ---------- financier.json ----------
export interface FinancialData {
  meta: { societe: string; devise: string; periode_reference: string }
  chiffre_affaires: {
    mensuel: { mois: string; montant: number }[]
    objectif_mensuel: number
  }
  tresorerie: {
    solde_courant: number
    solde_il_y_a_30j: number
    solde_il_y_a_90j: number
    alertes_seuil_bas: number
  }
  impayés: Impaye[]
  factures_en_attente: { total_montant: number; nombre: number; echeance_prochaine_30j: number }
}

export interface Impaye {
  id: string
  client: string
  montant: number
  echeance: string
  anciennete_jours: number
  type: string
  relances_effectuees: number
}

// ---------- activite.json ----------
export interface ActivityData {
  meta: { periode: string; date_export: string }
  activite_appels: {
    total_appels: number
    appels_entrants: number
    appels_sortants: number
    duree_moyenne_minutes: number
    appels_sans_suite: number
    par_agent: Agent[]
  }
  pipeline_commercial: {
    total_prospects_actifs: number
    par_etape: { etape: string; nombre: number; valeur_estimee: number }[]
    valeur_totale_pipeline: number
    taux_conversion_visite_offre: number
  }
  relances_en_retard: Relance[]
  avis_google: {
    note_actuelle: number
    objectif: number
    avis_ce_mois: number
    avis_en_attente_reponse: number
    dernier_avis_negatif: { date: string; note: number; extrait: string }
  }
}

export interface Agent {
  nom: string
  pole: string
  appels: number
  rdv_generes: number
}

export type Priorite = 'critique' | 'haute' | 'moyenne'

export interface Relance {
  id: string
  prospect: string
  interet: string
  derniere_interaction: string
  jours_sans_contact: number
  agent_responsable: string
  priorite: Priorite
}

// ---------- biens.json ----------
export type StatutBien = 'occupé' | 'vacant' | 'en_travaux' | 'en_vente'

export interface PropertyData {
  meta: { total_biens: number; date_export: string; poles: string[] }
  resume: {
    biens_occupes: number
    biens_vacants: number
    biens_en_travaux: number
    biens_en_vente: number
    taux_occupation: number
    objectif_taux_occupation: number
    loyer_total_mensuel_theorique: number
    loyer_total_mensuel_encaisse: number
  }
  portefeuille: Bien[]
  alertes_patrimoine: { type: string; biens_concernes: string[]; message: string }[]
}

export interface Bien {
  id: string
  type: string
  adresse: string
  surface_m2: number
  loyer_mensuel: number
  statut: StatutBien
  locataire?: string | null
  fin_bail?: string | null
  rendement_brut?: number | null
  vacance_jours?: number
  alerte?: string
  prix_vente?: number
}

// ---------- Alertes générées côté client ----------
export type Criticite = 'critique' | 'haute' | 'moyenne'

export interface Alerte {
  id: string
  criticite: Criticite
  titre: string
  detail: string
}
