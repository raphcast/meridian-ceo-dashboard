// Fonction serverless Vercel — équivalent de la route Express en production.
// Vercel expose automatiquement ce fichier à l'URL /api/chat.
// La clé API est lue depuis les variables d'environnement du projet Vercel.

import { processChat } from '../server/chat-core.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée.' })
  }

  // Vercel parse déjà le corps JSON dans req.body pour les fonctions Node.
  const { status, body } = await processChat(req.body ?? {})
  res.status(status).json(body)
}
