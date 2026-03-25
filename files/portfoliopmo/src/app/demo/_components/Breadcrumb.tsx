'use client'
// src/app/demo/_components/Breadcrumb.tsx

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

function getBreadcrumbs(pathname: string): BreadcrumbItem[] | null {
  if (pathname === '/demo') return null

  if (pathname === '/demo/projetos') {
    return [
      { label: 'Dashboard', href: '/demo' },
      { label: 'Projetos' },
    ]
  }

  if (pathname === '/demo/projetos/novo') {
    return [
      { label: 'Dashboard', href: '/demo' },
      { label: 'Projetos', href: '/demo/projetos' },
      { label: 'Novo Projeto' },
    ]
  }

  if (pathname === '/demo/insights') {
    return [
      { label: 'Dashboard', href: '/demo' },
      { label: 'Insights' },
    ]
  }

  if (pathname === '/demo/configuracoes') {
    return [
      { label: 'Dashboard', href: '/demo' },
      { label: 'Configurações' },
    ]
  }

  // /demo/projetos/[id]/editar
  const editarMatch = pathname.match(/^\/demo\/projetos\/[^/]+\/editar$/)
  if (editarMatch) {
    return [
      { label: 'Dashboard', href: '/demo' },
      { label: 'Projetos', href: '/demo/projetos' },
      { label: 'Editar Projeto' },
    ]
  }

  // /demo/projetos/[id] (detail)
  const detailMatch = pathname.match(/^\/demo\/projetos\/[^/]+$/)
  if (detailMatch) {
    return [
      { label: 'Dashboard', href: '/demo' },
      { label: 'Projetos', href: '/demo/projetos' },
      { label: 'Detalhes do Projeto' },
    ]
  }

  return null
}

export function Breadcrumb() {
  const pathname = usePathname()
  const crumbs = getBreadcrumbs(pathname)

  if (!crumbs) return null

  return (
    <nav
      aria-label="Breadcrumb"
      style={{ marginBottom: '0.375rem' }}
    >
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.25rem',
          listStyle: 'none',
          padding: 0,
          margin: 0,
          fontSize: '0.75rem',
          color: 'var(--text3)',
        }}
      >
        {crumbs.map((crumb, index) => (
          <li key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {index > 0 && (
              <span style={{ color: 'var(--text3)', opacity: 0.5 }}>›</span>
            )}
            {crumb.href ? (
              <Link
                href={crumb.href}
                style={{
                  color: 'var(--text3)',
                  textDecoration: 'none',
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--text2)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
              >
                {crumb.label}
              </Link>
            ) : (
              <span style={{ color: 'var(--text2)' }}>{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
