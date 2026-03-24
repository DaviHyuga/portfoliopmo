// src/components/ui/ProgressBar.tsx
import type { Farol } from '@/types'
import { FAROL_COLORS } from '@/types'

export function ProgressBar({ value, farol }: { value: number; farol: Farol }) {
  const color = FAROL_COLORS[farol]
  return (
    <div className="flex items-center gap-2.5 min-w-36">
      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg4)' }}>
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${value}%`, background: color }} />
      </div>
      <span className="text-xs font-mono w-8 text-right" style={{ color: 'var(--text2)' }}>
        {value}%
      </span>
    </div>
  )
}
