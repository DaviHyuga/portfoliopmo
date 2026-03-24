'use client'
// src/components/forms/ProjectForm.tsx

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { upsertProject } from '@/lib/actions'
import type { Project, Farol, Natureza } from '@/types'

interface ProjectFormProps {
  project?: Project
  inline?: boolean
}

export function ProjectForm({ project, inline }: ProjectFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [pct, setPct] = useState(project?.pct_evolucao ?? 0)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = e.currentTarget
    const data = new FormData(form)

    startTransition(async () => {
      try {
        await upsertProject(data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Erro ao salvar projeto')
      }
    })
  }

  const inputCls = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }

  const radioBase = "flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all"
  const radioStyle = { borderColor: 'var(--border)', background: 'var(--bg3)', color: 'var(--text2)' }

  const FAROIS: { value: Farol; label: string; emoji: string; color: string }[] = [
    { value: 'verde', label: 'Verde — No prazo', emoji: '🟢', color: '#22c55e' },
    { value: 'amarelo', label: 'Amarelo — Risco de atraso', emoji: '🟡', color: '#f59e0b' },
    { value: 'vermelho', label: 'Vermelho — Atrasado/Pausado', emoji: '🔴', color: '#ef4444' },
    { value: 'azul', label: 'Azul — Concluído', emoji: '🔵', color: '#3b82f6' },
  ]

  const NATUREZAS: { value: Natureza; label: string }[] = [
    { value: 'backoffice', label: 'Backoffice' },
    { value: 'regulatorio', label: 'Regulatório' },
    { value: 'negocios', label: 'Negócios' },
    { value: 'regional', label: 'Regional' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className={inline ? 'space-y-5' : 'rounded-xl border p-7 space-y-6'} style={inline ? {} : { background: 'var(--bg2)', borderColor: 'var(--border)' }}>

        {/* Nome */}
        <div>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
            Nome do Projeto *
          </label>
          <input
            name="nome"
            required
            defaultValue={project?.nome}
            placeholder="Ex: Digitalização do Processo de RH"
            className={inputCls}
            style={inputStyle}
          />
        </div>

        {/* Percentual */}
        <div>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
            Percentual de Evolução
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range" name="pct_evolucao" min={0} max={100}
              value={pct} onChange={e => setPct(+e.target.value)}
              className="flex-1"
            />
            <span className="text-2xl font-semibold font-mono w-16 text-right" style={{ color: 'var(--text)', letterSpacing: '-0.5px' }}>
              {pct}%
            </span>
          </div>
        </div>

        {/* Farol */}
        <div>
          <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
            Farol do Projeto *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {FAROIS.map(f => (
              <label key={f.value} className={radioBase} style={radioStyle}>
                <input type="radio" name="farol" value={f.value} required
                  defaultChecked={project?.farol === f.value} />
                {f.emoji} {f.label}
              </label>
            ))}
          </div>
        </div>

        {/* Descrição e Benefícios */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
              Descrição de Alto Nível
            </label>
            <textarea name="descricao" rows={3} defaultValue={project?.descricao ?? ''}
              placeholder="Objetivo e escopo do projeto..." className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
              Benefícios Esperados
            </label>
            <textarea name="beneficios" rows={3} defaultValue={project?.beneficios ?? ''}
              placeholder="Benefícios para a organização..." className={inputCls} style={inputStyle} />
          </div>
        </div>

        {/* Natureza + Desvios + Datas */}
        <div className="grid grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
              Natureza *
            </label>
            <div className="space-y-1.5">
              {NATUREZAS.map(n => (
                <label key={n.value} className={radioBase} style={radioStyle}>
                  <input type="radio" name="natureza" value={n.value} required
                    defaultChecked={project?.natureza === n.value} />
                  {n.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium mb-2 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
              Tipo de Desvio
            </label>
            <div className="space-y-1.5">
              {(['escopo', 'prazo', 'risco'] as const).map(d => (
                <label key={d} className={radioBase} style={radioStyle}>
                  <input type="checkbox" name={`d_${d}`}
                    defaultChecked={project?.desvios.includes(d)} />
                  <span className="capitalize">{d}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
                Responsável
              </label>
              <input name="responsavel" defaultValue={project?.responsavel ?? ''}
                placeholder="Nome do responsável" className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
                Data de Início
              </label>
              <input type="date" name="data_inicio" defaultValue={project?.data_inicio ?? ''}
                className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
                Data de Término
              </label>
              <input type="date" name="data_fim_prevista" defaultValue={project?.data_fim_prevista ?? ''}
                className={inputCls} style={inputStyle} />
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="text-sm px-3 py-2 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-50"
            style={{ background: 'var(--accent)' }}
          >
            {isPending ? 'Salvando...' : '💾 Salvar Projeto'}
          </button>
          {!inline && (
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: 'var(--bg3)' }}
            >
              Cancelar
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
