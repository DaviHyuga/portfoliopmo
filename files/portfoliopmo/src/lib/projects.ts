// src/lib/projects.ts
// Funções de acesso a dados — usadas nas Server Actions e API Routes

import { createClient } from './supabase/server'
import type { Project, DashboardStats, Farol, Natureza } from '@/types'

export async function getOrganizationId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()

  return data?.organization_id ?? null
}

export async function getProjects(): Promise<Project[]> {
  const supabase = createClient()
  const orgId = await getOrganizationId()
  if (!orgId) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) return null
  return data as Project
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const projects = await getProjects()
  const total = projects.length
  const mediaEvolucao = total > 0
    ? Math.round(projects.reduce((a, p) => a + p.pct_evolucao, 0) / total)
    : 0

  const porFarol = { verde: 0, amarelo: 0, vermelho: 0, azul: 0 } as Record<Farol, number>
  const porNatureza = { backoffice: 0, regulatorio: 0, negocios: 0, regional: 0 } as Record<Natureza, number>

  projects.forEach(p => {
    porFarol[p.farol]++
    porNatureza[p.natureza]++
  })

  return {
    total,
    mediaEvolucao,
    porFarol,
    porNatureza,
    criticos: projects.filter(p => p.farol === 'vermelho'),
    emRisco: projects.filter(p => p.farol === 'amarelo'),
  }
}

export async function getProjectHistory(projectId: string) {
  const supabase = createClient()
  const { data } = await supabase
    .from('project_snapshots')
    .select('*')
    .eq('project_id', projectId)
    .order('snapshot_at', { ascending: true })
    .limit(30)

  return data ?? []
}
