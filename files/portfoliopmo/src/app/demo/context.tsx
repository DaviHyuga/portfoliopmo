'use client'
// src/app/demo/context.tsx — estado global do demo com persistência em localStorage

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Project } from '@/types'

const INITIAL_PROJECTS: Project[] = [
  {
    id: '1', organization_id: 'demo',
    nome: 'Digitalização do Processo de RH',
    descricao: 'Automatização dos processos de admissão e desligamento',
    beneficios: 'Redução de 40% no tempo de processamento e eliminação de erros manuais',
    riscos: 'Dependência de aprovação de TI\nFalta de recursos técnicos especializados',
    pct_evolucao: 75, farol: 'verde', natureza: 'backoffice',
    desvios: [], responsavel: 'Ana Lima',
    data_inicio: '2026-01-10', data_fim_prevista: '2026-02-28',
    created_at: '2026-01-10T00:00:00Z', updated_at: '2026-01-10T00:00:00Z',
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
    created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
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
    created_at: '2025-11-01T00:00:00Z', updated_at: '2025-11-01T00:00:00Z',
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
    created_at: '2025-06-01T00:00:00Z', updated_at: '2025-06-01T00:00:00Z',
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
    created_at: '2026-01-15T00:00:00Z', updated_at: '2026-01-15T00:00:00Z',
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
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z',
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
    created_at: '2026-02-01T00:00:00Z', updated_at: '2026-02-01T00:00:00Z',
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
    created_at: '2026-03-01T00:00:00Z', updated_at: '2026-03-01T00:00:00Z',
  },
]

export interface DemoUser {
  id: string
  name: string
  email: string
  role: 'admin' | 'editor' | 'viewer'
}

const INITIAL_USERS: DemoUser[] = [
  { id: 'u1', name: 'Davi de Paula', email: 'davi@chubb.com', role: 'admin' },
  { id: 'u2', name: 'Ana Lima', email: 'ana.lima@chubb.com', role: 'editor' },
  { id: 'u3', name: 'Carlos Mendes', email: 'carlos.mendes@chubb.com', role: 'editor' },
  { id: 'u4', name: 'Fernanda Costa', email: 'fernanda.costa@chubb.com', role: 'viewer' },
]

type ProjectInput = Omit<Project, 'id' | 'organization_id' | 'created_at' | 'updated_at'>

interface DemoContextType {
  projects: Project[]
  users: DemoUser[]
  addProject: (data: ProjectInput) => void
  updateProject: (id: string, data: ProjectInput) => void
  deleteProject: (id: string) => void
  addUser: (user: Omit<DemoUser, 'id'>) => void
  removeUser: (id: string) => void
  updateUserRole: (id: string, role: DemoUser['role']) => void
}

const DemoContext = createContext<DemoContextType | null>(null)

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS)
  const [users, setUsers] = useState<DemoUser[]>(INITIAL_USERS)

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

  return (
    <DemoContext.Provider value={{ projects, users, addProject, updateProject, deleteProject, addUser, removeUser, updateUserRole }}>
      {children}
    </DemoContext.Provider>
  )
}

export function useDemoContext() {
  const ctx = useContext(DemoContext)
  if (!ctx) throw new Error('useDemoContext must be used within DemoProvider')
  return ctx
}
