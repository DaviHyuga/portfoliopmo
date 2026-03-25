'use client'
// src/app/(app)/projetos/_ProjetosClient.tsx

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/lib/actions'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import type { Farol, Natureza } from '@/types'
import { getDeadlineBadge } from '@/app/demo/_utils'
import type { Project } from '@/types'

type SortKey = 'nome' | 'pct_evolucao' | 'farol' | 'data_fim_prevista'
type SortDir = 'asc' | 'desc'

const FAROL_ORDER: Record<Farol, number> = { vermelho: 0, amarelo: 1, verde: 2, azul: 3 }
const PAGE_SIZE = 6

interface ProjetosClientProps {
  initialProjects: Project[]
}

export function ProjetosClient({ initialProjects }: ProjetosClientProps) {
  const { showToast } = useToast()
  const router = useRouter()

  const [projects, setProjects] = useState(initialProjects)
  const [search, setSearch] = useState('')
  const [farolFilter, setFarolFilter] = useState<Farol | 'todos'>('todos')
  const [naturezaFilter, setNaturezaFilter] = useState<Natureza | 'todos'>('todos')
  const [sortKey, setSortKey] = useState<SortKey>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; nome: string } | null>(null)

  // Atualiza quando o server re-renderiza (após router.refresh())
  useEffect(() => { setProjects(initialProjects) }, [initialProjects])

  // Filter
  let filtered = projects.filter(p => {
    const q = search.toLowerCase()
    const matchSearch = !q || p.nome.toLowerCase().includes(q) || (p.responsavel ?? '').toLowerCase().includes(q)
    const matchFarol = farolFilter === 'todos' || p.farol === farolFilter
    const matchNatureza = naturezaFilter === 'todos' || p.natureza === naturezaFilter
    return matchSearch && matchFarol && matchNatureza
  })

  // Sort
  filtered = [...filtered].sort((a, b) => {
    let cmp = 0
    if (sortKey === 'nome') cmp = a.nome.localeCompare(b.nome)
    else if (sortKey === 'pct_evolucao') cmp = a.pct_evolucao - b.pct_evolucao
    else if (sortKey === 'farol') cmp = FAROL_ORDER[a.farol] - FAROL_ORDER[b.farol]
    else if (sortKey === 'data_fim_prevista') {
      const da = a.data_fim_prevista ?? '9999'
      const db = b.data_fim_prevista ?? '9999'
      cmp = da.localeCompare(db)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const totalFiltered = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  function handleFilterChange() { setPage(1) }

  async function confirmDeleteProject() {
    if (!confirmDelete) return
    await deleteProject(confirmDelete.id)
    router.refresh()
    showToast('Projeto excluído com sucesso', 'success')
    setConfirmDelete(null)
  }

  function sortIndicator(key: SortKey) {
    if (sortKey !== key) return <span style={{ color: 'var(--text3)', opacity: 0.4 }}>↕</span>
    return <span style={{ color: 'var(--accent2)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const FAROL_PILLS: { value: Farol | 'todos'; label: string }[] = [
    { value: 'todos',    label: 'Todos' },
    { value: 'verde',    label: '🟢 No Prazo' },
    { value: 'amarelo',  label: '🟡 Em Risco' },
    { value: 'vermelho', label: '🔴 Crítico' },
    { value: 'azul',     label: '🔵 Concluído' },
  ]

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {totalFiltered === projects.length
              ? `${projects.length} projeto${projects.length !== 1 ? 's' : ''} no portfólio`
              : `${totalFiltered} de ${projects.length} projeto${projects.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link href="/projetos/novo"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
          style={{ background: 'var(--accent)' }}>
          + Novo Projeto
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4 mb-4 space-y-3" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {/* Search + Natureza */}
        <div className="flex gap-3 flex-wrap">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); handleFilterChange() }}
            placeholder="Buscar por nome ou responsável..."
            className="flex-1 min-w-48 rounded-lg border text-sm px-3 py-2 outline-none focus:border-indigo-500"
            style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }}
          />
          <select
            value={naturezaFilter}
            onChange={e => { setNaturezaFilter(e.target.value as Natureza | 'todos'); handleFilterChange() }}
            className="rounded-lg border text-sm px-3 py-2 outline-none"
            style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }}
          >
            <option value="todos">Todos (Natureza)</option>
            <option value="backoffice">Backoffice</option>
            <option value="regulatorio">Regulatório</option>
            <option value="negocios">Negócios</option>
            <option value="regional">Regional</option>
          </select>
        </div>

        {/* Farol pills */}
        <div className="flex gap-2 flex-wrap">
          {FAROL_PILLS.map(pill => (
            <button
              key={pill.value}
              onClick={() => { setFarolFilter(pill.value); handleFilterChange() }}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: farolFilter === pill.value ? 'var(--accent)' : 'var(--bg3)',
                borderColor: farolFilter === pill.value ? 'var(--accent)' : 'var(--border2)',
                color: farolFilter === pill.value ? '#fff' : 'var(--text2)',
                fontWeight: farolFilter === pill.value ? 600 : 400,
              }}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {projects.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
            <div className="text-4xl mb-3 opacity-30">✦</div>
            <p className="text-sm mb-3">Nenhum projeto cadastrado</p>
            <Link href="/projetos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: 'var(--accent)' }}>
              + Criar primeiro projeto
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text3)' }}>
            <div className="text-3xl mb-3 opacity-40">🔍</div>
            <p className="text-sm">Nenhum projeto encontrado com esses filtros</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th
                      onClick={() => handleSort('nome')}
                      className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b cursor-pointer select-none"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
                      Projeto {sortIndicator('nome')}
                    </th>
                    <th
                      onClick={() => handleSort('pct_evolucao')}
                      className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b cursor-pointer select-none"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
                      Evolução {sortIndicator('pct_evolucao')}
                    </th>
                    <th
                      onClick={() => handleSort('farol')}
                      className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b cursor-pointer select-none"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
                      Farol {sortIndicator('farol')}
                    </th>
                    <th className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>Natureza</th>
                    <th className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>Responsável</th>
                    <th
                      onClick={() => handleSort('data_fim_prevista')}
                      className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b cursor-pointer select-none"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}>
                      Término {sortIndicator('data_fim_prevista')}
                    </th>
                    <th className="text-left px-5 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => {
                    const badge = getDeadlineBadge(p.data_fim_prevista, p.farol)
                    return (
                      <tr key={p.id}
                        onClick={() => router.push(`/projetos/${p.id}`)}
                        className="border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                        style={{ borderColor: 'var(--border)', cursor: 'pointer' }}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-sm">{p.nome}</span>
                            {badge && (
                              <span className="text-xs px-1.5 py-0.5 rounded font-mono"
                                style={{ background: badge.bg, color: badge.color }}>
                                {badge.label}
                              </span>
                            )}
                          </div>
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
                        <td className="px-5 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            <Link href={`/projetos/${p.id}/editar`}
                              className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-white/5"
                              style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
                              Editar
                            </Link>
                            <button
                              onClick={() => setConfirmDelete({ id: p.id, nome: p.nome })}
                              className="text-xs px-2.5 py-1.5 rounded-lg border transition-colors hover:bg-red-500/10"
                              style={{ borderColor: 'rgba(239,68,68,0.3)', color: '#ef4444' }}>
                              Excluir
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--text3)' }}>
                  Página {safePage} de {totalPages} · {totalFiltered} projeto{totalFiltered !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={safePage <= 1}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                    style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: 'var(--bg3)' }}
                  >
                    ← Anterior
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={safePage >= totalPages}
                    className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-40"
                    style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: 'var(--bg3)' }}
                  >
                    Próxima →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={confirmDelete !== null}
        title="Excluir Projeto"
        message={confirmDelete ? `Tem certeza que deseja excluir "${confirmDelete.nome}"? Esta ação não pode ser desfeita.` : ''}
        confirmLabel="Excluir"
        danger
        onConfirm={confirmDeleteProject}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  )
}
