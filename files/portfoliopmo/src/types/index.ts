// src/types/index.ts

export type Farol = 'verde' | 'amarelo' | 'vermelho' | 'azul'
export type Natureza = 'backoffice' | 'regulatorio' | 'negocios' | 'regional'
export type Desvio = 'escopo' | 'prazo' | 'risco'

export interface Project {
  id: string
  organization_id: string
  nome: string
  descricao: string | null
  beneficios: string | null
  pct_evolucao: number
  farol: Farol
  natureza: Natureza
  desvios: Desvio[]
  responsavel: string | null
  data_inicio: string | null
  data_fim_prevista: string | null
  created_at: string
  updated_at: string
}

export interface ProjectSnapshot {
  id: string
  project_id: string
  pct_evolucao: number
  farol: Farol
  snapshot_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  created_at: string
}

export interface DashboardStats {
  total: number
  mediaEvolucao: number
  porFarol: Record<Farol, number>
  porNatureza: Record<Natureza, number>
  criticos: Project[]
  emRisco: Project[]
}

export const FAROL_LABELS: Record<Farol, string> = {
  verde: 'No prazo',
  amarelo: 'Risco de atraso',
  vermelho: 'Atrasado/Pausado',
  azul: 'Concluído',
}

export const NATUREZA_LABELS: Record<Natureza, string> = {
  backoffice: 'Backoffice',
  regulatorio: 'Regulatório',
  negocios: 'Negócios',
  regional: 'Regional',
}

export const FAROL_COLORS: Record<Farol, string> = {
  verde: '#22c55e',
  amarelo: '#f59e0b',
  vermelho: '#ef4444',
  azul: '#3b82f6',
}
