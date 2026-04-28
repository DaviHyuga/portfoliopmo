'use client'
// src/app/alterar-senha/page.tsx
// Shown when a user logs in with a temporary password set by an admin.
// Forces them to choose a permanent password before accessing the app.

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { clearMustChangePassword } from '@/lib/actions'

function isStrongPassword(p: string) {
  return p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)
}

export default function AlterarSenhaPage() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!isStrongPassword(password)) {
      setError('Senha fraca. Use no mínimo 8 caracteres, 1 letra maiúscula e 1 número.')
      return
    }
    if (password !== confirm) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    await clearMustChangePassword()
    window.location.href = '/dashboard'
  }

  const inputCls   = 'w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500'
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🔑</div>
          <h1 className="text-xl font-semibold tracking-tight">Crie sua senha</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Você está usando uma senha temporária. Defina uma senha permanente para continuar.
          </p>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--text2)' }}
              >
                Nova senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                style={inputStyle}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                Mínimo 8 caracteres, 1 maiúscula e 1 número.
              </p>
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--text2)' }}
              >
                Confirmar nova senha
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={inputCls}
                style={inputStyle}
              />
            </div>

            {error && (
              <p
                className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--accent)' }}
            >
              {loading ? 'Salvando...' : 'Definir senha e entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
