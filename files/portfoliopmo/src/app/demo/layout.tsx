'use client'
// src/app/demo/layout.tsx

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DemoProvider, useDemoContext } from './context'
import { ToastProvider } from './_components/Toast'

const NAV = [
  { href: '/demo',               icon: '▦', label: 'Dashboard' },
  { href: '/demo/projetos',      icon: '✦', label: 'Projetos' },
  { href: '/demo/entregues',     icon: '📦', label: 'Proj. Entregues' },
  { href: '/demo/insights',      icon: '◈', label: 'Insights' },
  { href: '/demo/configuracoes', icon: '⚙', label: 'Configurações' },
]

function DemoSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const { projects, resetDemo } = useDemoContext()
  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

  function handleReset() {
    if (window.confirm('Restaurar todos os dados de demonstração para o estado inicial? Esta ação não pode ser desfeita.')) {
      resetDemo()
      if (onClose) onClose()
    }
  }

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

      {/* Logo + mobile close */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' }}>
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              <rect x="2" y="2" width="8" height="8" rx="1.5" fill="#818cf8"/>
              <rect x="12" y="2" width="8" height="8" rx="1.5" fill="#22c55e"/>
              <rect x="2" y="12" width="8" height="8" rx="1.5" fill="#f59e0b"/>
              <rect x="12" y="12" width="8" height="8" rx="1.5" fill="#e879f9"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold leading-tight tracking-tight">PortfolioPMO</p>
            <p className="text-xs font-medium uppercase tracking-widest mt-0.5" style={{ color: 'var(--text3)' }}>
              Painel Executivo
            </p>
          </div>
          {/* X close — only on mobile */}
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden ml-auto flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md text-sm transition-colors hover:bg-white/10"
              style={{ color: 'var(--text3)' }}
              aria-label="Fechar menu"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="text-xs font-medium uppercase tracking-widest px-2 pb-2" style={{ color: 'var(--text3)' }}>
          Principal
        </p>
        {NAV.map(item => {
          const active = item.href === '/demo'
            ? pathname === '/demo'
            : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              onClick={onClose}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all"
              style={{
                background: active ? 'var(--bg4)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text2)',
                fontWeight: active ? 500 : 400,
              }}>
              <span className="w-4 text-center text-base" style={{ color: active ? 'var(--accent2)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
        <div className="px-2.5 py-1.5 rounded-lg text-xs text-center"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
          ⚠ Modo demonstração
        </div>
        <div className="px-2.5">
          <p className="text-xs font-medium" style={{ color: 'var(--text2)' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{date}</p>
        </div>
        <button
          onClick={handleReset}
          className="w-full text-left px-2.5 py-1 rounded text-xs transition-colors hover:bg-white/5"
          style={{ color: 'var(--text3)' }}
        >
          ↺ Restaurar dados
        </button>
      </div>
    </aside>
  )
}

function DemoLayoutInner({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:flex">
        <DemoSidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex"
          onClick={() => setMenuOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.5)' }} />
          {/* Sidebar panel */}
          <div className="relative z-10 flex" onClick={e => e.stopPropagation()}>
            <DemoSidebar onClose={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div
          className="lg:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-30"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
        >
          <button
            onClick={() => setMenuOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--text)', fontSize: '18px' }}
            aria-label="Abrir menu"
          >
            ☰
          </button>
          <span className="text-sm font-semibold">PortfolioPMO</span>
        </div>

        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
    </div>
  )
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <ToastProvider>
        <DemoLayoutInner>{children}</DemoLayoutInner>
      </ToastProvider>
    </DemoProvider>
  )
}
