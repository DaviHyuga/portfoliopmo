// src/app/(app)/projetos/[id]/page.tsx — Detalhes do Projeto
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProject } from '@/lib/projects'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { getDeadlineBadge, gerarMitigacao } from '@/app/demo/_utils'
import { DeleteButton } from './_DeleteButton'

export const revalidate = 0

function formatDate(d: string | null) {
  if (!d) return '–'
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default async function ProjetoDetailPage({ params }: { params: { id: string } }) {
  const project = await getProject(params.id)

  if (!project) notFound()

  const badge = getDeadlineBadge(project.data_fim_prevista, project.farol)
  const riscosList = project.riscos ? project.riscos.split('\n').filter(r => r.trim()) : []

  return (
    <div className="p-8 max-w-5xl">
      <nav className="mb-1.5">
        <ol className="flex items-center gap-1 text-xs" style={{ color: 'var(--text3)' }}>
          <li><Link href="/projetos" style={{ color: 'var(--text3)' }} className="hover:text-[var(--text2)]">Projetos</Link></li>
          <li style={{ opacity: 0.5 }}>›</li>
          <li style={{ color: 'var(--text2)' }}>Detalhes do Projeto</li>
        </ol>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between mb-7 gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap mb-2">
            <h1 className="text-2xl font-semibold tracking-tight">{project.nome}</h1>
            <FarolBadge farol={project.farol} />
            <NaturezaBadge natureza={project.natureza} />
            {badge && (
              <span className="text-xs px-2 py-1 rounded-full font-mono"
                style={{ background: badge.bg, color: badge.color }}>
                {badge.label}
              </span>
            )}
          </div>
          {project.responsavel && (
            <p className="text-sm" style={{ color: 'var(--text2)' }}>Responsável: {project.responsavel}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href={`/projetos/${project.id}/editar`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
            ✎ Editar Projeto
          </Link>
          <DeleteButton id={project.id} nome={project.nome} />
          <Link href="/projetos"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors hover:bg-white/5"
            style={{ borderColor: 'var(--border2)', color: 'var(--text3)' }}>
            ← Voltar
          </Link>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-2 gap-5 mb-5">
        {/* Left col: info */}
        <div className="space-y-4">
          {project.descricao && (
            <div className="rounded-xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Descrição</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{project.descricao}</p>
            </div>
          )}
          {project.beneficios && (
            <div className="rounded-xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
              <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--text3)' }}>Benefícios Esperados</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text2)' }}>{project.beneficios}</p>
            </div>
          )}
          <div className="rounded-xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Informações</p>
            <div className="space-y-2.5">
              {project.responsavel && (
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text3)' }}>Responsável</span>
                  <span style={{ color: 'var(--text)' }}>{project.responsavel}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Data de Início</span>
                <span style={{ color: 'var(--text)' }}>{formatDate(project.data_inicio)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Término Previsto</span>
                <span style={{ color: 'var(--text)' }}>{formatDate(project.data_fim_prevista)}</span>
              </div>
              {project.desvios.length > 0 && (
                <div className="flex justify-between text-sm items-center">
                  <span style={{ color: 'var(--text3)' }}>Desvios</span>
                  <div className="flex gap-1">
                    {project.desvios.map(d => (
                      <span key={d} className="text-xs px-2 py-0.5 rounded border capitalize"
                        style={{ background: 'var(--bg3)', color: 'var(--text2)', borderColor: 'var(--border)' }}>{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col: progress */}
        <div className="space-y-4">
          <div className="rounded-xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-4" style={{ color: 'var(--text3)' }}>Evolução do Projeto</p>
            <div className="mb-3">
              <div className="flex items-end justify-between mb-2">
                <span className="text-4xl font-semibold font-mono" style={{ color: 'var(--text)', letterSpacing: '-1px' }}>
                  {project.pct_evolucao}%
                </span>
                <FarolBadge farol={project.farol} />
              </div>
              <ProgressBar value={project.pct_evolucao} farol={project.farol} />
            </div>
            {project.pct_evolucao === 100 && (
              <p className="text-xs mt-3" style={{ color: '#22c55e' }}>Projeto concluído</p>
            )}
            {project.pct_evolucao < 40 && project.farol !== 'azul' && (
              <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>Evolução abaixo de 40% — atenção necessária</p>
            )}
          </div>

          {badge && (
            <div className="rounded-xl border p-4"
              style={{ background: badge.bg, borderColor: badge.color + '40' }}>
              <p className="text-sm font-medium" style={{ color: badge.color }}>
                ⏱ {badge.label}
              </p>
              {project.data_fim_prevista && (
                <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
                  Prazo: {formatDate(project.data_fim_prevista)}
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border p-5" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>Detalhes Técnicos</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Natureza</span>
                <NaturezaBadge natureza={project.natureza} />
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Farol</span>
                <FarolBadge farol={project.farol} />
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--text3)' }}>Criado em</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>
                  {new Date(project.created_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risks section */}
      {riscosList.length > 0 && (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span className="text-sm font-medium">⚠ Riscos e Mitigações</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-mono"
              style={{ background: 'var(--bg4)', color: 'var(--text2)' }}>
              {riscosList.length} risco{riscosList.length !== 1 ? 's' : ''}
            </span>
          </div>
          <div className="p-5">
            <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
              <table className="w-full">
                <thead>
                  <tr style={{ background: 'var(--bg3)' }}>
                    <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider w-1/2"
                      style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                      ⚠ Risco identificado
                    </th>
                    <th className="text-left px-4 py-2.5 text-xs font-medium uppercase tracking-wider w-1/2"
                      style={{ color: 'var(--text3)', borderBottom: '1px solid var(--border)' }}>
                      🛡 Estratégia de mitigação
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {riscosList.map((risco, i) => (
                    <tr key={i} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>{risco.trim()}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--text2)' }}>
                        {gerarMitigacao(risco.trim(), project.farol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
