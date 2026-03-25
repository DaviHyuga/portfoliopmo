// src/app/demo/page.tsx — Dashboard com dados fictícios (sem Supabase)

import { KpiCard } from '@/components/ui/KpiCard'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { BarChartProjects } from '@/components/charts/BarChartProjects'
import { FarolDistribution } from '@/components/charts/FarolDistribution'
import { QuartersChart } from '@/components/charts/QuartersChart'
import { InsightCard } from '@/components/ui/InsightCard'
import type { Project, DashboardStats } from '@/types'

const DEMO_PROJECTS: Project[] = [
  {
    id: '1', organization_id: 'demo',
    nome: 'Digitalização do Processo de RH',
    descricao: 'Automatização dos processos de admissão e desligamento',
    beneficios: 'Redução de 40% no tempo de processamento e eliminação de erros manuais',
    riscos: 'Dependência de aprovação de TI\nFalta de recursos técnicos especializados',
    pct_evolucao: 75, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Ana Lima',
    data_inicio: '2026-01-10', data_fim_prevista: '2026-02-28',
    created_at: '', updated_at: '',
  },
  {
    id: '2', organization_id: 'demo',
    nome: 'Migração para Cloud AWS',
    descricao: 'Migração da infraestrutura on-premise para nuvem',
    beneficios: 'Redução de custos de infraestrutura em 30% e maior escalabilidade',
    riscos: 'Migração de dados legados com risco de perda\nRisco de indisponibilidade durante a migração',
    pct_evolucao: 45, farol: 'amarelo', natureza: 'regulatorio',
    desvios: ['prazo'], responsavel: 'Carlos Mendes',
    data_inicio: '2026-02-01', data_fim_prevista: '2026-05-30',
    created_at: '', updated_at: '',
  },
  {
    id: '3', organization_id: 'demo',
    nome: 'Implantação do CRM Salesforce',
    descricao: 'Substituição do sistema legado de relacionamento com clientes',
    beneficios: 'Aumento de 20% na conversão de vendas e visibilidade do funil',
    riscos: 'Mudança de escopo durante a execução\nFornecedor terceiro com prazo incerto\nTreinamento e adoção pelos times comerciais',
    pct_evolucao: 20, farol: 'vermelho', natureza: 'negocios',
    desvios: ['escopo', 'prazo'], responsavel: 'Beatriz Souza',
    data_inicio: '2025-11-01', data_fim_prevista: '2026-01-31',
    created_at: '', updated_at: '',
  },
  {
    id: '4', organization_id: 'demo',
    nome: 'Programa de Compliance LGPD',
    descricao: 'Adequação dos sistemas e processos à Lei Geral de Proteção de Dados',
    beneficios: 'Conformidade total com LGPD e mitigação de risco regulatório',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Fernanda Costa',
    data_inicio: '2025-06-01', data_fim_prevista: '2025-12-15',
    created_at: '', updated_at: '',
  },
  {
    id: '5', organization_id: 'demo',
    nome: 'Portal do Cliente Digital',
    descricao: 'Criação de portal self-service para clientes PJ',
    beneficios: 'Melhoria no NPS em 15 pontos e redução de chamados em 25%',
    riscos: 'Integração com API legada de apólices\nComunicação e alinhamento com área comercial',
    pct_evolucao: 85, farol: 'verde', natureza: 'negocios',
    desvios: [], responsavel: 'Ricardo Alves',
    data_inicio: '2026-01-15', data_fim_prevista: '2026-04-30',
    created_at: '', updated_at: '',
  },
  {
    id: '6', organization_id: 'demo',
    nome: 'Automação de Relatórios Financeiros',
    descricao: 'Automatização da geração de relatórios mensais para diretoria',
    beneficios: 'Economia de 80h/mês da equipe de controladoria',
    riscos: 'Qualidade dos dados inconsistente nas fontes\nPrazo e cronograma apertados para entrega',
    pct_evolucao: 55, farol: 'amarelo', natureza: 'backoffice',
    desvios: ['risco'], responsavel: 'Juliana Pires',
    data_inicio: '2026-03-01', data_fim_prevista: '2026-07-31',
    created_at: '', updated_at: '',
  },
  {
    id: '7', organization_id: 'demo',
    nome: 'Expansão Regional Sul',
    descricao: 'Abertura de operações nos estados do RS, SC e PR',
    beneficios: 'Aumento de 15% na base de clientes corporativos',
    riscos: null,
    pct_evolucao: 60, farol: 'verde', natureza: 'regional',
    desvios: [], responsavel: 'Marcos Ferreira',
    data_inicio: '2026-02-01', data_fim_prevista: '2026-09-30',
    created_at: '', updated_at: '',
  },
  {
    id: '8', organization_id: 'demo',
    nome: 'Renovação de Licenças de Software',
    descricao: 'Renovação e consolidação do parque de licenças corporativas',
    beneficios: null,
    riscos: 'Orçamento insuficiente para todas as licenças necessárias\nFornecedor externo sem SLA definido',
    pct_evolucao: 10, farol: 'vermelho', natureza: 'backoffice',
    desvios: ['risco', 'escopo'], responsavel: 'Patricia Gomes',
    data_inicio: '2026-03-01', data_fim_prevista: '2026-06-30',
    created_at: '', updated_at: '',
  },
]

