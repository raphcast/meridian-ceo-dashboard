import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import type { FinancialData } from '../types'
import { Card } from './ui'
import { euros, moisCourt } from '../lib/format'

export default function FinancialView({ financier }: { financier: FinancialData }) {
  const { chiffre_affaires: ca, impayés, factures_en_attente } = financier
  const objectif = ca.objectif_mensuel

  const data = ca.mensuel.map((m) => ({ mois: moisCourt(m.mois), montant: m.montant }))

  // Impayés triés par ancienneté décroissante (les plus vieux d'abord).
  const impayesTries = [...impayés].sort((a, b) => b.anciennete_jours - a.anciennete_jours)

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card title="Chiffre d'affaires — 12 mois" className="lg:col-span-2">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
            <XAxis dataKey="mois" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            />
            <Tooltip formatter={(v: number) => euros(v)} cursor={{ fill: '#f1f5f9' }} />
            <ReferenceLine
              y={objectif}
              stroke="#64748b"
              strokeDasharray="4 4"
              label={{ value: `Objectif ${euros(objectif)}`, position: 'insideTopRight', fontSize: 11, fill: '#64748b' }}
            />
            <Bar dataKey="montant" radius={[4, 4, 0, 0]}>
              {data.map((d, i) => (
                <Cell key={i} fill={d.montant >= objectif ? '#10b981' : '#f59e0b'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Factures en attente">
        <p className="text-3xl font-bold text-slate-900">{euros(factures_en_attente.total_montant)}</p>
        <p className="mt-1 text-sm text-slate-500">{factures_en_attente.nombre} factures</p>
        <p className="mt-4 text-sm text-slate-600">
          Échéance sous 30 j :{' '}
          <span className="font-semibold text-slate-900">{euros(factures_en_attente.echeance_prochaine_30j)}</span>
        </p>
      </Card>

      <Card title="Impayés (du plus ancien au plus récent)" className="lg:col-span-3">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Client</th>
                <th className="py-2 pr-4">Type</th>
                <th className="py-2 pr-4 text-right">Montant</th>
                <th className="py-2 pr-4 text-right">Ancienneté</th>
                <th className="py-2 text-right">Relances</th>
              </tr>
            </thead>
            <tbody>
              {impayesTries.map((i) => (
                <tr key={i.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4 font-mono text-xs text-slate-500">{i.id}</td>
                  <td className="py-2 pr-4 font-medium text-slate-800">{i.client}</td>
                  <td className="py-2 pr-4 text-slate-600">{i.type.replace(/_/g, ' ')}</td>
                  <td className="py-2 pr-4 text-right font-semibold text-slate-900">{euros(i.montant)}</td>
                  <td className="py-2 pr-4 text-right">
                    <span className={i.anciennete_jours > 60 ? 'font-bold text-rose-600' : 'text-slate-700'}>
                      {i.anciennete_jours} j
                    </span>
                  </td>
                  <td className="py-2 text-right text-slate-600">{i.relances_effectuees}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
