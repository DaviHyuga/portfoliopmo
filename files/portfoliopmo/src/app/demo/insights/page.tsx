'use client'
// src/app/demo/insights/page.tsx

import { useDemoContext } from '../context'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NATUREZA_LABELS } from '@/types'
import type { Project } from '@/types'

function gerarMitigacao(risco: string, farol: Project['farol']): string {
  const r = risco.toLowerCase()
  if (/aprovação|dependência/.test(r))   return 'Mapeamento de stakeholders e processo de aprovação antecipado com buffer no cronograma'
  if (/migração|dados|legado/.test(r))   return 'Migração incremental com ambiente de testes paralelo e validação por etapa'
  if (/recurso|equipe|capacidade/.test(r)) return 'Identificação de gap e acionamento de alocação com antecedência mínima de 4 semanas'
  if (/fornecedor|terceiro|externo/.test(r)) return 'Cláusulas de SLA com penalidades e identificação de fornecedor backup'
  if (/escopo|requisito|mudança/.test(r))  return 'Processo formal de controle de mudanças (CCB) e versionamento de requisitos'
  if (/orçamento|custo|licença/.test(r))   return 'Buffer de 15–20% nas estimativas e alerta ao atingir 70% do orçamento'
  if (/prazo|cronograma|atraso/.test(r))   return 'Caminho crítico (CPM) e revisão semanal de dependências'
  if (/treinamento|capacitação|adoção/.test(r)) return 'Plano de gestão da mudança com treinamentos antecipados'
  if (/qualidade|inconsistência|erro/.test(r))  return 'Regras de validação e relatório de qualidade automatizado'
  if (/regulatório|compliance|lgpd/.test(r))    return 'Envolvimento do DPO e revisões bimestrais com checklist'
  if (/comunicação|alinhamento|stakeholder/.test(r)) return 'Plano de comunicação com cadência definida e canal dedicado'
  if (/tecnologia|sistema|integração|api/.test(r))   return 'Prova de conceito técnica e documentação de interfaces'
  if (farol === 'vermelho') return 'War room imediato com sponsor e equipe, plano de ação em 48h'
  if (farol === 'amarelo')  return 'Monitoramento semanal e ativação de contingência em 2 semanas'
  return 'Registro no log de riscos com responsável e revisão em reuniões de status'
}

