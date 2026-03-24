// src/app/insights/page.tsx
import { getDashboardStats, getProjects } from '@/lib/projects'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { NATUREZA_LABELS } from '@/types'

export const revalidate = 0

export default async function InsightsPage() {
  const [stats, projects] = await Promise.all([getDashboardStats(), getProjects()])
  const concluidos = projects.filter(p => p.farol === 'azul')
  const verdes = projects.filter(p => p.farol === 'verde')

  const top3 = [...stats.criticos, ...stats.emRisco]
    .sort((a, b) => a.pct_evolucao - b.pct_evolucao)
    .slice(0, 3)

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Insights Executivos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Análise automática do portfólio
        </p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Críticos */}
        <InsightSection title="🔴 Projetos Críticos" count={stats.criticos.length}>
          {stats.criticos.length === 0 ? (
            <EmptyCheck text="Nenhum projeto crítico — ótimo!" />
          ) : stats.criticos.map(p => (
            <ProjectInsightItem key={p.id} project={p} />
          ))}
        </InsightSection>

        {/* Em Risco */}
        <InsightSection title="🟡 Em Risco" count={stats.emRisco.length}>
          {stats.emRisco.length === 0 ? (
            <EmptyCheck text="Nenhum projeto em risco" />
          ) : stats.emRisco.map(p => (
            <ProjectInsightItem key={p.id} project={p} />
          ))}
        </InsightSection>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Top 3 */}
        <InsightSection title="🏆 Top 3 Mais Críticos">
          {top3.length === 0 ? (
            <EmptyCheck text="Nenhum projeto crítico ou em risco" />
          ) : top3.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
              <span className="text-xl font-bold font-mono w-6 text-center"
                style={{ color: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : 'var(--text3)' }}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.nome}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>{p.pct_evolucao}%</span>
                  <FarolBadge farol={p.farol} />
                </div>
              </div>
            </div>
          ))}
        </InsightSection>

        {/* Resumo */}
        <InsightSection title="📊 Resumo do Portfólio">
          {stats.total === 0 ? (
            <EmptyCheck text="Adicione projetos para ver o resumo" />
          ) : (
            <div className="space-y-3">
              <StatRow icon="◈" label="Evolução média" value={`${stats.mediaEvolucao}%`} />
              <StatRow icon="✅" label="Concluídos" value={`${concluidos.length} projeto${concluidos.length !== 1 ? 's' : ''}`} />
              <StatRow icon="🟢" label="No prazo" value={`${verdes.length} projeto${verdes.length !== 1 ? 's' : ''}`} />
              <StatRow icon="📦" label="Total" value={`${stats.total} projeto${stats.total !== 1 ? 's' : ''}`} />
              {(Object.entries(stats.porNatureza) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                <StatRow key={k} icon="📂" label={NATUREZA_LABELS[k as keyof typeof NATUREZA_LABELS]} value={`${v}`} />
              ))}
            </div>
          )}
        </InsightSection>
      </div>

      {/* Recomendações */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">💡 Recomendações Automáticas</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {buildRecommendations(stats, concluidos.length).map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{ background: r.bgColor }}>
                {r.icon}
              </div>
              <div>
                <p className="text-sm font-medium">{r.title}</p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text2)' }}>{r.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function InsightSection({ title, count, children }: {
  title: string; count?: number; children: React.ReactNode
}) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-medium">{title}</span>
        {count !== undefined && (
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{count}</span>
        )}
      </div>
      <div className="p-4 space-y-2">{children}</div>
    </div>
  )
}

function ProjectInsightItem({ project }: { project: import('@/types').Project }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border"
      style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
      <FarolBadge farol={project.farol} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{project.nome}</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--text2)' }}>
          {project.pct_evolucao}% concluído
          {project.desvios.length > 0 && ` · Desvios: ${project.desvios.join(', ')}`}
        </p>
      </div>
    </div>
  )
}

function EmptyCheck({ text }: { text: string }) {
  return (
    <div className="text-center py-6" style={{ color: 'var(--text3)' }}>
      <div className="text-2xl mb-2 opacity-40">✓</div>
      <p className="text-xs">{text}</p>
    </div>
  )
}

function StatRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0"
      style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text2)' }}>
        <span>{icon}</span>{label}
      </span>
      <span className="text-sm font-medium font-mono">{value}</span>
    </div>
  )
}

function buildRecommendations(stats: import('@/types').DashboardStats, concluidos: number) {
  const items = []
  if (stats.criticos.length > 0)
    items.push({ icon: '🚨', bgColor: 'rgba(239,68,68,0.1)', title: 'Ação imediata necessária', desc: `${stats.criticos.length} projeto${stats.criticos.length > 1 ? 's estão' : ' está'} com farol vermelho. Revisar cronograma urgentemente.` })
  if (stats.emRisco.length > 0)
    items.push({ icon: '⚡', bgColor: 'rgba(245,158,11,0.1)', title: 'Monitoramento intensificado', desc: `${stats.emRisco.length} projeto${stats.emRisco.length > 1 ? 's precisam' : ' precisa'} de atenção preventiva.` })
  if (stats.mediaEvolucao < 40 && stats.total > 0)
    items.push({ icon: '📈', bgColor: 'rgba(245,158,11,0.1)', title: 'Evolução abaixo do esperado', desc: `Média de ${stats.mediaEvolucao}% sugere revisão de recursos e priorização.` })
  if (stats.mediaEvolucao >= 70 && stats.total > 0)
    items.push({ icon: '🏆', bgColor: 'rgba(34,197,94,0.1)', title: 'Portfólio em boa evolução', desc: `Média de ${stats.mediaEvolucao}% demonstra execução consistente.` })
  if (concluidos > 0)
    items.push({ icon: '✅', bgColor: 'rgba(59,130,246,0.1)', title: 'Projetos entregues', desc: `${concluidos} projeto${concluidos > 1 ? 's foram' : ' foi'} concluído${concluidos > 1 ? 's' : ''}. Documentar lições aprendidas.` })
  if (items.length === 0)
    items.push({ icon: '🎯', bgColor: 'rgba(59,130,246,0.1)', title: 'Portfolio saudável', desc: 'Sem recomendações críticas no momento. Continue monitorando.' })
  return items
}
