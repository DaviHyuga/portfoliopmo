'use client'
// src/app/login/page.tsx

import { useState } from 'react'
import { signIn, signUp } from '@/lib/actions'

type Mode = 'login' | 'signup'
type Role = 'viewer' | 'editor' | 'admin'

const ALLOWED_DOMAINS = ['@fourd.com.br', '@chubb.com']
const EXCEPTION_EMAILS = ['davidepaula567@gmail.com']

function isEmailAllowed(email: string): boolean {
  const lower = email.toLowerCase()
  if (EXCEPTION_EMAILS.includes(lower)) return true
  return ALLOWED_DOMAINS.some(d => lower.endsWith(d))
}

function isStrongPassword(p: string): boolean {
  return p.length >= 8 && /[A-Z]/.test(p) && /[0-9]/.test(p)
}

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('login')

  // shared
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [success, setSuccess]   = useState<string | null>(null)

  // signup-only
  const [nome, setNome]                   = useState('')
  const [confirmPassword, setConfirm]     = useState('')
  const [role, setRole]                   = useState<Role>('viewer')

  function reset() {
    setError(null)
    setSuccess(null)
  }

  function switchMode(next: Mode) {
    setMode(next)
    reset()
  }

  // ── Frontend validations for signup ──────────────────────────────────────────
  function validateSignup(): string | null {
    if (!nome.trim()) return 'Informe seu nome.'
    if (!isEmailAllowed(email)) {
      return 'Cadastro permitido apenas para e-mails @fourd.com.br ou @chubb.com.'
    }
    if (!isStrongPassword(password)) {
      return 'Senha fraca. Use no mínimo 8 caracteres, 1 letra maiúscula e 1 número.'
    }
    if (password !== confirmPassword) return 'As senhas não coincidem.'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    reset()

    if (mode === 'signup') {
      const validationError = validateSignup()
      if (validationError) { setError(validationError); return }
    }

    setLoading(true)

    if (mode === 'login') {
      const result = await signIn(email, password)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        window.location.href = '/dashboard'
      }
    } else {
      const result = await signUp(email, password, nome, role, confirmPassword)
      if (result.error) {
        setError(result.error)
        setLoading(false)
      } else {
        setSuccess(
          'Cadastro realizado! Verifique seu e-mail para confirmar a conta. ' +
          'Após a confirmação, aguarde a aprovação de um administrador para acessar o sistema.'
        )
        setLoading(false)
      }
    }
  }

  const inputCls   = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ background: 'var(--bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex w-12 h-12 rounded-xl items-center justify-center text-2xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}
          >
            <svg width="24" height="24" viewBox="0 0 22 22" fill="none">
              <rect x="2"  y="2"  width="8" height="8" rx="1.5" fill="#818cf8"/>
              <rect x="12" y="2"  width="8" height="8" rx="1.5" fill="#22c55e"/>
              <rect x="2"  y="12" width="8" height="8" rx="1.5" fill="#f59e0b"/>
              <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#e879f9"/>
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">PortfolioPMO</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {mode === 'login' ? 'Acesse sua conta' : 'Solicitar acesso'}
          </p>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          {success ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">✉️</div>
              <p className="text-sm font-medium mb-2">Solicitação enviada!</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                {success}
              </p>
              <button
                onClick={() => { setSuccess(null); setMode('login') }}
                className="mt-4 text-xs underline"
                style={{ color: 'var(--accent2)' }}
              >
                Voltar ao login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* ── Signup-only fields ─────────────────────────────────── */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                      style={{ color: 'var(--text2)' }}
                    >
                      Nome completo
                    </label>
                    <input
                      type="text"
                      required
                      value={nome}
                      onChange={e => setNome(e.target.value)}
                      placeholder="Seu nome"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>
                </>
              )}

              {/* ── E-mail ─────────────────────────────────────────────── */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder={mode === 'signup' ? 'seu@chubb.com' : 'seu@email.com'}
                  className={inputCls}
                  style={inputStyle}
                />
                {mode === 'signup' && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    Permitido: @chubb.com ou @fourd.com.br
                  </p>
                )}
              </div>

              {/* ── Senha ──────────────────────────────────────────────── */}
              <div>
                <label
                  className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                  style={{ color: 'var(--text2)' }}
                >
                  Senha
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
                {mode === 'signup' && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                    Mínimo 8 caracteres, 1 maiúscula e 1 número.
                  </p>
                )}
              </div>

              {/* ── Confirmar senha (signup only) ──────────────────────── */}
              {mode === 'signup' && (
                <>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                      style={{ color: 'var(--text2)' }}
                    >
                      Confirmar senha
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="••••••••"
                      className={inputCls}
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5 uppercase tracking-wide"
                      style={{ color: 'var(--text2)' }}
                    >
                      Tipo de acesso solicitado
                    </label>
                    <select
                      value={role}
                      onChange={e => setRole(e.target.value as Role)}
                      className={inputCls}
                      style={inputStyle}
                    >
                      <option value="viewer">Viewer — Apenas visualizar</option>
                      <option value="editor">Editor — Criar e editar projetos</option>
                      <option value="admin">Adm — Acesso total</option>
                    </select>
                    <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                      O acesso final será definido pelo administrador.
                    </p>
                  </div>
                </>
              )}

              {/* ── Erro ───────────────────────────────────────────────── */}
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
                {loading
                  ? 'Aguarde...'
                  : mode === 'login'
                    ? 'Entrar'
                    : 'Solicitar acesso'}
              </button>
            </form>
          )}
        </div>

        {/* Toggle mode */}
        {!success && (
          <p className="text-center text-sm mt-4" style={{ color: 'var(--text2)' }}>
            {mode === 'login' ? 'Não tem conta?' : 'Já tem conta?'}{' '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
              className="font-medium"
              style={{ color: 'var(--accent2)' }}
            >
              {mode === 'login' ? 'Solicitar acesso' : 'Entrar'}
            </button>
          </p>
        )}
      </div>
    </div>
  )
}
