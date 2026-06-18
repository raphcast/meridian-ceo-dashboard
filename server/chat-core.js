// Logique métier du chat, indépendante du framework HTTP.
// Réutilisée par le serveur Express local (server/index.js) ET par la
// fonction serverless Vercel (api/chat.js), pour éviter toute duplication.
//
// Le contexte des 3 sources de données est fourni par le client à chaque
// requête, ce qui rend ce module portable (aucun accès disque nécessaire).

import Anthropic from '@anthropic-ai/sdk'

// Modèle imposé par le brief. Surchargeable via ANTHROPIC_MODEL si la clé
// utilisée n'y a pas accès (ex. clé donnant accès à claude-sonnet-4-6).
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514'

function section(label, data) {
  return `=== ${label} ===\n${data ? JSON.stringify(data, null, 2) : '(données non fournies)'}`
}

export function buildSystemPrompt(context = {}) {
  const { financier, activite, biens } = context && typeof context === 'object' ? context : {}

  return `Tu es l'assistant data du CEO du Groupe Meridian Immobilier, une agence immobilière.

Ton rôle : répondre de façon précise et synthétique aux questions du dirigeant à partir des données fournies ci-dessous (finances, activité commerciale, portefeuille de biens).

Règles strictes :
- Cite toujours les chiffres EXACTS présents dans les données (montants, dates, pourcentages, identifiants comme IMP-003 ou BIEN-002).
- N'invente JAMAIS un chiffre ou un fait absent des données. Si l'information n'est pas disponible, dis-le clairement.
- Réponds en français, de manière concise et orientée décision (un CEO veut des constats et des priorités, pas des paragraphes).
- Utilise des listes à puces et du gras (markdown) quand cela aide à la lecture. Évite les tableaux markdown (rendu limité côté interface) : préfère les listes à puces.
- Les montants sont en euros (€).

${section('DONNÉES FINANCIÈRES (financier.json)', financier)}

${section('DONNÉES ACTIVITÉ COMMERCIALE (activite.json)', activite)}

${section('DONNÉES PORTEFEUILLE DE BIENS (biens.json)', biens)}`
}

// Traite une requête de chat. Retourne { status, body } pour que l'appelant
// (Express ou Vercel) n'ait plus qu'à le sérialiser.
export async function processChat({ message, context } = {}) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL

  if (!apiKey) {
    return {
      status: 500,
      body: { error: 'Clé API manquante. Configurez ANTHROPIC_API_KEY (voir .env.example).' },
    }
  }
  if (!message || typeof message !== 'string') {
    return { status: 400, body: { error: 'Le champ "message" est requis.' } }
  }

  try {
    const client = new Anthropic({ apiKey })
    const response = await client.messages.create({
      model,
      max_tokens: 1024,
      system: buildSystemPrompt(context),
      messages: [{ role: 'user', content: message }],
    })

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n')

    return { status: 200, body: { reply: text } }
  } catch (err) {
    console.error('Erreur API Anthropic :', err?.message || err)
    return {
      status: 502,
      body: { error: "Impossible de contacter l'API Anthropic. Vérifiez la clé API et votre connexion réseau." },
    }
  }
}
