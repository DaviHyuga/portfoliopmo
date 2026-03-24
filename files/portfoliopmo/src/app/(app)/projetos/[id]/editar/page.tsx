// src/app/projetos/[id]/editar/page.tsx
import { getProject } from '@/lib/projects'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { notFound } from 'next/navigation'

export default async function EditarProjetoPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)
  if (!project) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Editar Projeto</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{project.nome}</p>
      </div>
      <ProjectForm project={project} />
    </div>
  )
}
