// Serveur Express minimal pour le développement local.
// Un seul rôle : exposer POST /api/chat, qui relaie la question vers Claude via
// le module partagé chat-core. La clé API reste côté serveur, jamais exposée.
// (En production, ce rôle est tenu par la fonction serverless api/chat.js.)

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { processChat, DEFAULT_MODEL } from './chat-core.js'

dotenv.config()

const PORT = process.env.PORT || 3001

const app = express()
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' })) // le contexte des 3 JSON tient largement

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
    keyConfigured: Boolean(process.env.ANTHROPIC_API_KEY),
  })
})

app.post('/api/chat', async (req, res) => {
  const { status, body } = await processChat(req.body ?? {})
  res.status(status).json(body)
})

app.listen(PORT, () => {
  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL
  console.log(`✅ Serveur API prêt sur http://localhost:${PORT} (modèle ${model})`)
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY non défini — le chat renverra une erreur tant que .env n\'est pas configuré.')
  }
})
