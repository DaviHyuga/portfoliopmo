// src/app/demo/insights/page.tsx — Insights com dados fictícios (sem Supabase)

import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { NATUREZA_LABELS } from '@/types'
import type { Project } from '@/types'

const DEMO_PROJECTS: Project[] = [
  {
    id: '1', organization_id: 'demo',
    nome: 'Digitalização do Processo de RH',
    descricao: null, beneficios: 'Redução de 40% no tempo de processamento e eliminação de erros manuais',
    riscos: 'Dependência de aprovação de TI\nFalta de recursos técnicos especializados',
    pct_evolucao: 75, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Ana Lima',
    data_inicio: '2026-01-10', data_fim_prevista: '2026-02-28',
    created_at: '', updated_at: '',
  },
  {
    id: '2', organization_id: 'demo',
    nome: 'Migração para Cloud AWS',
    descricao: null, beneficios: 'Redução de custos de infraestrutura em 30%',
    riscos: 'Migração de dados legados com risco de perda\nRisco de indisponibilidade durante a migração',
    pct_evolucao: 45, farol: 'amarelo', natureza: 'regulatorio',
    desvios: ['prazo'], responsavel: 'Carlos Mendes',
    data_inicio: '2026-02-01', data_fim_prevista: '2026-05-30',
    created_at: '', updated_at: '',
  },
  {
    id: '3', organization_id: 'demo',
    nome: 'Implantação do CRM Salesforce',
    descricao: null, beneficios: 'Aumento de 20% na conversão de vendas',
    riscos: 'Mudança de escopo durante a execução\nFornecedor terceiro com prazo incerto\nTreinamento e adoção pelos times comerciais',
    pct_evolucao: 20, farol: 'vermelho', natureza: 'negocios',
    desvios: ['escopo', 'prazo'], responsavel: 'Beatriz Souza',
    data_inicio: '2025-11-01', data_fim_prevista: '2026-01-31',
    created_at: '', updated_at: '',
  },
  {
    id: '4', organization_id: 'demo',
    nome: 'Programa de Compliance LGPD',
    descricao: null, beneficios: 'Conformidade total com LGPD',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Fernanda Costa',
    data_inicio: '2025-06-01', data_fim_prevista: '2025-12-15',
    created_at: '', updated_at: '',
  },
  {
    id: '5', organization_id: 'demo',
    nome: 'Portal do Cliente Digital',
    descricao: null, beneficios: 'Melhoria no NPS em 15 pontos',
    riscos: 'Integração com API legada de apólices\nComunicação e alinhamento com área comercial',
    pct_evolucao: 85, farol: 'verde', natureza: 'negocios',
    desvios: [], responsavel: 'Ricardo Alves',
    data_inicio: '2026-01-15', data_fim_prevista: '2026-04-30',
    created_at: '', updated_at: '',
  },
  {
    id: '6', organization_id: 'demo',
    nome: 'Automação de Relatórios Financeiros',
    descricao: null, beneficios: 'Economia de 80h/mês da equipe de controladoria',
    riscos: 'Qualidade dos dados inconsistente nas fontes\nPrazo e cronograma apertados para entrega',
    pct_evolucao: 55, farol: 'amarelo', natureza: 'backoffice',
    desvios: ['risco'], responsavel: 'Juliana Pires',
    data_inicio: '2026-03-01', data_fim_prevista: '2026-07-31',
    created_at: '', updated_at: '',
  },
  {
    id: '7', organization_id: 'demo',
    nome: 'Expansão Regional Sul',
    descricao: null, beneficios: 'Aumento de 15% na base de clientes corporativos',
    riscos: null,
    pct_evolucao: 60, farol: 'verde', natureza: 'regional',
    desvios: [], responsavel: 'Marcos Ferreira',
    data_inicio: '2026-02-01', data_fim_prevista: '2026-09-30',
    created_at: '', updated_at: '',
  },
  {
    id: '8', organization_id: 'demo',
    nome: 'Renovação de Licenças de Software',
    descricao: null, beneficios: null,
    riscos: 'Orçamento insuficiente para todas as licenças necessárias\nFornecedor externo sem SLA definido',
    pct_evolucao: 10, farol: 'vermelho', natureza: 'backoffice',
    desvios: ['risco', 'escopo'], responsavel: 'Patricia Gomes',
    data_inicio: '2026-03-01', data_fim_prevista: '2026-06-30',
    created_at: '', updated_at: '',
  },
]

const criticos = DEMO_PROJECTS.filter(p => p.farol === 'vermelho')
const emRisco = DEMO_PROJECTS.filter(p => p.farol === 'amarelo')
const concluidos = DEMO_PROJECTS.filter(p => p.farol === 'azul')
const verdes = DEMO_PROJECTS.filter(p => p.farol === 'verde')
const total = DEMO_PROJECTS.length
const mediaEvolucao = Math.round(DEMO_PROJECTS.reduce((a, p) => a + p.pct_evolucao, 0) / total)

const top3 = [...criticos, ...emRisco]
  .sort((a, b) => a.pct_evolucao - b.pct_evolucao)
  .slice(0, 3)

const porNatureza = {
  backoffice: DEMO_PROJECTS.filter(p => p.natureza === 'backoffice').length,
  regulatorio: DEMO_PROJECTS.filter(p => p.natureza === 'regulatorio').length,
  negocios: DEMO_PROJECTS.filter(p => p.natureza === 'negocios').length,
  regional: DEMO_PROJECTS.filter(p => p.natureza === 'regional').length,
}

