'use client'
// src/components/ui/Sidebar.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from '@/lib/actions'

const NAV = [
  { href: '/dashboard',     icon: '▦', label: 'Dashboard' },
  { href: '/projetos',      icon: '✦', label: 'Projetos' },
  { href: '/insights',      icon: '◈', label: 'Insights' },
  { href: '/configuracoes', icon: '⚙', label: 'Configurações' },
]

export function Sidebar({ orgName }: { orgName: string }) {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 border-r"
      style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}
    >
      {/* Logo */}
      <div className="px-5 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)' }}>
            📊
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">PortfolioPMO</p>
            <p className="text-xs mt-0.5 truncate max-w-28" style={{ color: 'var(--text3)' }}>
              {orgName}
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
          const active = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all"
              style={{
                background: active ? 'var(--bg4)' : 'transparent',
                color: active ? 'var(--text)' : 'var(--text2)',
                fontWeight: active ? 500 : 400,
              }}
            >
              <span className="w-4 text-center text-base"
                style={{ color: active ? 'var(--accent2)' : 'inherit' }}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <form action={signOut}>
          <button
            type="submit"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm w-full transition-colors hover:bg-white/5"
            style={{ color: 'var(--text3)' }}
          >
            <span className="w-4 text-center">↩</span>
            Sair
          </button>
        </form>
      </div>
    </aside>
  )
}
