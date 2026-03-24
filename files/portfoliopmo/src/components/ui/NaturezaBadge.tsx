// src/components/ui/NaturezaBadge.tsx
import type { Natureza } from '@/types'
import { NATUREZA_LABELS } from '@/types'

const STYLES: Record<Natureza, { bg: string; color: string }> = {
  backoffice:  { bg: 'rgba(99,102,241,0.15)', color: '#818cf8' },
  regulatorio: { bg: 'rgba(234,179,8,0.12)',  color: '#ca8a04' },
  negocios:    { bg: 'rgba(20,184,166,0.12)', color: '#0d9488' },
  regional:    { bg: 'rgba(168,85,247,0.12)', color: '#a855f7' },
}

export function NaturezaBadge({ natureza }: { natureza: Natureza }) {
  const s = STYLES[natureza]
  return (
    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      {NATUREZA_LABELS[natureza]}
    </span>
  )
}
