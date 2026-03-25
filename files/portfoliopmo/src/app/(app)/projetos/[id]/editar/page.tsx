// src/app/(app)/projetos/[id]/editar/page.tsx
import Link from 'next/link'
import { getProject } from '@/lib/projects'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { notFound } from 'next/navigation'

export default async function EditarProjetoPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <nav className="mb-1.5">
        <ol className="flex items-center gap-1 text-xs" style={{ color: 'var(--text3)' }}>
          <li><Link href="/projetos" style={{ color: 'var(--text3)' }} className="hover:text-[var(--text2)]">Projetos</Link></li>
          <li style={{ opacity: 0.5 }}>›</li>
          <li style={{ color: 'var(--text2)' }}>Editar Projeto</li>
        </ol>
      </nav>
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Editar Projeto</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{project.nome}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  )
}
