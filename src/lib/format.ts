// Petits utilitaires de formatage partagés par les vues.

export const euros = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)

export const pct = (ratio: number, digits = 1) =>
  `${(ratio * 100).toFixed(digits)} %`

// "2026-06" -> "juin 26" pour les libellés de graphique.
export const moisCourt = (mois: string) => {
  const [annee, m] = mois.split('-')
  const noms = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${noms[Number(m) - 1]} ${annee.slice(2)}`
}
