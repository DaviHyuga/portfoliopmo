// src/app/projetos/novo/page.tsx
import { ProjectForm } from '@/components/forms/ProjectForm'

export default function NovoProjetoPage() {
  return (
    <div className="p-8 max-w-3xl">
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
