'use client'
// src/app/demo/projetos/_DemoProjectForm.tsx — formulário de projeto para o modo demo

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDemoContext } from '../context'
import type { Project, Farol, Natureza, Desvio } from '@/types'

interface Props { project?: Project }

export function DemoProjectForm({ project }: Props) {
  const router = useRouter()
  const { addProject, updateProject } = useDemoContext()
  const [pct, setPct] = useState(project?.pct_evolucao ?? 0)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)

    const desvios: Desvio[] = []
    if (f.get('d_escopo')) desvios.push('escopo')
    if (f.get('d_prazo')) desvios.push('prazo')
    if (f.get('d_risco')) desvios.push('risco')

    const data = {
      nome: f.get('nome') as string,
      descricao: (f.get('descricao') as string) || null,
      beneficios: (f.get('beneficios') as string) || null,
      riscos: (f.get('riscos') as string) || null,
      pct_evolucao: parseInt(f.get('pct_evolucao') as string) || 0,
      farol: f.get('farol') as Farol,
      natureza: f.get('natureza') as Natureza,
      desvios,
      responsavel: (f.get('responsavel') as string) || null,
      data_inicio: (f.get('data_inicio') as string) || null,
      data_fim_prevista: (f.get('data_fim_prevista') as string) || null,
    }

    if (project) {
      updateProject(project.id, data)
    } else {
      addProject(data)
    }
    router.push('/demo/projetos')
  }

  const inputCls = "w-full rounded-lg border text-sm px-3 py-2.5 outline-none transition-colors focus:border-indigo-500"
  const inputStyle = { background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }
  const radioBase = "flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer text-sm transition-all"
  const radioStyle = { borderColor: 'var(--border)', background: 'var(--bg3)', color: 'var(--text2)' }

  const FAROIS: { value: Farol; label: string; emoji: string }[] = [
    { value: 'verde',    label: 'Verde — No prazo',           emoji: '🟢' },
    { value: 'amarelo',  label: 'Amarelo — Risco de atraso',  emoji: '🟡' },
    { value: 'vermelho', label: 'Vermelho — Atrasado/Pausado',emoji: '🔴' },
    { value: 'azul',     label: 'Azul — Concluído',           emoji: '🔵' },
  ]

  const NATUREZAS: { value: Natureza; label: string }[] = [
    { value: 'backoffice',  label: 'Backoffice' },
    { value: 'regulatorio', label: 'Regulatório' },
    { value: 'negocios',    label: 'Negócios' },
    { value: 'regional',    label: 'Regional' },
  ]

  return (
    <form onSubmit={handleSubmit}>
      {project && <input type="hidden" name="id" value={project.id} />}

      <div className="rounded-xl border p-7 space-y-6" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>

        {/* Nome */}
        <div>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
            Nome do Projeto *
          </label>
          <input name="nome" required defaultValue={project?.nome}
            placeholder="Ex: Digitalização do Processo de RH"
            className={inputCls} style={inputStyle} />
        </div>

        {/* Percentual */}
        <div>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
            Percentual de Evolução
          </label>
          <div className="flex items-center gap-4">
            <input type="range" name="pct_evolucao" min={0} max={100}
              value={pct} onChange={e => setPct(+e.target.value)} className="flex-1" />
            <span className="text-2xl font-semibold font-mono w-16 text-right"
              style={{ color: 'var(--text)', letterSpacing: '-0.5px' }}>{pct}%</span>
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

        {/* Riscos */}
        <div>
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-wide" style={{ color: 'var(--text2)' }}>
            Riscos do Projeto
          </label>
          <textarea name="riscos" rows={4} defaultValue={project?.riscos ?? ''}
            placeholder={'Descreva cada risco em uma linha separada:\nDependência de aprovação de TI\nAtraso na migração de dados legados'}
            className={inputCls} style={inputStyle} />
          <p className="text-xs mt-1" style={{ color: 'var(--text3)' }}>
            Um risco por linha. As estratégias de mitigação são geradas automaticamente nos Insights.
          </p>
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

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
          <button type="submit"
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-white"
            style={{ background: 'var(--accent)' }}>
            💾 Salvar Projeto
          </button>
          <button type="button" onClick={() => router.back()}
            className="px-5 py-2.5 rounded-lg text-sm font-medium border transition-colors"
            style={{ borderColor: 'var(--border2)', color: 'var(--text2)', background: 'var(--bg3)' }}>
            Cancelar
          </button>
        </div>
      </div>
    </form>
  )
}