const total = DEMO_PROJECTS.length
const mediaEvolucao = Math.round(DEMO_PROJECTS.reduce((a, p) => a + p.pct_evolucao, 0) / total)

const DEMO_STATS: DashboardStats = {
  total,
  mediaEvolucao,
  porFarol: {
    verde: DEMO_PROJECTS.filter(p => p.farol === 'verde').length,
    amarelo: DEMO_PROJECTS.filter(p => p.farol === 'amarelo').length,
    vermelho: DEMO_PROJECTS.filter(p => p.farol === 'vermelho').length,
    azul: DEMO_PROJECTS.filter(p => p.farol === 'azul').length,
  },
  porNatureza: {
    backoffice: DEMO_PROJECTS.filter(p => p.natureza === 'backoffice').length,
    regulatorio: DEMO_PROJECTS.filter(p => p.natureza === 'regulatorio').length,
    negocios: DEMO_PROJECTS.filter(p => p.natureza === 'negocios').length,
    regional: DEMO_PROJECTS.filter(p => p.natureza === 'regional').length,
  },
  criticos: DEMO_PROJECTS.filter(p => p.farol === 'vermelho'),
  emRisco: DEMO_PROJECTS.filter(p => p.farol === 'amarelo'),
}

export default function DemoDashboardPage() {
  const stats = DEMO_STATS
  const projects = DEMO_PROJECTS

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard Executivo</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {stats.total} projetos · Evolução média: {stats.mediaEvolucao}% · {stats.criticos.length} críticos
          </p>
        </div>
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
          Modo Demo
        </span>
      </div>

      {/* KPIs — 6 cards em 3×2 */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <KpiCard label="Evolução Média" value={`${stats.mediaEvolucao}%`} meta="do portfólio total" accent="accent" icon="◈" />
        <KpiCard label="Total de Projetos" value={stats.total} meta="no portfólio ativo" accent="gray" icon="✦" />
        <KpiCard label="Projetos no Prazo" value={stats.porFarol.verde} meta="farol verde" accent="green" icon="🟢" />
        <KpiCard label="Em Risco" value={stats.emRisco.length} meta="farol amarelo" accent="yellow" icon="⚡" />
        <KpiCard label="Críticos" value={stats.criticos.length} meta="farol vermelho" accent="red" icon="⚠" />
        <KpiCard label="Projetos Concluídos" value={stats.porFarol.azul} meta="farol azul" accent="blue" icon="🔵" />
      </div>

      {/* Quarters chart */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Distribuição por Trimestre</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {projects.filter(p => p.data_fim_prevista).length} com prazo definido
          </span>
        </div>
        <div className="px-5 py-4">
          <QuartersChart projects={projects} />
        </div>
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

      {/* Tabela com coluna Benefícios */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Portfólio Consolidado</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {stats.total} projetos
          </span>
        </div>
        <div className="overflow-x-auto">
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
        </div>
      </div>

      {/* Insights automáticos */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">💡 Insights Automáticos</span>
        </div>
        <div className="p-5 grid grid-cols-2 gap-3">
          <InsightCard icon="🚨" color="red" title="Ação imediata necessária"
            desc={`${stats.criticos.length} projetos com farol vermelho. Convocar reuniões de crise e revisar cronograma.`} />
          <InsightCard icon="⚡" color="yellow" title="Monitoramento intensificado"
            desc={`${stats.emRisco.length} projetos precisam de atenção preventiva antes de se tornarem críticos.`} />
          <InsightCard icon="✅" color="blue" title="Projetos entregues"
            desc={`${stats.porFarol.azul} projeto foi concluído. Documentar lições aprendidas.`} />
          <InsightCard icon="📈" color="yellow" title="Evolução dentro do esperado"
            desc={`Média de ${stats.mediaEvolucao}% do portfólio. Acompanhar projetos críticos semanalmente.`} />
        </div>
      </div>
    </div>
  )
}
