'use client'
// src/app/demo/configuracoes/page.tsx

import { useState } from 'react'
import { useDemoContext } from '../context'
import type { DemoUser } from '../context'
import { ConfirmModal } from '../_components/ConfirmModal'
import { useToast } from '../_components/Toast'
import { Breadcrumb } from '../_components/Breadcrumb'

const ROLE_LABELS: Record<DemoUser['role'], string> = {
  admin:  'Administrador',
  editor: 'Editor',
  viewer: 'Visualizador',
}

const ROLE_COLORS: Record<DemoUser['role'], { bg: string; color: string }> = {
  admin:  { bg: 'rgba(99,102,241,0.12)',  color: '#818cf8' },
  editor: { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e' },
  viewer: { bg: 'rgba(156,163,175,0.12)', color: '#9ca3af' },
}

export default function DemoConfiguracoesPage() {
  const { users, addUser, removeUser, updateUserRole, resetDemo } = useDemoContext()
  const { showToast } = useToast()

  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newRole, setNewRole] = useState<DemoUser['role']>('viewer')
  const [error, setError] = useState('')

  // Confirm states
  const [pendingRoleChange, setPendingRoleChange] = useState<{ id: string; name: string; role: DemoUser['role'] } | null>(null)
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim() || !newEmail.trim()) { setError('Preencha nome e e-mail.'); return }
    if (users.some(u => u.email === newEmail.trim())) { setError('Este e-mail já está cadastrado.'); return }
    addUser({ name: newName.trim(), email: newEmail.trim(), role: newRole })
    setNewName(''); setNewEmail(''); setNewRole('viewer'); setError(''); setShowForm(false)
  }

  function handleRemoveRequest(id: string, name: string) {
    const isAdmin = users.find(u => u.id === id)?.role === 'admin'
    const adminCount = users.filter(u => u.role === 'admin').length
    if (isAdmin && adminCount <= 1) {
      showToast('Não é possível remover o último administrador.', 'error')
      return
    }
    setPendingRemove({ id, name })
  }

  function confirmRemove() {
    if (!pendingRemove) return
    removeUser(pendingRemove.id)
    showToast('Usuário removido', 'info')
    setPendingRemove(null)
  }

  function handleRoleChangeRequest(id: string, name: string, role: DemoUser['role']) {
    setPendingRoleChange({ id, name, role })
  }

  function confirmRoleChange() {
    if (!pendingRoleChange) return
    updateUserRole(pendingRoleChange.id, pendingRoleChange.role)
    showToast(`Perfil de ${pendingRoleChange.name} atualizado`, 'success')
    setPendingRoleChange(null)
  }

  function handleResetDemo() {
    resetDemo()
    showToast('Dados restaurados para o estado inicial', 'info')
    setConfirmReset(false)
  }

  const inputCls = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-7">
        <Breadcrumb />
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Gerencie usuários e acessos da organização</p>
      </div>

      {/* Membros */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">👥 Membros da Organização</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono"
            style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>{users.length} membros</span>
        </div>

        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {users.map(user => {
            const rc = ROLE_COLORS[user.role]
            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-4">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                  style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{user.email}</p>
                </div>

                {/* Role selector */}
                <select
                  value={user.role}
                  onChange={e => handleRoleChangeRequest(user.id, user.name, e.target.value as DemoUser['role'])}
                  className="text-xs px-2.5 py-1.5 rounded-lg border outline-none"
                  style={{ background: rc.bg, color: rc.color, borderColor: 'transparent' }}>
                  <option value="admin">Administrador</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Visualizador</option>
                </select>

                {/* Remove */}
                <button onClick={() => handleRemoveRequest(user.id, user.name)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-red-500/10"
                  style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                  Remover
                </button>
              </div>
            )
          })}
        </div>

        {/* Adicionar membro */}
        <div className="px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          {!showForm ? (
            <button onClick={() => setShowForm(true)}
              className="text-sm flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
              + Convidar membro
            </button>
          ) : (
            <form onSubmit={handleAdd} className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text3)' }}>Novo membro</p>
              <div className="grid grid-cols-2 gap-3">
                <input value={newName} onChange={e => setNewName(e.target.value)}
                  placeholder="Nome completo" className={inputCls} style={inputStyle} />
                <input value={newEmail} onChange={e => setNewEmail(e.target.value)}
                  placeholder="E-mail" type="email" className={inputCls} style={inputStyle} />
              </div>
              <div className="flex items-center gap-3">
                <select value={newRole} onChange={e => setNewRole(e.target.value as DemoUser['role'])}
                  className={inputCls + ' flex-1'} style={inputStyle}>
                  <option value="admin">Administrador — acesso total</option>
                  <option value="editor">Editor — pode criar e editar projetos</option>
                  <option value="viewer">Visualizador — somente leitura</option>
                </select>
              </div>
              {error && <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>}
              <div className="flex gap-2">
                <button type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-white"
                  style={{ background: 'var(--accent)' }}>
                  Adicionar
                </button>
                <button type="button" onClick={() => { setShowForm(false); setError('') }}
                  className="px-4 py-2 rounded-lg text-sm border"
                  style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Legenda de permissões */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">🔐 Permissões por Perfil</span>
        </div>
        <div className="p-5">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="text-left pb-3 text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text3)' }}>Permissão</th>
                {(['admin', 'editor', 'viewer'] as const).map(r => (
                  <th key={r} className="pb-3 text-xs font-medium uppercase tracking-wider text-center" style={{ color: 'var(--text3)' }}>
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {[
                ['Visualizar projetos e dashboard', true, true, true],
                ['Criar e editar projetos', true, true, false],
                ['Excluir projetos', true, false, false],
                ['Convidar membros', true, false, false],
                ['Remover membros', true, false, false],
                ['Alterar perfis de acesso', true, false, false],
              ].map(([label, admin, editor, viewer]) => (
                <tr key={label as string}>
                  <td className="py-2.5 text-sm" style={{ color: 'var(--text2)' }}>{label as string}</td>
                  {[admin, editor, viewer].map((v, i) => (
                    <td key={i} className="py-2.5 text-center">
                      {v ? <span style={{ color: '#22c55e' }}>✓</span> : <span style={{ color: 'var(--text3)' }}>–</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Zona de perigo — Restaurar dados */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'rgba(239,68,68,0.4)' }}>
        <div className="px-5 py-4 border-b" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <span className="text-sm font-medium" style={{ color: '#ef4444' }}>⚠ Zona de Perigo</span>
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Restaurar dados de demonstração</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text3)' }}>
                Remove todas as alterações feitas durante a demonstração e restaura os projetos e usuários para o estado inicial. Esta ação não pode ser desfeita.
              </p>
            </div>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-red-500/10"
              style={{ borderColor: 'rgba(239,68,68,0.5)', color: '#ef4444' }}
            >
              Restaurar dados
            </button>
          </div>
        </div>
      </div>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={pendingRoleChange !== null}
        title="Alterar perfil de acesso"
        message={pendingRoleChange
          ? `Alterar o perfil de "${pendingRoleChange.name}" para "${ROLE_LABELS[pendingRoleChange.role]}"?`
          : ''}
        confirmLabel="Confirmar alteração"
        onConfirm={confirmRoleChange}
        onCancel={() => setPendingRoleChange(null)}
      />

      <ConfirmModal
        isOpen={pendingRemove !== null}
        title="Remover membro"
        message={pendingRemove ? `Remover "${pendingRemove.name}" da organização? Ele perderá todo o acesso.` : ''}
        confirmLabel="Remover"
        danger
        onConfirm={confirmRemove}
        onCancel={() => setPendingRemove(null)}
      />

      <ConfirmModal
        isOpen={confirmReset}
        title="Restaurar dados de demonstração"
        message="Todos os projetos e usuários serão restaurados para o estado inicial. Qualquer alteração feita durante a demonstração será perdida. Esta ação não pode ser desfeita."
        confirmLabel="Restaurar dados"
        danger
        onConfirm={handleResetDemo}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  )
}
