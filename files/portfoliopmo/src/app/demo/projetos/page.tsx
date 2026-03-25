'use client'
// src/app/demo/projetos/page.tsx

import Link from 'next/link'
import { useDemoContext } from '../context'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'

export default function DemoProjetosPage() {
  const { projects, deleteProject } = useDemoContext()

  function handleDelete(id: string, nome: string) {
    if (confirm(`Excluir o projeto "${nome}"? Esta ação não pode ser desfeita.`)) {
      deleteProject(id)
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {projects.length} projeto{projects.length !== 1 ? 's' : ''} no portfólio
          </p>
        </div>
        <Link href="/demo/projetos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}>
          + Novo Projeto
        </Link>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {projects.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
            <div className="text-4xl mb-3 opacity-30">✦</div>
            <p className="text-sm mb-3">Nenhum projeto cadastrado</p>
            <Link href="/demo/projetos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--accent)' }}>
              + Criar primeiro projeto
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Projeto', 'Evolução', 'Farol', 'Natureza', 'Responsável', 'Término', ''].map(h => (
                    <th key={h} className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                    style={{ borderColor: 'var(--border)' }}>
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{p.nome}</div>
                      {p.descricao && (
                        <div className="text-xs mt-0.5 max-w-xs truncate" style={{ color: 'var(--text3)' }}>{p.descricao}</div>
                      )}
                    </td>
                    <td className="px-5 py-3 w-36">
                      <ProgressBar value={p.pct_evolucao} farol={p.farol} />
                    </td>
                    <td className="px-5 py-3"><FarolBadge farol={p.farol} /></td>
                    <td className="px-5 py-3"><NaturezaBadge natureza={p.natureza} /></td>
                    <td className="px-5 py-3">
                      <span className="text-sm" style={{ color: 'var(--text2)' }}>{p.responsavel ?? '–'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-sm font-mono" style={{ color: 'var(--text2)' }}>
                        {p.data_fim_prevista
                          ? new Date(p.data_fim_prevista + 'T00:00:00').toLocaleDateString('pt-BR')
                          : '–'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/demo/projetos/${p.id}/editar`}
                          className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
                          style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
                          Editar
                        </Link>
                        <button
                          onClick={() => handleDelete(p.id, p.nome)}
                          className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-red-500/10"
                          style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
