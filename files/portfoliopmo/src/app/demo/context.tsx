'use client'
// src/app/demo/context.tsx — estado global do demo com persistência em localStorage

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types'

const INITIAL_PROJECTS: Project[] = [
  // ── Azul 2025 Q1 ──
  {
    id: '11', organization_id: 'demo',
    nome: 'Migração para Pagamentos PIX',
    descricao: 'Integração com o ecossistema PIX do Banco Central para pagamentos instantâneos em todos os produtos',
    beneficios: 'Eliminação de taxas de TED/DOC estimada em R$ 800K/ano e redução de 90% no tempo de liquidação',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Bruno Alves',
    data_inicio: '2024-10-01', data_fim_prevista: '2025-02-28',
    created_at: '2024-10-01T00:00:00Z', updated_at: '2024-10-01T00:00:00Z',
  },
  // ── Azul 2025 Q2 ──
  {
    id: '12', organization_id: 'demo',
    nome: 'Customer Data Platform (CDP)',
    descricao: 'Unificação de dados de clientes em plataforma centralizada com segmentação em tempo real',
    beneficios: 'Aumento de 28% na conversão de campanhas e redução de 40% no custo de aquisição por cliente',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'negocios',
    desvios: [], responsavel: 'Juliana Ramos',
    data_inicio: '2024-12-01', data_fim_prevista: '2025-05-31',
    created_at: '2024-12-01T00:00:00Z', updated_at: '2024-12-01T00:00:00Z',
  },
  // ── Azul 2025 Q3 ──
  {
    id: '13', organization_id: 'demo',
    nome: 'Automação de Onboarding Corporativo',
    descricao: 'Digitalização e automação do processo de onboarding de clientes pessoa jurídica com validação de KYC',
    beneficios: 'Redução de 15 para 2 dias no tempo de ativação e aumento de 22% na satisfação (NPS pós-onboarding)',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'negocios',
    desvios: [], responsavel: 'Thiago Souza',
    data_inicio: '2025-02-01', data_fim_prevista: '2025-08-15',
    created_at: '2025-02-01T00:00:00Z', updated_at: '2025-02-01T00:00:00Z',
  },
  // ── Azul 2026 Q2 ──
  {
    id: '14', organization_id: 'demo',
    nome: 'Open Insurance — Fase 2',
    descricao: 'Implementação da fase 2 do Open Insurance com compartilhamento de dados de seguros e APIs padronizadas',
    beneficios: 'Conformidade regulatória com SUSEP e habilitação para novos produtos baseados em dados compartilhados',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Carla Mendes',
    data_inicio: '2025-11-01', data_fim_prevista: '2026-05-31',
    created_at: '2025-11-01T00:00:00Z', updated_at: '2025-11-01T00:00:00Z',
  },
  // ── Azul 2026 Q4 ──
  {
    id: '15', organization_id: 'demo',
    nome: 'Plataforma de Gestão de Sinistros 2.0',
    descricao: 'Modernização do sistema de sinistros com IA para triagem automática e análise de documentos',
    beneficios: 'Redução de 65% no tempo de liquidação de sinistros simples e economia de R$ 3,2M/ano em operações',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'backoffice',
    desvios: [], responsavel: 'Eduardo Pires',
    data_inicio: '2026-03-01', data_fim_prevista: '2026-11-30',
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z',
  },
  // ── Projetos ativos ──
  {
    id: '1', organization_id: 'demo',
    nome: 'Plataforma de Dados Corporativos',
    descricao: 'Centralização e governança dos dados estratégicos da empresa em data lake unificado com pipelines automatizados',
    beneficios: 'Redução de 60% no tempo de geração de relatórios executivos e eliminação de silos de dados entre áreas',
    riscos: 'Qualidade inconsistente dos dados legados\nDependência de aprovação do Comitê de Tecnologia',
    pct_evolucao: 82, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Camila Torres',
    data_inicio: '2025-10-01', data_fim_prevista: '2026-04-30',
    created_at: '2025-10-01T00:00:00Z', updated_at: '2025-10-01T00:00:00Z',
  },
  {
    id: '2', organization_id: 'demo',
    nome: 'Transformação Digital — Jornada do Cliente',
    descricao: 'Redesenho completo da jornada digital do cliente com omnicanalidade e personalização por IA',
    beneficios: 'Aumento de 35% no NPS, +22% na taxa de retenção e redução de 30% no custo de aquisição',
    riscos: 'Integrações com sistemas legados de CRM\nResistência cultural dos times de atendimento\nBudget adicional para infraestrutura de IA',
    pct_evolucao: 67, farol: 'verde', natureza: 'negocios',
    desvios: [], responsavel: 'Rafael Monteiro',
    data_inicio: '2025-09-01', data_fim_prevista: '2026-06-30',
    created_at: '2025-09-01T00:00:00Z', updated_at: '2025-09-01T00:00:00Z',
  },
  {
    id: '3', organization_id: 'demo',
    nome: 'Adequação Regulatória — Resolução 4.966',
    descricao: 'Adequação dos processos contábeis e de provisionamento às novas normas do BACEN',
    beneficios: 'Conformidade regulatória total e mitigação de risco de multa estimada em R$ 12M',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Patrícia Gomes',
    data_inicio: '2025-04-01', data_fim_prevista: '2025-12-31',
    created_at: '2025-04-01T00:00:00Z', updated_at: '2025-04-01T00:00:00Z',
  },
  {
    id: '4', organization_id: 'demo',
    nome: 'ERP Next — Módulo Financeiro',
    descricao: 'Implantação do novo módulo financeiro integrado com contas a pagar, receber e conciliação automática',
    beneficios: 'Economia de 120h/mês em processos manuais e fechamento contábil em 2 dias úteis vs 8 dias atuais',
    riscos: 'Escopo ampliado pelo sponsor após kickoff\nFornecedor com histórico de atrasos em outros clientes',
    pct_evolucao: 38, farol: 'vermelho', natureza: 'backoffice',
    desvios: ['escopo', 'prazo'], responsavel: 'Henrique Bastos',
    data_inicio: '2025-11-01', data_fim_prevista: '2026-02-28',
    created_at: '2025-11-01T00:00:00Z', updated_at: '2025-11-01T00:00:00Z',
  },
  {
    id: '5', organization_id: 'demo',
    nome: 'Portal B2B de Autoatendimento',
    descricao: 'Portal self-service para parceiros comerciais com gestão de contratos, emissão de documentos e acompanhamento em tempo real',
    beneficios: 'Redução de 40% no volume de chamados ao backoffice e melhora no SLA de atendimento de 5 para 1 dia',
    riscos: 'Integração com API de legado sem documentação atualizada\nAlinhamento com área jurídica para assinatura digital',
    pct_evolucao: 91, farol: 'verde', natureza: 'negocios',
    desvios: [], responsavel: 'Larissa Campos',
    data_inicio: '2026-01-05', data_fim_prevista: '2026-05-15',
    created_at: '2026-01-05T00:00:00Z', updated_at: '2026-01-05T00:00:00Z',
  },
  {
    id: '6', organization_id: 'demo',
    nome: 'Modernização da Infraestrutura Cloud',
    descricao: 'Migração de workloads críticos on-premise para arquitetura multi-cloud com alta disponibilidade',
    beneficios: 'Redução de 45% em custos de infraestrutura (R$ 2,1M/ano) e eliminação de janelas de manutenção',
    riscos: 'Risco de indisponibilidade durante janelas de migração\nDependência de certificação técnica do time interno',
    pct_evolucao: 54, farol: 'amarelo', natureza: 'backoffice',
    desvios: ['prazo'], responsavel: 'Diego Martins',
    data_inicio: '2025-12-01', data_fim_prevista: '2026-07-31',
    created_at: '2025-12-01T00:00:00Z', updated_at: '2025-12-01T00:00:00Z',
  },
  {
    id: '7', organization_id: 'demo',
    nome: 'Programa LGPD — Ciclo 2026',
    descricao: 'Revisão anual do programa de proteção de dados: mapeamento de fluxos, DPIAs e treinamentos obrigatórios',
    beneficios: 'Conformidade contínua com a LGPD e redução do risco de sanções da ANPD',
    riscos: null,
    pct_evolucao: 100, farol: 'azul', natureza: 'regulatorio',
    desvios: [], responsavel: 'Fernanda Costa',
    data_inicio: '2026-01-02', data_fim_prevista: '2026-03-31',
    created_at: '2026-01-02T00:00:00Z', updated_at: '2026-01-02T00:00:00Z',
  },
  {
    id: '8', organization_id: 'demo',
    nome: 'Expansão — Região Norte e Nordeste',
    descricao: 'Estruturação de equipes regionais, parcerias locais e abertura de 4 novos escritórios em capitais',
    beneficios: 'Projeção de R$ 18M em novas receitas e aumento de 20% na base de clientes corporativos até 2027',
    riscos: 'Contratação e retenção de talentos nas regiões-alvo\nCronograma dependente de aprovação jurídica dos contratos de locação',
    pct_evolucao: 48, farol: 'amarelo', natureza: 'regional',
    desvios: ['risco'], responsavel: 'Marcos Ferreira',
    data_inicio: '2026-02-01', data_fim_prevista: '2026-12-31',
    created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
  },
  {
    id: '9', organization_id: 'demo',
    nome: 'Automação de Subscrição com IA',
    descricao: 'Implementação de modelos preditivos para análise de risco e precificação automatizada em tempo real',
    beneficios: 'Redução de 70% no tempo médio de subscrição (de 3 dias para 4 horas) e ganho de R$ 5M em precisão de pricing',
    riscos: 'Modelo de IA requer base histórica de 3 anos — dados incompletos para segmentos novos\nAprovação do regulador para uso de IA em decisões de subscrição',
    pct_evolucao: 25, farol: 'vermelho', natureza: 'negocios',
    desvios: ['escopo', 'risco'], responsavel: 'Isabela Nogueira',
    data_inicio: '2025-10-15', data_fim_prevista: '2026-03-31',
    created_at: '2025-10-15T00:00:00Z', updated_at: '2025-10-15T00:00:00Z',
  },
  {
    id: '10', organization_id: 'demo',
    nome: 'Cultura de Agilidade Corporativa',
    descricao: 'Programa de transformação ágil com certificações, squads multidisciplinares e novos rituais de gestão',
    beneficios: 'Aumento de 50% na velocidade de entrega de projetos e melhoria no índice de engajamento dos colaboradores',
    riscos: 'Resistência da liderança média à mudança de processos',
    pct_evolucao: 73, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Ana Lima',
    data_inicio: '2025-08-01', data_fim_prevista: '2026-08-31',
    created_at: '2025-08-01T00:00:00Z', updated_at: '2025-08-01T00:00:00Z',
  },
]

