// Client minimal pour le module IA. On envoie au serveur Express la question
// ET le contexte complet des 3 sources de données (comme demandé au brief).
// Le serveur se charge d'appeler l'API Anthropic ; la clé n'est jamais exposée.

import financier from '../data/financier.json'
import activite from '../data/activite.json'
import biens from '../data/biens.json'

const context = { financier, activite, biens }

export async function askClaude(message: string): Promise<string> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || `Erreur serveur (${res.status})`)
  }
  return data.reply as string
}
