// src/lib/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { createServiceClient } from './supabase/service'
import { getOrganizationId } from './projects'
import {
  sendPendingApprovalNotification,
  sendApprovedEmail,
  sendRejectedEmail,
} from './email'
import type { Farol, Natureza, Desvio } from '@/types'

function isStrongPassword(password: string): boolean {
  // Minimum 8 chars, at least 1 uppercase letter, 1 digit
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password)
  )
}

// ─── Criar / Atualizar Projeto ───────────────────────────────────────────────

export async function upsertProject(formData: FormData) {
  const supabase = createClient()
  const orgId = await getOrganizationId()
  if (!orgId) throw new Error('Organização não encontrada')

  const id = formData.get('id') as string | null
  const desvios: Desvio[] = []
  if (formData.get('d_escopo')) desvios.push('escopo')
  if (formData.get('d_prazo')) desvios.push('prazo')
  if (formData.get('d_risco')) desvios.push('risco')

  const payload = {
    organization_id: orgId,
    nome: formData.get('nome') as string,
    descricao: (formData.get('descricao') as string) || null,
    beneficios: (formData.get('beneficios') as string) || null,
    pct_evolucao: parseInt(formData.get('pct_evolucao') as string) || 0,
    farol: formData.get('farol') as Farol,
    natureza: formData.get('natureza') as Natureza,
    desvios,
    responsavel: (formData.get('responsavel') as string) || null,
    data_inicio: (formData.get('data_inicio') as string) || null,
    data_fim_prevista: (formData.get('data_fim_prevista') as string) || null,
    riscos: (formData.get('riscos') as string) || null,
  }

  if (id) {
    const { error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
    if (error) throw new Error(error.message)
  } else {
    const { error } = await supabase
      .from('projects')
      .insert(payload)
    if (error) throw new Error(error.message)
  }

  revalidatePath('/dashboard')
  revalidatePath('/projetos')
  redirect('/projetos')
}

// ─── Deletar Projeto ─────────────────────────────────────────────────────────

export async function deleteProject(id: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/projetos')
}

// ─── Criar Organização ───────────────────────────────────────────────────────

export async function createOrganization(name: string, slug: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data, error } = await supabase.rpc('create_organization', {
    org_name: name,
    org_slug: slug,
    p_user_id: user.id,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath('/projetos')
  return data as string
}

// ─── Convidar Membro ─────────────────────────────────────────────────────────

export async function inviteMember(email: string, role: 'admin' | 'editor' | 'viewer') {
  const supabase = createClient()
  const orgId = await getOrganizationId()
  if (!orgId) throw new Error('Organização não encontrada')

  // Busca o user_id pelo email via função SQL com SECURITY DEFINER
  const { data: userId, error: lookupError } = await supabase
    .rpc('get_user_id_by_email', { user_email: email })

  if (lookupError || !userId) {
    throw new Error('Usuário não encontrado. Peça para ele criar uma conta primeiro.')
  }

  const { error } = await supabase
    .from('organization_members')
    .insert({ organization_id: orgId, user_id: userId, role })

  if (error) {
    if (error.code === '23505') throw new Error('Este usuário já é membro da organização.')
    throw new Error(error.message)
  }
  revalidatePath('/configuracoes')
}

// ─── Remover Membro ──────────────────────────────────────────────────────────

export async function removeMember(memberId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from('organization_members')
    .delete()
    .eq('id', memberId)

  if (error) throw new Error(error.message)
  revalidatePath('/configuracoes')
}

// ─── Status Recorrente ────────────────────────────────────────────────────────

export async function upsertWeeklyStatus(
  projectId: string,
  weekStart: string,
  data: { progresso?: string; proximos_passos?: string; riscos?: string; acoes_mitigacao?: string }
) {
  const supabase = createClient()
  const now = new Date().toISOString()

  // Verifica se já existe registro para este projeto/semana
  const { data: existing, error: selectError } = await supabase
    .from('weekly_statuses')
    .select('id')
    .eq('project_id', projectId)
    .eq('week_start', weekStart)
    .maybeSingle()

  if (selectError) throw new Error(selectError.message)

  if (existing) {
    // UPDATE parcial — só os campos fornecidos (preserva os demais)
    const updates: Record<string, string> = { updated_at: now }
    if (data.progresso       !== undefined) updates.progresso       = data.progresso
    if (data.proximos_passos !== undefined) updates.proximos_passos = data.proximos_passos
    if (data.riscos          !== undefined) updates.riscos          = data.riscos
    if (data.acoes_mitigacao !== undefined) updates.acoes_mitigacao = data.acoes_mitigacao

    const { error } = await supabase
      .from('weekly_statuses')
      .update(updates)
      .eq('id', existing.id)

    if (error) throw new Error(error.message)
  } else {
    // INSERT — novo registro com todos os campos (não preenchidos = '')
    const { error } = await supabase
      .from('weekly_statuses')
      .insert({
        project_id:      projectId,
        week_start:      weekStart,
        progresso:       data.progresso       ?? '',
        proximos_passos: data.proximos_passos ?? '',
        riscos:          data.riscos          ?? '',
        acoes_mitigacao: data.acoes_mitigacao ?? '',
        created_at:      now,
        updated_at:      now,
      })

    if (error) throw new Error(error.message)
  }

  revalidatePath('/status-recorrente')
}

// ─── Auth: Login ─────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: error.message }
  return { error: null }
}

// ─── Auth: Registro ───────────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  nome: string,
  role: 'viewer' | 'editor' | 'admin',
  confirmPassword: string,
): Promise<{ error: string | null }> {
  // 1. Password rules
  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }
  if (!isStrongPassword(password)) {
    return { error: 'Senha fraca. Use no mínimo 8 caracteres, 1 letra maiúscula e 1 número.' }
  }

  // 3. Create the Supabase Auth user (sends verification e-mail automatically)
  const supabase = createClient()
  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })

  // Resolve the user ID — handle three scenarios:
  //  a) Fresh signup: data.user.id is set and identities is non-empty
  //  b) Existing unconfirmed user: Supabase returns user but identities=[] (no error)
  //  c) Existing confirmed user: Supabase returns "User already registered" error
  let userId: string | null = data.user?.id ?? null

  if (authError || (data.user && (data.user.identities ?? []).length === 0)) {
    // User already exists in auth.users — look up their ID via service client
    try {
      const service = createServiceClient()
      const { data: foundId } = await service.rpc('get_user_id_by_email', { user_email: email })
      userId = (foundId as string | null) ?? null
    } catch { /* ignore, userId stays null */ }

    if (!userId) {
      // Truly unrecoverable auth error
      if (authError) return { error: authError.message }
      return { error: null }
    }
  }

  if (!userId) return { error: 'Erro ao criar usuário. Tente novamente.' }

  // 4. Insert organization_members record with pending_approval status.
  //    We use the service-role client because the user has no session yet
  //    (email not confirmed) and RLS would block the insert.
  const orgSlug = process.env.DEFAULT_ORG_SLUG
  if (!orgSlug) {
    // No default org configured — user will go through /onboarding after
    // confirming email (backward-compatible behavior).
    return { error: null }
  }

  try {
    const service = createServiceClient()

    const { data: org } = await service
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    if (!org) return { error: null } // Org not yet created — onboarding flow

    // Upsert: if membership was deleted and user re-registers, restore it
    const { data: upsertedMember, error: insertError } = await service
      .from('organization_members')
      .upsert(
        {
          organization_id: org.id,
          user_id: userId,
          nome: nome.trim(),
          role,
          status: 'pending_approval',
        },
        { onConflict: 'organization_id,user_id', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (insertError) return { error: insertError.message }

    const memberId = upsertedMember?.id as string | undefined

    // Notify all admins of the new pending request
    const { data: adminRows } = await service
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', org.id)
      .eq('role', 'admin')
      .eq('status', 'active')

    if (adminRows && adminRows.length > 0) {
      const adminUserIds = adminRows.map(r => r.user_id as string)
      // Fetch admin emails via the auth schema (service client only)
      const adminEmailPromises = adminUserIds.map(uid =>
        service.auth.admin.getUserById(uid)
      )
      const adminResults = await Promise.allSettled(adminEmailPromises)
      const adminEmails = adminResults
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof service.auth.admin.getUserById>>> =>
          r.status === 'fulfilled' && !!r.value.data?.user?.email
        )
        .map(r => r.value.data.user!.email as string)

      if (adminEmails.length > 0) {
        await sendPendingApprovalNotification({
          adminEmails,
          newUserNome: nome.trim(),
          newUserEmail: email,
          requestedRole: role,
          memberId,
        })
      }
    }
  } catch {
    // Service client unavailable — user goes to onboarding as fallback
  }

  return { error: null }
}