export interface DemoUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

const INITIAL_USERS: DemoUser[] = [
  { id: 'u1', name: 'Davi de Paula', email: 'davi@portfoliopmo.com.br', role: 'admin' },
  { id: 'u2', name: 'Ana Lima', email: 'ana.lima@portfoliopmo.com.br', role: 'editor' },
  { id: 'u3', name: 'Rafael Monteiro', email: 'rafael.monteiro@portfoliopmo.com.br', role: 'editor' },
  { id: 'u4', name: 'Fernanda Costa', email: 'fernanda.costa@portfoliopmo.com.br', role: 'viewer' },
  { id: 'u5', name: 'Larissa Campos', email: 'larissa.campos@portfoliopmo.com.br', role: 'viewer' },
]

type ProjectInput = Omit<Project, 'id' | 'organization_id' | 'created_at' | 'updated_at'>

interface DemoContextType {
  projects: Project[]
  users: DemoUser[]
  selectedYear: number
  setSelectedYear: (year: number) => void
  addProject: (data: ProjectInput) => void
  updateProject: (id: string, data: ProjectInput) => void
  deleteProject: (id: string) => void
  addUser: (user: Omit<DemoUser, 'id'>) => void
  removeUser: (id: string) => void
  updateUserRole: (id: string, role: DemoUser['role']) => void
  resetDemo: () => void
}