function gerarMitigacao(risco: string, farol: Project['farol']): string {
  const r = risco.toLowerCase()
  if (/aprovação|dependência/.test(r))
    return 'Mapeamento de stakeholders e processo de aprovação antecipado com buffer no cronograma'
  if (/migração|dados|legado/.test(r))
    return 'Migração incremental com ambiente de testes paralelo e validação por etapa'
  if (/recurso|equipe|capacidade/.test(r))
    return 'Identificação de gap e acionamento de alocação com antecedência mínima de 4 semanas'
  if (/fornecedor|terceiro|externo/.test(r))
    return 'Cláusulas de SLA com penalidades e identificação de fornecedor backup'
  if (/escopo|requisito|mudança/.test(r))
    return 'Processo formal de controle de mudanças (CCB) e versionamento de requisitos'
  if (/orçamento|custo|licença/.test(r))
    return 'Buffer de 15–20% nas estimativas e alerta ao atingir 70% do orçamento'
  if (/prazo|cronograma|atraso/.test(r))
    return 'Caminho crítico (CPM) e revisão semanal de dependências'
  if (/treinamento|capacitação|adoção/.test(r))
    return 'Plano de gestão da mudança com treinamentos antecipados'
  if (/qualidade|inconsistência|erro/.test(r))
    return 'Regras de validação e relatório de qualidade automatizado'
  if (/regulatório|compliance|lgpd/.test(r))
    return 'Envolvimento do DPO e revisões bimestrais com checklist'
  if (/comunicação|alinhamento|stakeholder/.test(r))
    return 'Plano de comunicação com cadência definida e canal dedicado'
  if (/tecnologia|sistema|integração|api/.test(r))
    return 'Prova de conceito técnica e documentação de interfaces'
  if (farol === 'vermelho')
    return 'War room imediato com sponsor e equipe, plano de ação em 48h'
  if (farol === 'amarelo')
    return 'Monitoramento semanal e ativação de contingência em 2 semanas'
  return 'Registro no log de riscos com responsável e revisão em reuniões de status'
}

export default function DemoInsightsPage() {
  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Insights Executivos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Análise automática do portfólio</p>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Críticos */}
        <InsightSection title="🔴 Projetos Críticos" count={criticos.length}>
          {criticos.length === 0 ? <EmptyCheck text="Nenhum projeto crítico" /> :
            criticos.map(p => <ProjectInsightItem key={p.id} project={p} />)}
        </InsightSection>

        {/* Em Risco */}
        <InsightSection title="🟡 Em Risco" count={emRisco.length}>
          {emRisco.length === 0 ? <EmptyCheck text="Nenhum projeto em risco" /> :
            emRisco.map(p => <ProjectInsightItem key={p.id} project={p} />)}
        </InsightSection>
      </div>

      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Top 3 */}
        <InsightSection title="🏆 Top 3 Mais Críticos">
          {top3.map((p, i) => (
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
          <div className="space-y-3">
            <StatRow icon="◈" label="Evolução média" value={`${mediaEvolucao}%`} />
            <StatRow icon="✅" label="Concluídos" value={`${concluidos.length} projetos`} />
            <StatRow icon="🟢" label="No prazo" value={`${verdes.length} projetos`} />
            <StatRow icon="📦" label="Total" value={`${total} projetos`} />
            {(Object.entries(porNatureza) as [string, number][]).filter(([, v]) => v > 0).map(([k, v]) => (
              <StatRow key={k} icon="📂" label={NATUREZA_LABELS[k as keyof typeof NATUREZA_LABELS]} value={`${v}`} />
            ))}
          </div>
        </InsightSection>
      </div>

      {/* Análise e Mitigação de Riscos */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">⚠ Análise e Mitigação de Riscos</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {DEMO_PROJECTS.reduce((acc, p) => acc + (p.riscos ? p.riscos.split('\n').filter(r => r.trim()).length : 0), 0)} riscos
          </span>
        </div>
        <div className="p-5 space-y-5">
          {DEMO_PROJECTS.filter(p => p.riscos).map(p => {
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
                          style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                          ⚠ Risco identificado
                        </th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider w-1/2"
                          style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                          🛡 Estratégia de mitigação
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {riscos.map((risco, i) => (
                        <tr key={i} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{risco.trim()}</td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>
                            {gerarMitigacao(risco.trim(), p.farol)}
                          </td>
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

      {/* Recomendações */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">💡 Recomendações Automáticas</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          {[
            { icon: '🚨', bgColor: 'rgba(239,68,68,0.1)', title: 'Ação imediata necessária', desc: `${criticos.length} projetos estão com farol vermelho. Revisar cronograma urgentemente.` },
            { icon: '⚡', bgColor: 'rgba(245,158,11,0.1)', title: 'Monitoramento intensificado', desc: `${emRisco.length} projetos precisam de atenção preventiva.` },
            { icon: '✅', bgColor: 'rgba(59,130,246,0.1)', title: 'Projetos entregues', desc: `${concluidos.length} projeto foi concluído. Documentar lições aprendidas.` },
            { icon: '🎯', bgColor: 'rgba(99,102,241,0.1)', title: 'Evolução dentro do esperado', desc: `Média de ${mediaEvolucao}% demonstra execução consistente. Continue monitorando.` },
          ].map((r, i) => (
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

function ProjectInsightItem({ project }: { project: Project }) {
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
