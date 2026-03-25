// src/app/(app)/projetos/novo/page.tsx
import Link from 'next/link'
import { ProjectForm } from '@/components/forms/ProjectForm'

export default function NovoProjetoPage() {
  return (
    <div className="p-8 max-w-3xl">
      <nav className="mb-1.5">
        <ol className="flex items-center gap-1 text-xs" style={{ color: 'var(--text3)' }}>
          <li><Link href="/projetos" style={{ color: 'var(--text3)' }} className="hover:text-[var(--text2)]">Projetos</Link></li>
          <li style={{ opacity: 0.5 }}>›</li>
          <li style={{ color: 'var(--text2)' }}>Novo Projeto</li>
        </ol>
      </nav>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Novo Projeto</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Cadastre um novo projeto no portfólio
        </p>
      </div>
      <ProjectForm />
    </div>
  )
}
