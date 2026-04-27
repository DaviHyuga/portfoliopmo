'use client'
// src/app/(app)/status-recorrente/_StatusRecorrenteClient.tsx

import { useState, useRef, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import type { Project, Farol, Natureza, WeeklyStatus } from '@/types'
import { FarolBadge } from '@/components/ui/FarolBadge'
import { NaturezaBadge } from '@/components/ui/NaturezaBadge'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useToast } from '@/components/ui/Toast'
import { upsertWeeklyStatus } from '@/lib/actions'

// ─── Bullet helpers ───────────────────────────────────────────────────────────

function autoResize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function BulletList({ text }: { text: string }) {
  const lines = text.split('\n').filter(l => l.trim())
  if (lines.length === 0) {
    return (
      <span className="italic text-xs" style={{ color: 'var(--text3)', opacity: 0.55 }}>
        Clique para preencher...
      </span>
    )
  }
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {lines.map((line, i) => (
        <li key={i} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
          <span style={{ color: 'var(--accent2)', flexShrink: 0, fontSize: '10px', marginTop: '2px', lineHeight: 1.5 }}>•</span>
          <span style={{ lineHeight: 1.5 }}>{line}</span>
        </li>
      ))}
    </ul>
  )
}

// ─── Week helpers ─────────────────────────────────────────────────────────────

function getWeekStart(date: Date): string {
  const d   = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d.toISOString().split('T')[0]
}

function getWeekEnd(weekStart: string): string {
  const d = new Date(weekStart + 'T00:00:00')
  d.setDate(d.getDate() + 6)
  return d.toISOString().split('T')[0]
}

function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

// ─── Types ───────────────────────────────────────────────────────────────────

type EditableField = 'progresso' | 'proximos_passos' | 'riscos' | 'acoes_mitigacao'

interface PendingEdit {
  projectId: string
  weekStart: string
  field: EditableField
  newValue: string
}

const FIELD_LABELS: Record<EditableField, string> = {
  progresso:       'Progresso',
  proximos_passos: 'Próximos Passos',
  riscos:          'Riscos',
  acoes_mitigacao: 'Ações de Mitigação',
}
const EDITABLE_FIELDS: EditableField[] = ['progresso', 'proximos_passos', 'riscos', 'acoes_mitigacao']

const FAROL_PILLS: { value: Farol | 'todos'; label: string }[] = [
  { value: 'todos',    label: 'Todos' },
  { value: 'verde',    label: '🟢 No Prazo' },
  { value: 'amarelo',  label: '🟡 Em Risco' },
  { value: 'vermelho', label: '🔴 Crítico' },
  { value: 'azul',     label: '🔵 Concluído' },
]

const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']
const YEARS  = [2025, 2026, 2027]

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  initialProjects:  Project[]
  initialStatuses:  WeeklyStatus[]
  weekStart:        string
  currentWeekStart: string
}

