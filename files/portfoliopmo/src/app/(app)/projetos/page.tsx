// src/app/(app)/projetos/page.tsx
import { getProjects } from '@/lib/projects'
import { ProjectForm } from '@/components/forms/ProjectForm'
import { deleteProject } from '@/lib/actions'
import Link from 'next/link'

export const revalidate = 0

const FAROL_DOT: Record<string, string> = {
  verde:    '#22c55e',
  amarelo:  '#f59e0b',
  vermelho: '#ef4444',
  azul:     '#3b82f6',
}

export default async function ProjetosPage() {
  const projects = await getProjects()

  return (
    <div className="p-8 h-full">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold tracking-tight">Gestão de Projetos</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
          Cadastre e edite os projetos do portfólio
        </p>
      </div>

      <div className="flex gap-5 items-start">
        {/* ─── Lista ─── */}
        <div className="w-72 flex-shrink-0 rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">Projetos Cadastrados</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono font-medium"
              style={{ background: 'var(--accent)', color: '#fff' }}>
              {projects.length}
            </span>
          </div>

          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
              <div className="text-3xl mb-3 opacity-30">📁</div>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>
                Nenhum projeto ainda
              </p>
            </div>
          ) : (
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {projects.map(p => (
                <div key={p.id}
                  className="flex items-center gap-3 px-5 py-3.5 hover:bg-white/[0.025] transition-colors group">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: FAROL_DOT[p.farol] }} />
                  <span className="flex-1 text-sm truncate">{p.nome}</span>
                  <span className="text-sm font-mono flex-shrink-0" style={{ color: 'var(--text3)' }}>
                    {p.pct_evolucao}%
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/projetos/${p.id}/editar`}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ color: 'var(--accent2)', background: 'var(--bg4)' }}>
                      ✏
                    </Link>
                    <form action={async () => {
                      'use server'
                      await deleteProject(p.id)
                    }}>
                      <button type="submit"
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ color: '#ef4444', background: 'rgba(239,68,68,0.1)' }}>
                        🗑
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ─── Formulário ─── */}
        <div className="flex-1 rounded-xl border overflow-hidden"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="px-7 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--text3)' }}>
              Novo Projeto
            </p>
          </div>
          <div className="p-7">
            <ProjectForm inline />
          </div>
        </div>
      </div>
    </div>
  )
}
