// src/components/ui/FarolBadge.tsx
import type { Farol } from '@/types'
import { FAROL_LABELS } from '@/types'

const STYLES: Record<Farol, { bg: string; color: string; border: string; dot: string }> = {
  verde:    { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e', border: 'rgba(34,197,94,0.25)',  dot: '#22c55e' },
  amarelo:  { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: 'rgba(245,158,11,0.25)', dot: '#f59e0b' },
  vermelho: { bg: 'rgba(239,68,68,0.12)',  color: '#ef4444', border: 'rgba(239,68,68,0.25)',  dot: '#ef4444' },
  azul:     { bg: 'rgba(59,130,246,0.12)', color: '#3b82f6', border: 'rgba(59,130,246,0.25)', dot: '#3b82f6' },
}

export function FarolBadge({ farol }: { farol: Farol }) {
  const s = STYLES[farol]
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border"
      style={{ background: s.bg, color: s.color, borderColor: s.border }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.dot }} />
      {FAROL_LABELS[farol]}
    </span>
  )
}
