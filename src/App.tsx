import { useMemo, useState } from 'react'
import financierData from './data/financier.json'
import activiteData from './data/activite.json'
import biensData from './data/biens.json'
import type { FinancialData, ActivityData, PropertyData } from './types'
import { genererAlertes } from './lib/alerts'
import Dashboard from './components/Dashboard'
import FinancialView from './components/FinancialView'
import ActivityView from './components/ActivityView'
import PropertiesView from './components/PropertiesView'
import AlertsPanel from './components/AlertsPanel'
import ChatPanel from './components/ChatPanel'

// Les JSON sont importés statiquement (fichiers mock, pas de backend pour ça).
const financier = financierData as FinancialData
const activite = activiteData as ActivityData
const biens = biensData as PropertyData

type Tab = 'financier' | 'activite' | 'biens'

const TABS: { id: Tab; label: string }[] = [
  { id: 'financier', label: 'Financier' },
  { id: 'activite', label: 'Activité' },
  { id: 'biens', label: 'Biens' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('financier')

  // Alertes calculées une fois au chargement (données statiques).
  const alertes = useMemo(() => genererAlertes(financier, activite, biens), [])

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <h1 className="text-xl font-bold text-slate-900">{financier.meta.societe}</h1>
          <p className="text-sm text-slate-500">
            Dashboard CEO · période de référence {financier.meta.periode_reference}
          </p>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[1fr_360px]">
        {/* Colonne principale */}
        <main className="space-y-6">
          <Dashboard financier={financier} activite={activite} biens={biens} />

          <AlertsPanel alertes={alertes} />

          <nav className="flex flex-wrap gap-2 border-b border-slate-200">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
                  tab === t.id
                    ? 'border-slate-800 text-slate-900'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          {tab === 'financier' && <FinancialView financier={financier} />}
          {tab === 'activite' && <ActivityView activite={activite} />}
          {tab === 'biens' && <PropertiesView biens={biens} />}
        </main>

        {/* Colonne IA, collante sur grand écran */}
        <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <ChatPanel />
        </aside>
      </div>
    </div>
  )
}
