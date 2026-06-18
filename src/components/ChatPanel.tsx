import { useState, useRef, useEffect } from 'react'
import { askClaude } from '../lib/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Quels sont mes impayés critiques ?',
  'Quel bien sous-performe ?',
  'Comment se porte mon pipeline ce mois ?',
]

// Rendu markdown minimal : gère titres (#), **gras**, listes à puces et sauts
// de ligne. Suffisant pour les réponses de Claude, sans dépendance externe.
function inline(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
}

function renderMarkdown(text: string) {
  const lines = text.split('\n')
  return lines.map((line, i) => {
    const heading = line.match(/^(#{1,3})\s+(.*)$/)
    if (heading) {
      return (
        <p key={i} className="mt-2 font-semibold text-slate-900" dangerouslySetInnerHTML={{ __html: inline(heading[2]) }} />
      )
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/)
    if (bullet) {
      return <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: inline(bullet[1]) }} />
    }

    // On ignore les lignes de séparation horizontale (--- et |---|).
    if (/^\s*(-{3,}|\|[-|\s]+\|)\s*$/.test(line)) return null
    if (line.trim() === '') return <div key={i} className="h-2" />
    return <p key={i} dangerouslySetInnerHTML={{ __html: inline(line) }} />
  })
}

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function send(question: string) {
    const text = question.trim()
    if (!text || loading) return

    setError(null)
    setMessages((m) => [...m, { role: 'user', content: text }])
    setInput('')
    setLoading(true)

    try {
      const reply = await askClaude(text)
      setMessages((m) => [...m, { role: 'assistant', content: reply }])
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="font-semibold text-slate-900">Assistant data IA</h2>
        <p className="text-xs text-slate-500">Posez vos questions sur les finances, l'activité et les biens.</p>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Exemples de questions :</p>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-sm text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div
              className={
                m.role === 'user'
                  ? 'max-w-[85%] rounded-2xl rounded-br-sm bg-slate-800 px-4 py-2 text-sm text-white'
                  : 'max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 text-sm text-slate-800'
              }
            >
              {m.role === 'assistant' ? (
                <div className="space-y-0.5">{renderMarkdown(m.content)}</div>
              ) : (
                m.content
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
            Claude analyse vos données…
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">{error}</div>
        )}

        <div ref={endRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send(input)
        }}
        className="flex gap-2 border-t border-slate-200 p-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Votre question…"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900 disabled:opacity-40"
        >
          Envoyer
        </button>
      </form>
    </div>
  )
}
