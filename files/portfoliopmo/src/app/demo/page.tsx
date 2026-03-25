'use client'
// src/app/demo/page.tsx — Dashboard demo (dados do contexto)

import Link from 'next/link'
import { useDemoContext } from './context'
import { KpiCard } from '@/components/ui/KpiCard'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BarChartProjects } from '@/components/charts/BarChartProjects'
import { FarolDistribution } from '@/components/charts/FarolDistribution'
import { QuartersChart } from '@/components/charts/QuartersChart'
import { InsightCard } from '@/components/ui/InsightCard'
import type { Farol, Natureza } from '@/types'

export default function DemoDashboardPage() {
  const { projects } = useDemoContext()

  const total = projects.length
  const mediaEvolucao = total > 0 ? Math.round(projects.reduce((a, p) => a + p.pct_evolucao, 0) / total) : 0
  const porFarol = { verde: 0, amarelo: 0, vermelho: 0, azul: 0 } as Record<Farol, number>
  const porNatureza = { backoffice: 0, regulatorio: 0, negocios: 0, regional: 0 } as Record<Natureza, number>
  projects.forEach(p => { porFarol[p.farol]++; porNatureza[p.natureza]++ })
  const criticos = projects.filter(p => p.farol === 'vermelho')
  const emRisco = projects.filter(p => p.farol === 'amarelo')

  const stats = { total, mediaEvolucao, porFarol, porNatureza, criticos, emRisco }

  const insights = []
  if (criticos.length > 0) insights.push({ icon: '🚨', color: 'red' as const, title: 'Ação imediata necessária', desc: `${criticos.length} projeto${criticos.length > 1 ? 's' : ''} com farol vermelho. Convocar reuniões de crise.` })
  if (emRisco.length > 0) insights.push({ icon: '⚡', color: 'yellow' as const, title: 'Monitoramento intensificado', desc: `${emRisco.length} projeto${emRisco.length > 1 ? 's precisam' : ' precisa'} de atenção preventiva.` })
  if (porFarol.azul > 0) insights.push({ icon: '✅', color: 'blue' as const, title: 'Projetos entregues', desc: `${porFarol.azul} projeto${porFarol.azul > 1 ? 's foram' : ' foi'} concluído${porFarol.azul > 1 ? 's' : ''}. Documentar lições aprendidas.` })
  if (mediaEvolucao < 40 && total > 0) insights.push({ icon: '📈', color: 'yellow' as const, title: 'Evolução abaixo do esperado', desc: `Média de ${mediaEvolucao}% sugere revisão de recursos e priorização.` })

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {total > 0
              ? `${total} projeto${total > 1 ? 's' : ''} · Evolução média: ${mediaEvolucao}% · ${criticos.length} crítico${criticos.length !== 1 ? 's' : ''}`
              : 'Nenhum projeto cadastrado ainda'}
          </p>
        </div>
        <Link href="/demo/projetos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
          style={{ background: 'var(--accent)' }}>
          + Novo Projeto
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Evolução Média" value={total > 0 ? `${mediaEvolucao}%` : '–'} meta="do portfólio total" accent="accent" icon="◈" />
        <KpiCard label="Total de Projetos" value={total} meta="no portfólio ativo" accent="gray" icon="✦" />
        <KpiCard label="Projetos no Prazo" value={porFarol.verde} meta="farol verde" accent="green" icon="🟢" />
        <KpiCard label="Em Risco" value={emRisco.length} meta="farol amarelo" accent="yellow" icon="⚡" />
        <KpiCard label="Críticos" value={criticos.length} meta="farol vermelho" accent="red" icon="⚠" />
        <KpiCard label="Projetos Concluídos" value={porFarol.azul} meta="farol azul" accent="blue" icon="🔵" />
      </div>

      {/* Quarters */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Distribuição por Trimestre</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {projects.filter(p => p.data_fim_prevista).length} com prazo definido
          </span>
        </div>
        <div className="px-5 py-4"><QuartersChart projects={projects} /></div>
      </div>

      {/* Charts */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">Evolução por Projeto</span>
            <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{total} projetos</span>
          </div>
          <div className="p-5"><BarChartProjects projects={projects} /></div>
        </div>
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">Status do Portfólio</span>
          </div>
          <div className="p-5"><FarolDistribution stats={stats} /></div>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Portfólio Consolidado</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{total} projetos</span>
        </div>
        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text3)' }}>
              <div className="text-3xl mb-3 opacity-40">📋</div>
              <p className="text-sm">Nenhum projeto cadastrado ainda</p>
              <Link href="/demo/projetos/novo" className="inline-block mt-3 text-sm underline" style={{ color: 'var(--accent2)' }}>Criar primeiro projeto</Link>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Projeto', 'Evolução', 'Farol', 'Natureza', 'Desvio', 'Benefícios'].map(h => (
                    <th key={h} className="text-left px-5 pb-3 pt-0 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{p.nome}</div>
                      {p.responsavel && <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{p.responsavel}</div>}
                    </td>
                    <td className="px-5 py-3"><ProgressBar value={p.pct_evolucao} farol={p.farol} /></td>
                    <td className="px-5 py-3"><FarolBadge farol={p.farol} /></td>
                    <td className="px-5 py-3"><NaturezaBadge natureza={p.natureza} /></td>
                    <td className="px-5 py-3">
                      {p.desvios.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {p.desvios.map(d => (
                            <span key={d} className="text-xs px-2 py-0.5 rounded border capitalize"
                              style={{ background: 'var(--bg3)', color: 'var(--text2)', borderColor: 'var(--border)' }}>{d}</span>
                          ))}
                        </div>
                      ) : <span style={{ color: 'var(--text3)', fontSize: '12px' }}>–</span>}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      {p.beneficios
                        ? <span className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>{p.beneficios.length > 80 ? p.beneficios.slice(0, 80) + '…' : p.beneficios}</span>
                        : <span style={{ color: 'var(--text3)', fontSize: '12px' }}>–</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">💡 Insights Automáticos</span>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {insights.map((ins, i) => <InsightCard key={i} {...ins} />)}
          </div>
        </div>
      )}
    </div>
  )
}
