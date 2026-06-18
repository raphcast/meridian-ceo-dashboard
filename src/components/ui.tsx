// Petits composants de présentation réutilisés dans les vues.
import type { ReactNode } from 'react'
import type { Criticite } from '../types'

export function Card({ title, children, className = '' }: { title?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 ${className}`}>
      {title && <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h3>}
      {children}
    </section>
  )
}

// Carte KPI : valeur principale + comparaison/tendance optionnelle.
export function KpiCard({
  label,
  value,
  hint,
  tone = 'neutral',
}: {
  label: string
  value: string
  hint?: string
  tone?: 'good' | 'bad' | 'neutral'
}) {
  const toneClass =
    tone === 'good' ? 'text-emerald-600' : tone === 'bad' ? 'text-rose-600' : 'text-slate-500'
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {hint && <p className={`mt-1 text-sm font-medium ${toneClass}`}>{hint}</p>}
    </div>
  )
}

// Couleurs partagées entre alertes et badges de priorité.
export const criticiteStyles: Record<Criticite, string> = {
  critique: 'bg-rose-100 text-rose-800 ring-rose-300',
  haute: 'bg-orange-100 text-orange-800 ring-orange-300',
  moyenne: 'bg-amber-100 text-amber-800 ring-amber-300',
}

export function Badge({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${className}`}>
      {children}
    </span>
  )
}
