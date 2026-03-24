// src/lib/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from './supabase/server'
import { getOrganizationId } from './projects'
import type { Farol, Natureza, Desvio } from '@/types'

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
  }

  if (id) {
    const { error } = await supabase
      .from('projects')
      .update(payload)
      .eq('id', id)
    if (error) throw error
  } else {
    const { error } = await supabase
      .from('projects')
      .insert(payload)
    if (error) throw error
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

  if (error) throw error
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

  if (error) throw error
  revalidatePath('/')
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
    throw error
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

  if (error) throw error
  revalidatePath('/configuracoes')
}

// ─── Auth: Login ─────────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  redirect('/dashboard')
}

// ─── Auth: Registro ───────────────────────────────────────────────────────────

export async function signUp(email: string, password: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
  if (error) throw error
}

// ─── Auth: Logout ────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
