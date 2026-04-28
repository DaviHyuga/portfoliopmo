// src/lib/projects.ts
// Funções de acesso a dados — usadas nas Server Actions e API Routes

import { createClient } from './supabase/server'
import { createServiceClient } from './supabase/service'
import type { Project, DashboardStats, Farol, Natureza, WeeklyStatus } from '@/types'

// Returns a service-role client with a safe fallback to the anon client.
// The service client bypasses RLS; access is scoped by passing orgId / userId
// explicitly in every query — never expose this client to the browser.
function getServerQueryClient() {
  try {
    return createServiceClient()
  } catch {
    return createClient()
  }
}

export async function getOrganizationId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Use service client to bypass RLS entirely — auth.uid() propagation
  // to PostgreSQL is unreliable in Next.js SSR on Vercel.
  try {
    const service = createServiceClient()
    const { data } = await service
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()
    if (data?.organization_id) return data.organization_id
  } catch { /* fall through to RPC */ }

  // Fallback: RPC if service client unavailable
  const { data: rows } = await supabase.rpc('get_my_membership')
  return (rows as { organization_id: string }[] | null)?.[0]?.organization_id ?? null
}

export async function getProjects(): Promise<Project[]> {
  const orgId = await getOrganizationId()
  if (!orgId) return []

  const db = getServerQueryClient()
  const { data } = await db
    .from('projects')
    .select('*')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

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

export async function getWeeklyStatuses(weekStart?: string): Promise<WeeklyStatus[]> {
  const orgId = await getOrganizationId()
  if (!orgId) return []

  const db = getServerQueryClient()

  // Get project IDs for this org
  const { data: projectRows } = await db
    .from('projects')
    .select('id')
    .eq('organization_id', orgId)

  const projectIds = (projectRows ?? []).map(p => p.id)
  if (projectIds.length === 0) return []

  let query = db
    .from('weekly_statuses')
    .select('*')
    .in('project_id', projectIds)
    .order('week_start', { ascending: false })

  if (weekStart) query = query.eq('week_start', weekStart)

  const { data, error } = await query
  // Retorna vazio se a tabela ainda não existe (migration pendente)
  if (error) return []
  return (data ?? []) as WeeklyStatus[]
}
