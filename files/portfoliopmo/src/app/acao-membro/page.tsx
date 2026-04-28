// src/app/acao-membro/page.tsx
// Página acionada pelo link de e-mail enviado ao admin.
// Permite aprovar ou rejeitar um membro com um clique.

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { approveMember, rejectMember } from '@/lib/actions'

interface Props {
  searchParams: Promise<{ action?: string; id?: string }>
}

export default async function AcaoMembroPage({ searchParams }: Props) {
  const { action, id } = await searchParams

  // Valida os parâmetros
  if (!id || !action || !['approve', 'reject'].includes(action)) {
    redirect('/configuracoes')
  }

  // Verifica autenticação
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Não está logado — mostra instrução para fazer login primeiro
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">🔒</div>
          <h1 className="text-xl font-semibold mb-3">Login necessário</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>
            Você precisa estar logado como administrador para executar esta ação.
          </p>
          <a
            href={`/login`}
            className="inline-block px-6 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}
          >
            Fazer login
          </a>
          <p className="text-xs mt-4" style={{ color: 'var(--text3)' }}>
            Após o login, abra o link do e-mail novamente para executar a ação.
          </p>
        </div>
      </div>
    )
  }

  // Verifica se é admin ativo via service client
  let isAdmin = false
  let targetMember: { nome: string | null; status: string } | null = null

  try {
    const service = createServiceClient()

    const { data: callerMember } = await service
      .from('organization_members')
      .select('role, status')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1)
      .maybeSingle()

    isAdmin = callerMember?.role === 'admin'

    if (isAdmin) {
      const { data } = await service
        .from('organization_members')
        .select('nome, status')
        .eq('id', id)
        .maybeSingle()
      targetMember = data
    }
  } catch { /* service client unavailable */ }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">🚫</div>
          <h1 className="text-xl font-semibold mb-3">Sem permissão</h1>
          <p className="text-sm" style={{ color: 'var(--text2)' }}>
            Apenas administradores ativos podem aprovar ou rejeitar membros.
          </p>
        </div>
      </div>
    )
  }

  // Membro já foi processado anteriormente
  if (!targetMember || targetMember.status !== 'pending_approval') {
    const alreadyDone = !targetMember
      ? 'Solicitação não encontrada.'
      : targetMember.status === 'active'
        ? 'Este usuário já foi aprovado.'
        : 'Este usuário já foi rejeitado.'

    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: 'var(--bg)' }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-6">ℹ️</div>
          <h1 className="text-xl font-semibold mb-3">Ação já executada</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>{alreadyDone}</p>
          <a href="/configuracoes" className="text-sm underline" style={{ color: 'var(--accent2)' }}>
            Ir para Configurações
          </a>
        </div>
      </div>
    )
  }

  // Executa a ação e redireciona
  const isApprove = action === 'approve'

  async function executar() {
    'use server'
    if (action === 'approve') {
      await approveMember(id!)
    } else {
      await rejectMember(id!)
    }
    redirect('/configuracoes')
  }

  const nomeExibido = targetMember.nome ?? 'este usuário'

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">{isApprove ? '✅' : '❌'}</div>
          <h1 className="text-xl font-semibold">
            {isApprove ? 'Aprovar acesso' : 'Rejeitar solicitação'}
          </h1>
          <p className="text-sm mt-2" style={{ color: 'var(--text2)' }}>
            {isApprove
              ? `Confirma a aprovação de acesso para ${nomeExibido}?`
              : `Confirma a rejeição da solicitação de ${nomeExibido}?`}
          </p>
        </div>

        <div
          className="rounded-xl border p-6 space-y-4"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <form action={executar}>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity"
              style={{ background: isApprove ? '#22c55e' : '#ef4444' }}
            >
              {isApprove ? 'Sim, aprovar acesso' : 'Sim, rejeitar solicitação'}
            </button>
          </form>

          <a
            href="/configuracoes"
            className="block text-center text-sm py-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text2)' }}
          >
            Cancelar
          </a>
        </div>
      </div>
    </div>
  )
}
