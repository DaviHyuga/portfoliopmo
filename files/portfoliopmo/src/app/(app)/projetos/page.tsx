// src/app/projetos/page.tsx
import { getProjects } from '@/lib/projects'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { deleteProject } from '@/lib/actions'
import Link from 'next/link'

export const revalidate = 0

export default async function ProjetosPage() {
  const projects = await getProjects()

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} no portfólio
          </p>
        </div>
        <Link
          href="/projetos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}
        >
          + Novo Projeto
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-xl border flex flex-col items-center justify-center py-20"
          style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="text-4xl mb-4 opacity-40">📁</div>
          <p className="font-medium mb-1">Nenhum projeto cadastrado</p>
          <p className="text-sm mb-6" style={{ color: 'var(--text2)' }}>
            Comece adicionando o primeiro projeto do portfólio
          </p>
          <Link href="/projetos/novo"
            className="px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            + Adicionar Projeto
          </Link>
        </div>
      ) : (
        <div className="grid gap-3">
          {projects.map(p => (
            <div key={p.id}
              className="rounded-xl border p-5 flex items-center gap-5 hover:border-white/20 transition-colors"
              style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-medium truncate">{p.nome}</span>
                  <FarolBadge farol={p.farol} />
                  <NaturezaBadge natureza={p.natureza} />
                </div>
                {p.descricao && (
                  <p className="text-sm truncate mb-2" style={{ color: 'var(--text2)' }}>
                    {p.descricao}
                  </p>
                )}
                <div className="flex items-center gap-6">
                  <ProgressBar value={p.pct_evolucao} farol={p.farol} />
                  {p.responsavel && (
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      👤 {p.responsavel}
                    </span>
                  )}
                  {p.data_fim_prevista && (
                    <span className="text-xs" style={{ color: 'var(--text3)' }}>
                      📅 {new Date(p.data_fim_prevista).toLocaleDateString('pt-BR')}
                    </span>
                  )}
                  {p.desvios.length > 0 && (
                    <div className="flex gap-1">
                      {p.desvios.map(d => (
                        <span key={d} className="text-xs px-1.5 py-0.5 rounded border capitalize"
                          style={{ background: 'var(--bg3)', color: 'var(--text2)', borderColor: 'var(--border)' }}>
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/projetos/${p.id}/editar`}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-white/5"
                  style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
                  ✏ Editar
                </Link>
                <form action={async () => {
                  'use server'
                  await deleteProject(p.id)
                }}>
                  <button type="submit"
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors hover:bg-red-500/10"
                    style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}
                    onClick={e => { if (!confirm('Excluir este projeto?')) e.preventDefault() }}>
                    🗑
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