export function StatusRecorrenteClient({
  initialProjects,
  initialStatuses,
  weekStart,
  currentWeekStart,
}: Props) {
  const { showToast } = useToast()
  const router        = useRouter()
  const [isPending, startTransition] = useTransition()

  // Parse weekStart into Y/M/D for the selects
  const [wy, wm, wd]  = weekStart.split('-').map(Number)
  const today         = new Date()

  const [filterYear,      setFilterYear]      = useState(wy)
  const [filterMonth,     setFilterMonth]     = useState(wm)
  const [filterDay,       setFilterDay]       = useState(wd)
  const [search,          setSearch]          = useState('')
  const [farolFilter,     setFarolFilter]     = useState<Farol | 'todos'>('todos')
  const [naturezaFilter,  setNaturezaFilter]  = useState<Natureza | 'todos'>('todos')

  // Optimistic local status updates
  const [localStatuses, setLocalStatuses] = useState<WeeklyStatus[]>(initialStatuses)

  const [editingCell, setEditingCell] = useState<{ projectId: string; field: EditableField } | null>(null)
  const [editValue,   setEditValue]   = useState('')
  const [pendingEdit, setPendingEdit] = useState<PendingEdit | null>(null)
  const [saving,      setSaving]      = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingCell && textareaRef.current) {
      autoResize(textareaRef.current)
      textareaRef.current.focus()
      const len = textareaRef.current.value.length
      textareaRef.current.setSelectionRange(len, len)
    }
  }, [editingCell])

  const selectedDate       = new Date(filterYear, filterMonth - 1, filterDay)
  const selectedWeekStart  = getWeekStart(selectedDate)
  const selectedWeekEnd    = getWeekEnd(selectedWeekStart)
  const isCurrentWeek      = selectedWeekStart === currentWeekStart
  const maxDay             = daysInMonth(filterYear, filterMonth)

  // Navigate to a different week (triggers server re-fetch via route)
  function navigateToWeek(newWeekStart: string) {
    startTransition(() => {
      router.push(`/status-recorrente?week=${newWeekStart}`)
    })
  }

  function applyDateFilter() {
    if (selectedWeekStart !== weekStart) {
      navigateToWeek(selectedWeekStart)
    }
  }

  function goToToday() {
    const tw = getWeekStart(today)
    setFilterYear(today.getFullYear())
    setFilterMonth(today.getMonth() + 1)
    setFilterDay(today.getDate())
    if (tw !== weekStart) navigateToWeek(tw)
  }

  const filteredProjects = initialProjects.filter(p => {
    const q = search.toLowerCase()
    const matchSearch   = !q || p.nome.toLowerCase().includes(q) || (p.responsavel ?? '').toLowerCase().includes(q)
    const matchFarol    = farolFilter    === 'todos' || p.farol    === farolFilter
    const matchNatureza = naturezaFilter === 'todos' || p.natureza === naturezaFilter
    return matchSearch && matchFarol && matchNatureza
  })

  function getFieldValue(projectId: string, field: EditableField): string {
    return localStatuses.find(s => s.project_id === projectId)?.[field] ?? ''
  }

  function startEdit(projectId: string, field: EditableField) {
    setEditingCell({ projectId, field })
    setEditValue(getFieldValue(projectId, field))
  }

  function finishEdit(projectId: string, field: EditableField) {
    const original = getFieldValue(projectId, field)
    const trimmed  = editValue.split('\n').map(l => l.trimEnd()).filter(l => l.trim()).join('\n')
    const origTrim = original.split('\n').map(l => l.trimEnd()).filter(l => l.trim()).join('\n')
    if (trimmed === origTrim) { setEditingCell(null); return }
    setPendingEdit({ projectId, weekStart, field, newValue: trimmed })
    setEditingCell(null)
  }

  async function confirmSave() {
    if (!pendingEdit) return
    setSaving(true)
    try {
      await upsertWeeklyStatus(pendingEdit.projectId, pendingEdit.weekStart, {
        [pendingEdit.field]: pendingEdit.newValue,
      })
      // Optimistic update
      setLocalStatuses(prev => {
        const idx = prev.findIndex(s => s.project_id === pendingEdit.projectId)
        if (idx >= 0) {
          const updated = [...prev]
          updated[idx] = { ...updated[idx], [pendingEdit.field]: pendingEdit.newValue }
          return updated
        }
        const now = new Date().toISOString()
        return [...prev, {
          id: crypto.randomUUID(),
          project_id:      pendingEdit.projectId,
          week_start:      pendingEdit.weekStart,
          progresso:        pendingEdit.field === 'progresso'        ? pendingEdit.newValue : '',
          proximos_passos:  pendingEdit.field === 'proximos_passos'  ? pendingEdit.newValue : '',
          riscos:           pendingEdit.field === 'riscos'           ? pendingEdit.newValue : '',
          acoes_mitigacao:  pendingEdit.field === 'acoes_mitigacao'  ? pendingEdit.newValue : '',
          created_at: now, updated_at: now,
        }]
      })
      showToast(`${FIELD_LABELS[pendingEdit.field]} atualizado`, 'success')
    } catch {
      showToast('Erro ao salvar alteração', 'error')
    } finally {
      setSaving(false)
      setPendingEdit(null)
    }
  }

  function handleMonthChange(newMonth: number) {
    setFilterMonth(newMonth)
    if (filterDay > daysInMonth(filterYear, newMonth)) setFilterDay(1)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight">Status Recorrente</h1>
            {isCurrentWeek && (
              <span className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}>
                ● Status atual
              </span>
            )}
          </div>
          <p className="text-sm mt-1" style={{ color: 'var(--text2)' }}>
            Semana de <strong>{formatDateBR(weekStart)}</strong> a <strong>{formatDateBR(getWeekEnd(weekStart))}</strong>
            {' · '}{filteredProjects.length} projeto{filteredProjects.length !== 1 ? 's' : ''}
            {isPending && <span className="ml-2 opacity-60">Carregando...</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border p-4 mb-4 space-y-3"
        style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        <div className="flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-1.5">
            <select value={filterDay} onChange={e => setFilterDay(Number(e.target.value))}
              className="rounded-lg border text-sm px-2 py-2 outline-none w-16"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }}>
              {Array.from({ length: maxDay }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
            <span className="text-sm" style={{ color: 'var(--text3)' }}>/</span>
            <select value={filterMonth} onChange={e => handleMonthChange(Number(e.target.value))}
              className="rounded-lg border text-sm px-2 py-2 outline-none w-20"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }}>
              {MONTHS.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
            <span className="text-sm" style={{ color: 'var(--text3)' }}>/</span>
            <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
              className="rounded-lg border text-sm px-2 py-2 outline-none w-20"
              style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <button onClick={applyDateFilter}
              className="text-xs px-2.5 py-2 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: '#6366f1', color: '#818cf8' }}>
              Buscar semana
            </button>
            <button onClick={goToToday}
              className="text-xs px-2.5 py-2 rounded-lg border transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border2)', color: 'var(--text2)' }}>
              Hoje
            </button>
          </div>
          <div className="w-px h-6 self-center hidden sm:block" style={{ background: 'var(--border)' }} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou responsável..."
            className="flex-1 min-w-48 rounded-lg border text-sm px-3 py-2 outline-none focus:border-indigo-500"
            style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }} />
          <select value={naturezaFilter} onChange={e => setNaturezaFilter(e.target.value as Natureza | 'todos')}
            className="rounded-lg border text-sm px-3 py-2 outline-none"
            style={{ background: 'var(--bg3)', borderColor: 'var(--border2)', color: 'var(--text)' }}>
            <option value="todos">Todos (Natureza)</option>
            <option value="backoffice">Backoffice</option>
            <option value="regulatorio">Regulatório</option>
            <option value="negocios">Negócios</option>
            <option value="regional">Regional</option>
          </select>
        </div>
        <div className="flex gap-2 flex-wrap">
          {FAROL_PILLS.map(pill => (
            <button key={pill.value} onClick={() => setFarolFilter(pill.value)}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background:  farolFilter === pill.value ? 'var(--accent)' : 'var(--bg3)',
                borderColor: farolFilter === pill.value ? 'var(--accent)' : 'var(--border2)',
                color:       farolFilter === pill.value ? '#fff' : 'var(--text2)',
                fontWeight:  farolFilter === pill.value ? 600 : 400,
              }}>
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--bg2)', borderColor: 'var(--border)' }}>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12" style={{ color: 'var(--text3)' }}>
            <div className="text-3xl mb-3 opacity-40">🔍</div>
            <p className="text-sm">Nenhum projeto encontrado com esses filtros</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse" style={{ minWidth: '1000px' }}>
              <thead>
                <tr>
                  <th className="text-left px-4 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                    style={{ color: 'var(--text3)', borderColor: 'var(--border)', minWidth: '110px' }}>Farol</th>
                  <th className="text-left px-4 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                    style={{ color: 'var(--text3)', borderColor: 'var(--border)', minWidth: '120px' }}>Natureza</th>
                  <th className="text-left px-4 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                    style={{ color: 'var(--text3)', borderColor: 'var(--border)', minWidth: '200px' }}>Nome do Projeto</th>
                  <th className="text-left px-4 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                    style={{ color: 'var(--text3)', borderColor: 'var(--border)', minWidth: '130px' }}>Responsável</th>
                  {EDITABLE_FIELDS.map(field => (
                    <th key={field} className="text-left px-4 pb-3 pt-4 text-xs font-medium uppercase tracking-wider border-b"
                      style={{ color: 'var(--text3)', borderColor: 'var(--border)', minWidth: '200px' }}>
                      {FIELD_LABELS[field]}
                      <span className="ml-1 normal-case opacity-60" style={{ fontSize: '10px' }}>✏</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map(p => (
                  <tr key={p.id} className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3 align-top"><FarolBadge farol={p.farol} /></td>
                    <td className="px-4 py-3 align-top"><NaturezaBadge natureza={p.natureza} /></td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-sm">{p.nome}</span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="text-sm" style={{ color: 'var(--text2)' }}>{p.responsavel ?? '–'}</span>
                    </td>
                    {EDITABLE_FIELDS.map(field => {
                      const isEditing = editingCell?.projectId === p.id && editingCell?.field === field
                      const value = getFieldValue(p.id, field)
                      return (
                        <td key={field} className="px-3 py-2 align-top">
                          {isEditing ? (
                            <textarea
                              ref={textareaRef}
                              value={editValue}
                              onChange={e => { setEditValue(e.target.value); autoResize(e.target) }}
                              onBlur={() => finishEdit(p.id, field)}
                              onKeyDown={e => {
                                if (e.key === 'Escape') { e.preventDefault(); setEditingCell(null) }
                                if (e.key === 'Enter' && e.ctrlKey) { e.preventDefault(); finishEdit(p.id, field) }
                              }}
                              className="w-full rounded-lg border text-xs p-2 outline-none resize-none overflow-hidden"
                              style={{
                                background:  'var(--bg3)',
                                borderColor: '#6366f1',
                                color:       'var(--text)',
                                minWidth:    '180px',
                                minHeight:   '2.5rem',
                                lineHeight:  '1.5',
                              }}
                            />
                          ) : (
                            <div onClick={() => startEdit(p.id, field)}
                              className="min-h-[2.5rem] rounded-lg px-2 py-1.5 text-xs cursor-pointer group relative transition-colors hover:bg-white/[0.04]"
                              style={{ color: 'var(--text2)' }}
                              title="Clique para editar">
                              <BulletList text={value} />
                              <span className="absolute top-1.5 right-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{ color: 'var(--accent2)' }}>✏</span>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs mt-3" style={{ color: 'var(--text3)' }}>
        ✏ Clique em qualquer célula para editar · <strong>Enter</strong> = nova linha · <strong>Ctrl+Enter</strong> = confirmar · <strong>Esc</strong> = cancelar
      </p>

      <ConfirmModal
        isOpen={pendingEdit !== null}
        title="Confirmar Alteração"
        message="Deseja confirmar essa alteração?"
        confirmLabel={saving ? 'Salvando...' : 'Sim'}
        onConfirm={confirmSave}
        onCancel={() => setPendingEdit(null)}
      />
    </div>
  )
}
