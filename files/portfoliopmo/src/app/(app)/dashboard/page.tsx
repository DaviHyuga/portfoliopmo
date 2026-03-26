// src/app/dashboard/page.tsx
import { getDashboardStats, getProjects } from '@/lib/projects'
import { KpiCard } from '@/components/ui/KpiCard'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BarChartProjects } from '@/components/charts/BarChartProjects'
import { FarolDistribution } from '@/components/charts/FarolDistribution'
import { InsightCard } from '@/components/ui/InsightCard'
import { FAROL_LABELS } from '@/types'
import Link from 'next/link'
import { ExportButtons } from '@/components/ui/ExportButtons'
import { Suspense } from 'react'
import { YearFilterUrl } from '@/components/ui/YearFilterUrl'

export const revalidate = 0 // sempre busca dados frescos

export default async function DashboardPage({ searchParams }: { searchParams: { ano?: string } }) {
  const currentYear = new Date().getFullYear()
  const selectedYear = Number(searchParams.ano) || currentYear
  const allProjects = await getProjects()
  const projects = allProjects.filter(p =>
    p.data_fim_prevista &&
    new Date(p.data_fim_prevista + 'T00:00:00').getFullYear() === selectedYear
  )

  const total = projects.length
  const mediaEvolucao = total > 0 ? Math.round(projects.reduce((a, p) => a + p.pct_evolucao, 0) / total) : 0
  const porFarol = { verde: 0, amarelo: 0, vermelho: 0, azul: 0 }
  const porNatureza = { backoffice: 0, regulatorio: 0, negocios: 0, regional: 0 }
  projects.forEach(p => { porFarol[p.farol]++; porNatureza[p.natureza as keyof typeof porNatureza]++ })
  const stats = {
    total, mediaEvolucao, porFarol, porNatureza,
    criticos: projects.filter(p => p.farol === 'vermelho'),
    emRisco: projects.filter(p => p.farol === 'amarelo'),
  }

  const insights = buildInsights(stats)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {stats.total > 0
              ? `${stats.total} projeto${stats.total > 1 ? 's' : ''} · Evolução média: ${stats.mediaEvolucao}% · ${stats.criticos.length} crítico${stats.criticos.length !== 1 ? 's' : ''}`
              : 'Nenhum projeto cadastrado ainda'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense>
            <YearFilterUrl defaultYear={currentYear} />
          </Suspense>
          <ExportButtons />
          <Link
            href="/projetos/novo"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors"
            style={{ background: 'var(--accent)' }}
          >
            + Novo Projeto
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard
          label="Evolução Média"
          value={stats.total > 0 ? `${stats.mediaEvolucao}%` : '–'}
          meta="do portfólio total"
          accent="accent"
          icon="◈"
        />
        <KpiCard
          label="Total de Projetos"
          value={stats.total}
          meta="no portfólio ativo"
          accent="gray"
          icon="✦"
        />
        <KpiCard
          label="Projetos no Prazo"
          value={stats.porFarol.verde}
          meta="farol verde"
          accent="green"
          icon="🟢"
        />
        <KpiCard
          label="Em Risco"
          value={stats.emRisco.length}
          meta="farol amarelo"
          accent="yellow"
          icon="⚡"
        />
        <KpiCard
          label="Críticos"
          value={stats.criticos.length}
          meta="farol vermelho"
          accent="red"
          icon="⚠"
        />
        <KpiCard
          label="Projetos Concluídos"
          value={stats.porFarol.azul}
          meta="farol azul"
          accent="blue"
          icon="🔵"
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-5 mb-5" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">Evolução por Projeto</span>
            <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
              {stats.total} projetos
            </span>
          </div>
          <div className="p-5">
            <BarChartProjects projects={projects} />
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">Status do Portfólio</span>
          </div>
          <div className="p-5">
            <FarolDistribution stats={stats} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Portfólio Consolidado</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {stats.total} projetos
          </span>
        </div>
        <div className="overflow-x-auto">
          {projects.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--text3)' }}>
              <div className="text-3xl mb-3 opacity-40">📋</div>
              <p className="text-sm">Nenhum projeto cadastrado ainda</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Projeto', 'Evolução', 'Farol', 'Natureza', 'Desvio', 'Benefícios'].map(h => (
                    <th key={h} className="text-left px-5 pb-3 pt-0 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{p.nome}</div>
                      {p.responsavel && (
                        <div className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{p.responsavel}</div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ProgressBar value={p.pct_evolucao} farol={p.farol} />
                    </td>
                    <td className="px-5 py-3">
                      <FarolBadge farol={p.farol} />
                    </td>
                    <td className="px-5 py-3">
                      <NaturezaBadge natureza={p.natureza} />
                    </td>
                    <td className="px-5 py-3">
                      {p.desvios.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {p.desvios.map(d => (
                            <span key={d} className="text-xs px-2 py-0.5 rounded border capitalize"
                              style={{ background: 'var(--bg3)', color: 'var(--text2)', borderColor: 'var(--border)' }}>
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>–</span>
                      )}
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      {p.beneficios ? (
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                          {p.beneficios.length > 80 ? p.beneficios.slice(0, 80) + '…' : p.beneficios}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>–</span>
                      )}
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
            {insights.map((ins, i) => (
              <InsightCard key={i} {...ins} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function buildInsights(stats: Awaited<ReturnType<typeof getDashboardStats>>) {
  const items = []

  if (stats.criticos.length > 0) {
    items.push({
      icon: '🚨', color: 'red' as const,
      title: 'Ação imediata necessária',
      desc: `${stats.criticos.length} projeto${stats.criticos.length > 1 ? 's' : ''} com farol vermelho. Convocar reuniões de crise e revisar cronograma.`,
    })
  }
  if (stats.emRisco.length > 0) {
    items.push({
      icon: '⚡', color: 'yellow' as const,
      title: 'Monitoramento intensificado',
      desc: `${stats.emRisco.length} projeto${stats.emRisco.length > 1 ? 's precisam' : ' precisa'} de atenção preventiva antes de se tornarem críticos.`,
    })
  }
  if (stats.mediaEvolucao < 40 && stats.total > 0) {
    items.push({
      icon: '📈', color: 'yellow' as const,
      title: 'Evolução abaixo do esperado',
      desc: `Média de ${stats.mediaEvolucao}% sugere revisão de recursos e priorização do portfólio.`,
    })
  }
  if (stats.porFarol.azul > 0) {
    items.push({
      icon: '✅', color: 'blue' as const,
      title: 'Projetos entregues',
      desc: `${stats.porFarol.azul} projeto${stats.porFarol.azul > 1 ? 's foram' : ' foi'} concluído${stats.porFarol.azul > 1 ? 's' : ''}. Documentar lições aprendidas.`,
    })
  }

  return items
}
