'use client'
// src/app/aguardando-aprovacao/page.tsx
// Shown to users who have registered but are pending admin approval (or rejected).

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/lib/actions'

type Status = 'pending_approval' | 'active' | 'rejected' | null

export default function AguardandoAprovacaoPage() {
  const [status, setStatus]   = useState<Status>(null)
  const [nome, setNome]       = useState<string | null>(null)
  const [email, setEmail]     = useState<string | null>(null)
  const [checking, setChecking] = useState(false)

  async function checkStatus() {
    setChecking(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    setEmail(user.email ?? null)

    const { data: member } = await supabase
      .from('organization_members')
      .select('status, nome')
      .eq('user_id', user.id)
      .single()

    if (!member) { window.location.href = '/onboarding'; return }

    setStatus(member.status as Status)
    setNome(member.nome ?? null)

    // If now active, redirect to the app
    if (member.status === 'active') {
      window.location.href = '/dashboard'
    }
    setChecking(false)
  }

  useEffect(() => { checkStatus() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isPending  = status === 'pending_approval'
  const isRejected = status === 'rejected'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-md text-center">
        {/* Icon */}
        <div className="text-6xl mb-6">
          {isRejected ? '🚫' : '⏳'}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-semibold tracking-tight mb-2">
          {isRejected ? 'Acesso não autorizado' : 'Aguardando aprovação'}
        </h1>

        {/* Body */}
        <div
          className="rounded-xl border p-6 mb-6 text-left space-y-3"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          {nome && (
            <p className="text-sm">
              <span style={{ color: 'var(--text2)' }}>Nome: </span>
              <span className="font-medium">{nome}</span>
            </p>
          )}
          {email && (
            <p className="text-sm">
              <span style={{ color: 'var(--text2)' }}>E-mail: </span>
              <span className="font-medium">{email}</span>
            </p>
          )}

          <div
            className="rounded-lg px-4 py-3 text-sm leading-relaxed"
            style={{
              background: isRejected
                ? 'rgba(239,68,68,0.08)'
                : 'rgba(99,102,241,0.08)',
              color: isRejected ? '#ef4444' : 'var(--text)',
              border: `1px solid ${isRejected ? 'rgba(239,68,68,0.2)' : 'rgba(99,102,241,0.2)'}`,
            }}
          >
            {isRejected ? (
              <>
                Sua solicitação de acesso foi recusada por um administrador.
                <br />
                Entre em contato com sua equipe de TI para mais informações.
              </>
            ) : (
              <>
                Seu cadastro foi recebido e aguarda a aprovação de um
                administrador. Você receberá acesso assim que sua solicitação
                for aprovada.
                <br /><br />
                Verifique também se confirmou o link enviado ao seu e-mail.
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {!isRejected && (
            <button
              onClick={checkStatus}
              disabled={checking}
              className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50"
              style={{
                background: 'var(--accent)',
                color: '#fff',
              }}
            >
              {checking ? 'Verificando...' : 'Verificar status'}
            </button>
          )}

          <form action={signOut}>
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg text-sm border transition-colors"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text2)',
                background: 'transparent',
              }}
            >
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