// ─── Auth: Aprovar Membro ─────────────────────────────────────────────────────

export async function approveMember(memberId: string): Promise<{ error: string | null }> {
  const supabase = createClient()
  const { error } = await supabase.rpc('approve_member', { p_member_id: memberId })
  if (error) return { error: error.message }

  // Send approval email (fire-and-forget, never block the action)
  try {
    const service = createServiceClient()
    const { data: member } = await service
      .from('organization_members')
      .select('user_id, nome')
      .eq('id', memberId)
      .single()

    if (member) {
      const { data: authUser } = await service.auth.admin.getUserById(member.user_id)
      if (authUser?.user?.email) {
        await sendApprovedEmail(authUser.user.email, member.nome ?? null)
      }
    }
  } catch { /* email errors never block the action */ }

  revalidatePath('/configuracoes')
  return { error: null }
}

// ─── Auth: Rejeitar Membro ────────────────────────────────────────────────────

export async function rejectMember(memberId: string): Promise<{ error: string | null }> {
  const supabase = createClient()

  // Fetch member info before rejecting (after rejection, RLS may hide the row)
  let memberEmail: string | null = null
  let memberNome: string | null = null
  try {
    const service = createServiceClient()
    const { data: member } = await service
      .from('organization_members')
      .select('user_id, nome')
      .eq('id', memberId)
      .single()

    if (member) {
      const { data: authUser } = await service.auth.admin.getUserById(member.user_id)
      memberEmail = authUser?.user?.email ?? null
      memberNome = member.nome ?? null
    }
  } catch { /* ignore */ }

  const { error } = await supabase.rpc('reject_member', { p_member_id: memberId })
  if (error) return { error: error.message }

  if (memberEmail) await sendRejectedEmail(memberEmail, memberNome)

  revalidatePath('/configuracoes')
  return { error: null }
}

// ─── Auth: Logout ────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
