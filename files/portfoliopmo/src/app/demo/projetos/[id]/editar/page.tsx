'use client'
// src/app/demo/projetos/[id]/editar/page.tsx

import { use } from 'react'
import { notFound } from 'next/navigation'
import { useDemoContext } from '../../../context'
import { DemoProjectForm } from '../../_DemoProjectForm'

export default function DemoEditarProjetoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { projects } = useDemoContext()
  const project = projects.find(p => p.id === id)

  if (!project) notFound()

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Editar Projeto</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>{project.nome}</p>
      </div>
      <DemoProjectForm project={project} />
    </div>
  )
}
