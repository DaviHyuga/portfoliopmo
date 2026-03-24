'use client'
// src/app/(app)/configuracoes/page.tsx

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { inviteMember, removeMember } from '@/lib/actions'

type Role = 'admin' | 'editor' | 'viewer'

interface Member {
  id: string
  user_id: string
  role: Role
  created_at: string
  email: string
}

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
}

const ROLE_COLORS: Record<Role, string> = {
  admin: 'rgba(99,102,241,0.15)',
  editor: 'rgba(34,197,94,0.12)',
  viewer: 'rgba(156,163,175,0.12)',
}

const ROLE_TEXT: Record<Role, string> = {
  admin: '#818cf8',
  editor: '#4ade80',
  viewer: 'var(--text3)',
}

export default function ConfiguracoesPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(true)

  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('viewer')
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  async function fetchMembers() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setCurrentUserId(user.id)

    // Busca membros via função SQL com SECURITY DEFINER (acessa auth.users)
    const { data } = await supabase
      .rpc('get_org_members_with_email') as { data: Member[] | null }

    if (data) {
      setMembers(data)
      const me = data.find((m: Member) => m.user_id === user.id)
      setCurrentRole(me?.role ?? null)
    }
    setLoading(false)
  }

  useEffect(() => { fetchMembers() }, [])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviting(true)
    setInviteError(null)
    setInviteSuccess(null)
    try {
      await inviteMember(inviteEmail, inviteRole)
      setInviteSuccess(`Convite enviado para ${inviteEmail}`)
      setInviteEmail('')
      await fetchMembers()
    } catch (err: unknown) {
      setInviteError(err instanceof Error ? err.message : 'Erro ao convidar membro')
    }
    setInviting(false)
  }

  async function handleRemove(memberId: string) {
    if (!confirm('Remover este membro da organização?')) return
    try {
      await removeMember(memberId)
      await fetchMembers()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao remover membro')
    }
  }

  const isAdmin = currentRole === 'admin'

  const inputCls = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Gerencie os membros da sua equipe
        </p>
      </div>

      {/* Membros */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Membros da Equipe</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {members.length}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-10" style={{ color: 'var(--text3)' }}>
            <p className="text-sm">Carregando...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10" style={{ color: 'var(--text3)' }}>
            <p className="text-sm">Nenhum membro encontrado</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {members.map(m => (
              <div key={m.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium"
                    style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
                    {m.email.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.email}</p>
                    {m.user_id === currentUserId && (
                      <p className="text-xs" style={{ color: 'var(--text3)' }}>Você</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                    style={{ background: ROLE_COLORS[m.role], color: ROLE_TEXT[m.role] }}>
                    {ROLE_LABELS[m.role]}
                  </span>
                  {isAdmin && m.user_id !== currentUserId && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      className="text-xs px-2.5 py-1 rounded-lg border transition-colors hover:bg-red-500/10"
                      style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                    >
                      Remover
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Convidar */}
      {isAdmin && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-medium mb-4">Convidar Membro</h2>
          <form onSubmit={handleInvite} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}>E-mail</label>
                <input
                  type="email" required value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="membro@empresa.com"
                  className={inputCls} style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}>Papel</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value as Role)}
                  className={inputCls} style={inputStyle}
                >
                  <option value="viewer">Viewer — Apenas visualizar</option>
                  <option value="editor">Editor — Criar e editar projetos</option>
                  <option value="admin">Admin — Acesso total</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg p-3 text-xs" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>
              <p className="font-medium mb-1" style={{ color: 'var(--text)' }}>Como funciona o convite:</p>
              <ol className="space-y-0.5 list-decimal list-inside">
                <li>O membro cria uma conta em <span className="font-mono">/login</span> → &quot;Cadastre-se&quot;</li>
                <li>Confirma o e-mail recebido</li>
                <li>Você convida aqui com o e-mail cadastrado</li>
                <li>Ele faz login e terá acesso ao portfólio</li>
              </ol>
            </div>

            {inviteError && (
              <p className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                {inviteError}
              </p>
            )}
            {inviteSuccess && (
              <p className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
                ✓ {inviteSuccess}
              </p>
            )}

            <button
              type="submit" disabled={inviting}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {inviting ? 'Convidando...' : '+ Convidar Membro'}
            </button>
          </form>
        </div>
      )}

      {!isAdmin && (
        <div className="rounded-xl border p-5 text-center" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <p className="text-sm" style={{ color: 'var(--text3)' }}>
            Apenas administradores podem convidar novos membros.
          </p>
        </div>
      )}
    </div>
  )
}
