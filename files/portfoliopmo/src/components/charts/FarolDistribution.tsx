'use client'
// src/components/charts/FarolDistribution.tsx

import type { DashboardStats, Farol, Natureza } from '@/types'
import { NATUREZA_LABELS, FAROL_COLORS } from '@/types'

const NAT_COLORS: Record<Natureza, string> = {
  backoffice:  '#818cf8',
  regulatorio: '#ca8a04',
  negocios:    '#0d9488',
  regional:    '#a855f7',
}

export function FarolDistribution({ stats }: { stats: DashboardStats }) {
  const total = stats.total || 1
  const farois: { key: Farol; label: string; emoji: string }[] = [
    { key: 'verde',    label: 'Verde',    emoji: '🟢' },
    { key: 'amarelo',  label: 'Amarelo',  emoji: '🟡' },
    { key: 'vermelho', label: 'Vermelho', emoji: '🔴' },
    { key: 'azul',     label: 'Azul',     emoji: '🔵' },
  ]

  return (
    <div>
      {/* Farol bars */}
      <div className="space-y-3 mb-6">
        {farois.map(f => {
          const count = stats.porFarol[f.key]
          const pct = Math.round((count / total) * 100)
          return (
            <div key={f.key} className="flex items-center gap-3">
              <span className="text-xs w-20 flex-shrink-0" style={{ color: FAROL_COLORS[f.key] }}>
                {f.emoji} {f.label}
              </span>
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, background: FAROL_COLORS[f.key] }}
                />
              </div>
              <span className="text-xs font-mono w-5 text-right" style={{ color: 'var(--text2)' }}>
                {count}
              </span>
            </div>
          )
        })}
      </div>

      {/* Natureza dist */}
      <div className="border-t pt-5" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text3)' }}>
          Por Natureza
        </p>
        <div className="space-y-2">
          {(Object.entries(stats.porNatureza) as [Natureza, number][])
            .filter(([, v]) => v > 0)
            .map(([k, v]) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: NAT_COLORS[k] }} />
                <span className="flex-1 text-xs" style={{ color: 'var(--text2)' }}>
                  {NATUREZA_LABELS[k]}
                </span>
                <span className="text-xs font-mono" style={{ color: 'var(--text2)' }}>{v}</span>
              </div>
            ))}
          {stats.total === 0 && (
            <p className="text-xs" style={{ color: 'var(--text3)' }}>–</p>
          )}
        </div>
      </div>
    </div>
  )
}