const DemoContext = createContext<DemoContextType | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_USERS)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  // Carrega do localStorage
  useEffect(() => {
    const savedProjects = localStorage.getItem('demo_projects')
    const savedUsers = localStorage.getItem('demo_users')
    if (savedProjects) setProjects(JSON.parse(savedProjects))
    if (savedUsers) setUsers(JSON.parse(savedUsers))
  }, [])

  // Salva no localStorage a cada mudança
  useEffect(() => { localStorage.setItem('demo_projects', JSON.stringify(projects)) }, [projects])
  useEffect(() => { localStorage.setItem('demo_users', JSON.stringify(users)) }, [users])

  const addProject = useCallback((data: ProjectInput) => {
    const now = new Date().toISOString()
    setProjects(prev => [{ ...data, id: crypto.randomUUID(), organization_id: 'demo', created_at: now, updated_at: now }, ...prev])
  }, [])

  const updateProject = useCallback((id: string, data: ProjectInput) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...data, updated_at: new Date().toISOString() } : p))
  }, [])

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id))
  }, [])

  const addUser = useCallback((user: Omit<DemoUser, 'id'>) => {
    setUsers(prev => [...prev, { ...user, id: crypto.randomUUID() }])
  }, [])

  const removeUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id))
  }, [])

  const updateUserRole = useCallback((id: string, role: DemoUser['role']) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u))
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem('demo_projects')
    localStorage.removeItem('demo_users')
    setProjects(INITIAL_PROJECTS)
    setUsers(INITIAL_USERS)
  }, [])

  return (
    <DemoContext.Provider value={{ projects, users, selectedYear, setSelectedYear, addProject, updateProject, deleteProject, addUser, removeUser, updateUserRole, resetDemo }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemoContext must be used within DemoProvider')
  return ctx
}
