'use client'
// src/app/demo/layout.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { DemoProvider, useDemoContext } from './context'

const NAV = [
  { href: '/demo',               icon: '▦', label: 'Dashboard' },
  { href: '/demo/projetos',      icon: '✦', label: 'Projetos' },
  { href: '/demo/insights',      icon: '◈', label: 'Insights' },
  { href: '/demo/configuracoes', icon: '⚙', label: 'Configurações' },
]

function DemoSidebar() {
  const pathname = usePathname()
  const { projects } = useDemoContext()
  const date = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

      {/* Logo */}
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
          <div>
            <p className="text-sm font-bold leading-tight tracking-tight">PortfolioPMO</p>
            <p className="text-xs font-medium uppercase tracking-widest mt-0.5" style={{ color: 'var(--text3)' }}>
              Painel Executivo
            </p>
          </div>
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
      </div>
    </aside>
  )
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <div className="flex min-h-screen">
        <DemoSidebar />
        <main className="flex-1 overflow-y-auto min-w-0">{children}</main>
      </div>
    </DemoProvider>
  )
}
