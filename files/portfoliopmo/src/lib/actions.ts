// src/lib/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
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

  // 3. Create (or locate) the Supabase Auth user via the admin API.
  //    Using service.auth.admin.createUser() is fully session-independent —
  //    no cookies, no risk of contamination from a logged-in admin.
  //    email_confirm: true skips the email verification step; admin approval
  //    is the security gate for this application.
  const service0 = createServiceClient()
  let userId: string | null = null

  const { data: newUser, error: createError } = await service0.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (createError) {
    // User already exists → look up their ID
    const alreadyExists =
      createError.message.toLowerCase().includes('already') ||
      createError.status === 422
    if (!alreadyExists) {
      console.error('[signUp] admin.createUser error:', createError)
      return { error: createError.message }
    }
    const { data: foundId } = await service0.rpc('get_user_id_by_email', { user_email: email })
    userId = (foundId as string | null) ?? null
    if (!userId) {
      console.error('[signUp] get_user_id_by_email returned null for', email)
      return { error: null }
    }
  } else {
    userId = newUser.user?.id ?? null
  }

  console.log('[signUp] resolved userId:', userId, 'for email:', email)

  if (!userId) return { error: 'Erro ao criar usuário. Tente novamente.' }

  // 4. Insert organization_members record with pending_approval status.
  //    We use the service-role client because the user has no session yet
  //    (email not confirmed) and RLS would block the insert.
  const orgSlug = process.env.DEFAULT_ORG_SLUG
  if (!orgSlug) {
    return { error: null }
  }

  try {
    const { data: org } = await service0
      .from('organizations')
      .select('id')
      .eq('slug', orgSlug)
      .single()

    if (!org) {
      console.error('[signUp] org not found for slug:', orgSlug)
      return { error: null }
    }

    console.log('[signUp] org.id:', org.id)

    // Guard: never overwrite an already-active membership
    const { data: existing } = await service0
      .from('organization_members')
      .select('id, status')
      .eq('organization_id', org.id)
      .eq('user_id', userId)
      .maybeSingle()

    console.log('[signUp] existing membership:', existing)

    if (existing?.status === 'active') {
      return { error: null }
    }

    // Insert or restore a pending membership
    const { data: upsertedMember, error: insertError } = await service0
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

    if (insertError) {
      console.error('[signUp] upsert error:', insertError)
      return { error: insertError.message }
    }

    console.log('[signUp] upsertedMember:', upsertedMember)

    const memberId = upsertedMember?.id as string | undefined

    // Notify all admins of the new pending request
    const { data: adminRows } = await service0
      .from('organization_members')
      .select('user_id')
      .eq('organization_id', org.id)
      .eq('role', 'admin')
      .eq('status', 'active')

    if (adminRows && adminRows.length > 0) {
      const adminUserIds = adminRows.map(r => r.user_id as string)
      // Fetch admin emails via the auth schema (service client only)
      const adminEmailPromises = adminUserIds.map(uid =>
        service0.auth.admin.getUserById(uid)
      )
      const adminResults = await Promise.allSettled(adminEmailPromises)
      const adminEmails = adminResults
        .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof service0.auth.admin.getUserById>>> =>
          r.status === 'fulfilled' && !!r.value.data?.user?.email
        )
        .map(r => r.value.data.user!.email as string)

      console.log('[signUp] adminEmails to notify:', adminEmails)

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

// ─── Auth: Criar Membro (admin cria usuário com senha temporária) ─────────────

export async function createMember(opts: {
  email: string
  password: string
  nome: string
  role: 'viewer' | 'editor' | 'admin'
}): Promise<{ error: string | null }> {
  const orgId = await getOrganizationId()
  if (!orgId) return { error: 'Organização não encontrada' }

  const service = createServiceClient()

  // Create (or locate) the auth user
  let userId: string | null = null
  const { data: newUser, error: createError } = await service.auth.admin.createUser({
    email: opts.email,
    password: opts.password,
    email_confirm: true,
  })

  if (createError) {
    const alreadyExists =
      createError.message.toLowerCase().includes('already') || createError.status === 422
    if (!alreadyExists) return { error: createError.message }
    const { data: foundId } = await service.rpc('get_user_id_by_email', { user_email: opts.email })
    userId = (foundId as string | null) ?? null
    if (!userId) return { error: 'Usuário não encontrado.' }
  } else {
    userId = newUser.user?.id ?? null
  }

  if (!userId) return { error: 'Erro ao criar usuário.' }

  // Guard: never downgrade an existing active admin
  const { data: existing } = await service
    .from('organization_members')
    .select('id, status, role')
    .eq('organization_id', orgId)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing?.status === 'active' && existing.role === 'admin' && opts.role !== 'admin') {
    return { error: 'Não é possível alterar o papel de um administrador ativo.' }
  }

  const { error: upsertError } = await service
    .from('organization_members')
    .upsert(
      {
        organization_id: orgId,
        user_id: userId,
        nome: opts.nome.trim(),
        role: opts.role,
        status: 'active',
        must_change_password: true,
      },
      { onConflict: 'organization_id,user_id', ignoreDuplicates: false }
    )

  if (upsertError) return { error: upsertError.message }

  revalidatePath('/configuracoes')
  return { error: null }
}

// ─── Auth: Limpar flag de senha temporária ────────────────────────────────────

export async function clearMustChangePassword(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const service = createServiceClient()
  await service
    .from('organization_members')
    .update({ must_change_password: false })
    .eq('user_id', user.id)
}

// ─── Auth: Logout ────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
