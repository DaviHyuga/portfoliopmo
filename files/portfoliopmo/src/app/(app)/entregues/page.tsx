// src/app/(app)/entregues/page.tsx
// Página de Projetos Entregues — filtrada por ano via searchParam ?ano=XXXX

import { getProjects } from '@/lib/projects'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { EntregasBarChart } from '@/components/charts/EntregasBarChart'
import { YearFilterUrl } from '@/components/ui/YearFilterUrl'
import { Suspense } from 'react'

export const revalidate = 0

export default async function EntreguesPage({ searchParams }: { searchParams: { ano?: string } }) {
  const currentYear = new Date().getFullYear()
  const selectedYear = Number(searchParams.ano) || currentYear
  const allProjects = await getProjects()

  const entregues = allProjects
    .filter(p =>
      p.farol === 'azul' &&
      p.data_fim_prevista &&
      new Date(p.data_fim_prevista + 'T00:00:00').getFullYear() === selectedYear
    )
    .sort((a, b) => {
      if (!a.data_fim_prevista) return 1
      if (!b.data_fim_prevista) return -1
      return b.data_fim_prevista.localeCompare(a.data_fim_prevista)
    })

  const prevYearProjects = allProjects.filter(p =>
    p.farol === 'azul' &&
    p.data_fim_prevista &&
    new Date(p.data_fim_prevista + 'T00:00:00').getFullYear() === selectedYear - 1
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Projetos Entregues</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            {entregues.length > 0
              ? `${entregues.length} projeto${entregues.length > 1 ? 's' : ''} entregue${entregues.length > 1 ? 's' : ''} em ${selectedYear}`
              : `Nenhum projeto entregue em ${selectedYear}`}
          </p>
        </div>
        <Suspense>
          <YearFilterUrl defaultYear={currentYear} />
        </Suspense>
      </div>

      {/* Gráfico de entregas por trimestre */}
      <div className="rounded-xl border overflow-hidden mb-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Entregas por Trimestre — {selectedYear}</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {entregues.length} entrega{entregues.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="px-5 py-4">
          <EntregasBarChart
            projects={entregues}
            prevYearProjects={prevYearProjects}
            selectedYear={selectedYear}
          />
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <span className="text-sm font-medium">Lista de Projetos Entregues</span>
          <span className="text-xs px-2 py-1 rounded-full font-mono" style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
            {entregues.length} projeto{entregues.length !== 1 ? 's' : ''}
          </span>
        </div>
        {entregues.length === 0 ? (
          <div className="text-center py-16" style={{ color: 'var(--text3)' }}>
            <div className="text-4xl mb-3 opacity-40">📦</div>
            <p className="text-sm">Nenhum projeto entregue em {selectedYear}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
              Projetos com farol azul e data de entrega em {selectedYear} aparecerão aqui
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {['Nome', 'Descrição', 'Responsável', 'Data de Entrega', 'Benefícios', 'Natureza'].map(h => (
                    <th
                      key={h}
                      className="text-left px-5 pb-3 pt-0 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entregues.map(p => (
                  <tr
                    key={p.id}
                    className="border-b last:border-0 hover:bg-white/[0.025] transition-colors"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <td className="px-5 py-3">
                      <div className="font-medium text-sm">{p.nome}</div>
                    </td>
                    <td className="px-5 py-3 max-w-xs">
                      {p.descricao ? (
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                          {p.descricao.length > 100 ? p.descricao.slice(0, 100) + '…' : p.descricao}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>–</span>
                      )}
                    </td>
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
                    <td className="px-5 py-3 max-w-xs">
                      {p.beneficios ? (
                        <span className="text-xs leading-relaxed" style={{ color: 'var(--text2)' }}>
                          {p.beneficios.length > 100 ? p.beneficios.slice(0, 100) + '…' : p.beneficios}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text3)', fontSize: '12px' }}>–</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <NaturezaBadge natureza={p.natureza} />
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
