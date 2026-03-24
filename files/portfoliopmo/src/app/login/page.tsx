'use client'
// src/app/login/page.tsx

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const supabase = createClient()

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else router.push('/dashboard')
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) setError(error.message)
      else setSuccess('Verifique seu e-mail para confirmar o cadastro.')
    }
    setLoading(false)
  }

  const inputCls = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            📊
          </div>
          <h1 className="text-xl font-semibold tracking-tight">PortfolioPMO</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {mode === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border p-6" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          {success ? (
            <div className="text-center py-4">
              <div className="text-3xl mb-3">✉️</div>
              <p className="text-sm font-medium mb-1">E-mail enviado!</p>
              <p className="text-xs" style={{ color: 'var(--text2)' }}>{success}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}>E-mail</label>
                <input
                  type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className={inputCls} style={inputStyle}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}>Senha</label>
                <input
                  type="password" required value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputCls} style={inputStyle}
                />
              </div>

              {error && (
                <p className="text-xs px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  {error}
                </p>
              )}

              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
                style={{ background: 'var(--accent)' }}>
                {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar' : 'Criar conta'}
              </button>
            </form>
          )}
        </div>

        {/* Toggle */}
        <p className="text-center text-sm mt-4" style={{ color: 'var(--text2)' }}>
          {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
          <button
            onClick={() => { setMode(m => m === 'login' ? 'signup' : 'login'); setError(null) }}
            className="font-medium" style={{ color: 'var(--accent2)' }}>
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </p>
      </div>
    </div>
  )
}
