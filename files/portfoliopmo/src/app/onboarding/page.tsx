'use client'
// src/app/onboarding/page.tsx

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganization } from '@/lib/actions'

export default function OnboardingPage() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  function toSlug(s: string) {
    return s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    setError(null)
    try {
      await createOrganization(name.trim(), toSlug(name.trim()))
      router.push('/dashboard')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar organização')
      setLoading(false)
    }
  }

  const inputCls = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🏢</div>
          <h1 className="text-xl font-semibold tracking-tight">Configure sua organização</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Este é o espaço compartilhado da sua equipe
          </p>
        </div>

        <div className="rounded-xl border p-6" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                style={{ color: 'var(--text2)' }}>
                Nome da Empresa / Organização
              </label>
              <input
                type="text" required value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Acme Corp"
                className={inputCls} style={inputStyle}
              />
              {name && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--text3)' }}>
                  URL: portfoliopmo.vercel.app/{toSlug(name)}
                </p>
              )}
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg"
                style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                {error}
              </p>
            )}

            <button
              type="submit" disabled={loading || !name.trim()}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
              style={{ background: 'var(--accent)' }}>
              {loading ? 'Criando...' : 'Criar organização e continuar →'}
            </button>
          </form>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--text3)' }}>
          Você será o administrador. Poderá convidar sua equipe depois.
        </p>
      </div>
    </div>
  )
}