export default function DemoInsightsPage() {
  const { projects } = useDemoContext()

  const criticos  = projects.filter(p => p.farol === 'vermelho')
  const emRisco   = projects.filter(p => p.farol === 'amarelo')
  const concluidos = projects.filter(p => p.farol === 'azul')
  const verdes    = projects.filter(p => p.farol === 'verde')
  const total     = projects.length
  const mediaEvolucao = total > 0 ? Math.round(projects.reduce((a, p) => a + p.pct_evolucao, 0) / total) : 0
  const top3 = [...criticos, ...emRisco].sort((a, b) => a.pct_evolucao - b.pct_evolucao).slice(0, 3)
  const totalRiscos = projects.reduce((acc, p) => acc + (p.riscos ? p.riscos.split('\n').filter(r => r.trim()).length : 0), 0)

  const porNatureza = {
    backoffice:  projects.filter(p => p.natureza === 'backoffice').length,
    regulatorio: projects.filter(p => p.natureza === 'regulatorio').length,
    negocios:    projects.filter(p => p.natureza === 'negocios').length,
    regional:    projects.filter(p => p.natureza === 'regional').length,
  }

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Insights Executivos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Análise automática do portfólio</p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <InsightSection title="🔴 Projetos Críticos" count={criticos.length}>
          {criticos.length === 0 ? <EmptyCheck text="Nenhum projeto crítico — ótimo!" />
            : criticos.map(p => <ProjectItem key={p.id} project={p} />)}
        </InsightSection>

        <InsightSection title="🟡 Em Risco" count={emRisco.length}>
          {emRisco.length === 0 ? <EmptyCheck text="Nenhum projeto em risco" />
            : emRisco.map(p => <ProjectItem key={p.id} project={p} />)}
        </InsightSection>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        <InsightSection title="🏆 Top 3 Mais Críticos">
          {top3.length === 0 ? <EmptyCheck text="Nenhum projeto crítico ou em risco" />
            : top3.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
                <span className="text-xl font-bold font-mono w-6 text-center"
                  style={{ color: i === 0 ? '#ef4444' : i === 1 ? '#f59e0b' : 'var(--text3)' }}>{i + 1}</span>
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

        <InsightSection title="📊 Resumo do Portfólio">
          {total === 0 ? <EmptyCheck text="Adicione projetos para ver o resumo" /> : (
            <div className="space-y-3">
              <StatRow icon="◈" label="Evolução média"  value={`${mediaEvolucao}%`} />
              <StatRow icon="✅" label="Concluídos"      value={`${concluidos.length} projeto${concluidos.length !== 1 ? 's' : ''}`} />
              <StatRow icon="🟢" label="No prazo"        value={`${verdes.length} projeto${verdes.length !== 1 ? 's' : ''}`} />
              <StatRow icon="📦" label="Total"           value={`${total} projeto${total !== 1 ? 's' : ''}`} />
              {(Object.entries(porNatureza) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
                <StatRow key={k} icon="📂" label={NATUREZA_LABELS[k as keyof typeof NATUREZA_LABELS]} value={`${v}`} />
              ))}
            </div>
          )}
        </InsightSection>
      </div>

      {/* Análise e Mitigação de Riscos */}
      {projects.some(p => p.riscos) && (
        <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">⚠ Análise e Mitigação de Riscos</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{totalRiscos} riscos</span>
          </div>
          <div className="p-5 space-y-5">
            {projects.filter(p => p.riscos).map(p => {
              const riscos = p.riscos!.split('\n').filter(r => r.trim())
              return (
                <div key={p.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <FarolBadge farol={p.farol} />
                    <span className="text-sm font-medium">{p.nome}</span>
                  </div>
                  <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                    <table className="w-full">
                      <thead>
                        <tr style={{ background: 'var(--bg3)' }}>
                          <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider w-1/2"
                            style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>⚠ Risco identificado</th>
                          <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider w-1/2"
                            style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>🛡 Estratégia de mitigação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {riscos.map((risco, i) => (
                          <tr key={i} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{risco.trim()}</td>
                            <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{gerarMitigacao(risco.trim(), p.farol)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recomendações */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">💡 Recomendações Automáticas</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {buildRecommendations(criticos.length, emRisco.length, mediaEvolucao, concluidos.length, total).map((r, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border)' }}>
              <div className="w-7 h-7 rounded-md flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                style={{ background: r.bgColor }}>{r.icon}</div>
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

function buildRecommendations(criticos: number, emRisco: number, media: number, concluidos: number, total: number) {
  const items = []
  if (criticos > 0) items.push({ icon: '🚨', bgColor: 'rgba(239,68,68,0.1)', title: 'Ação imediata necessária', desc: `${criticos} projeto${criticos > 1 ? 's estão' : ' está'} com farol vermelho. Revisar cronograma urgentemente.` })
  if (emRisco > 0) items.push({ icon: '⚡', bgColor: 'rgba(245,158,11,0.1)', title: 'Monitoramento intensificado', desc: `${emRisco} projeto${emRisco > 1 ? 's precisam' : ' precisa'} de atenção preventiva.` })
  if (media < 40 && total > 0) items.push({ icon: '📈', bgColor: 'rgba(245,158,11,0.1)', title: 'Evolução abaixo do esperado', desc: `Média de ${media}% sugere revisão de recursos e priorização.` })
  if (media >= 70 && total > 0) items.push({ icon: '🏆', bgColor: 'rgba(34,197,94,0.1)', title: 'Portfólio em boa evolução', desc: `Média de ${media}% demonstra execução consistente.` })
  if (concluidos > 0) items.push({ icon: '✅', bgColor: 'rgba(59,130,246,0.1)', title: 'Projetos entregues', desc: `${concluidos} projeto${concluidos > 1 ? 's foram' : ' foi'} concluído${concluidos > 1 ? 's' : ''}. Documentar lições aprendidas.` })
  if (items.length === 0) items.push({ icon: '🎯', bgColor: 'rgba(59,130,246,0.1)', title: 'Portfolio saudável', desc: 'Sem recomendações críticas no momento. Continue monitorando.' })
  return items
}

function InsightSection({ title, count, children }: { title: string; count?: number; children: React.ReactNode }) {
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

function ProjectItem({ project }: { project: Project }) {
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
    <div className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <span className="text-sm flex items-center gap-2" style={{ color: 'var(--text2)' }}><span>{icon}</span>{label}</span>
      <span className="text-sm font-medium font-mono">{value}</span>
    </div>
  )
}
