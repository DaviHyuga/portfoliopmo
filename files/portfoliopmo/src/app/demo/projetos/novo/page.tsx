'use client'
// src/app/demo/projetos/novo/page.tsx

import { DemoProjectForm } from '../_DemoProjectForm'
import { Breadcrumb } from '../../_components/Breadcrumb'

export default function DemoNovoProjetoPage() {
  return (
    <div className="p-8 max-w-3xl">
      <Breadcrumb />
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Novo Projeto</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>Cadastre um novo projeto no portfólio</p>
      </div>
      <DemoProjectForm />
    </div>
  )
}
